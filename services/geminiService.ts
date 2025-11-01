import { GoogleGenAI, Type } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const identifyAircraftAndDescribe = async (files: File[]): Promise<{ success: boolean; name: string; description: string; error?: string }[]> => {
    if (!process.env.API_KEY) {
        return files.map(() => ({ success: false, name: '', description: '', error: "API key is not configured." }));
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = await Promise.all(files.map(fileToGenerativePart));

    const fullPrompt = `For each of the following images:
    1. Identify the primary aircraft model. If it's unidentifiable, use "unknown".
    2. Write a brief, one-sentence description of the image, focusing on the aircraft and its activity.

    Return a JSON array of objects, one for each image. Each object must have "aircraftName" and "description" properties.
    Do not include file extensions in the aircraftName.
    Example: [{"aircraftName": "Boeing 747", "description": "A jumbo jet taking off against a sunset."}, {"aircraftName": "unknown", "description": "A blurry photo of an airport tarmac."}]
    There are ${files.length} images. Provide ${files.length} results.
    `;
    
    const contents = [...imageParts, { text: fullPrompt }];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: contents },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            aircraftName: {
                                type: Type.STRING,
                                description: 'The identified aircraft name, or "unknown". Without extension.',
                            },
                            description: {
                                type: Type.STRING,
                                description: 'A brief, one-sentence description of the image.',
                            },
                        },
                        required: ['aircraftName', 'description'],
                    },
                },
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        if (Array.isArray(result) && result.length === files.length) {
            return result.map(item => ({ success: true, name: item.aircraftName, description: item.description }));
        } else {
             return files.map(() => ({ success: false, name: '', description: '', error: "AI returned unexpected format." }));
        }

    } catch (error) {
        console.error("Gemini API error:", error);
        return files.map(() => ({ success: false, name: '', description: '', error: "API request failed." }));
    }
};