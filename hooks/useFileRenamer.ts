import { useState } from 'react';
import { FileInfo } from '../types';
import { identifyAircraftAndDescribe } from '../services/geminiService';

const BATCH_SIZE = 20;

export const useFileRenamer = () => {
  const [filesInfo, setFilesInfo] = useState<FileInfo[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const getFileExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0) return '';
    return filename.substring(lastDot);
  };
  
  const getFileNameWithoutExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0) return filename;
    return filename.substring(0, lastDot);
  };

  const setFiles = (files: File[]) => {
    if (files.length > 2000) {
        alert("You can upload a maximum of 2000 files.");
        return;
    }
    const newFilesInfo = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      originalFile: file,
      originalName: file.name,
      newName: file.name,
      extension: getFileExtension(file.name),
      status: 'pending' as const,
      description: '',
    }));
    setFilesInfo(newFilesInfo);
  };
  
  const handleRename = async () => {
    setIsRenaming(true);
    setProgressMessage('Starting analysis...');
    setFilesInfo(prev => prev.map(f => f.originalFile.type.startsWith('image/') 
      ? { ...f, status: 'loading', errorMessage: undefined, description: '' }
      : f
    ));

    try {
        const imageFiles = filesInfo.filter(f => f.originalFile.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            setFilesInfo(prev => prev.map(f => ({...f, status: 'error', errorMessage: 'No images found for AI processing.'})));
            setIsRenaming(false);
            setProgressMessage('');
            return;
        }

        const allResults: Awaited<ReturnType<typeof identifyAircraftAndDescribe>> = [];
        for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
            const batch = imageFiles.slice(i, i + BATCH_SIZE);
            const progress = i + batch.length;
            setProgressMessage(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(imageFiles.length / BATCH_SIZE)}... (${progress}/${imageFiles.length} files)`);
            
            const batchFiles = batch.map(f => f.originalFile);
            const batchResults = await identifyAircraftAndDescribe(batchFiles);
            allResults.push(...batchResults);
        }
        
        setProgressMessage('Finalizing names...');

        // Sanitize and count names for sequential numbering across all results
        const nameCounts: { [key: string]: number } = {};
        const sanitizedNames = allResults.map(result => {
            if (!result.success || !result.name || result.name.toLowerCase() === 'unknown') {
                return 'unknown';
            }
            const sanitized = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (sanitized) {
                nameCounts[sanitized] = (nameCounts[sanitized] || 0) + 1;
            }
            return sanitized || 'unknown';
        });

        // Apply sequential numbers
        const sequenceTrackers: { [key: string]: number } = {};
        const finalNames = sanitizedNames.map(name => {
            if (name === 'unknown' || nameCounts[name] <= 1) {
                return name;
            }
            sequenceTrackers[name] = (sequenceTrackers[name] || 0) + 1;
            return `${name}-${sequenceTrackers[name]}`;
        });
        
        setFilesInfo(prev => {
            let resultIndex = 0;
            return prev.map(fileInfo => {
                if (fileInfo.originalFile.type.startsWith('image/')) {
                    const result = allResults[resultIndex];
                    const finalName = finalNames[resultIndex];
                    resultIndex++;

                    if (result.success) {
                        const newNameWithoutExt = finalName === 'unknown' 
                            ? getFileNameWithoutExtension(fileInfo.originalName) 
                            : finalName;
                        return {
                            ...fileInfo,
                            newName: `${newNameWithoutExt}${fileInfo.extension}`,
                            description: result.description,
                            status: 'done' as const,
                        };
                    } else {
                        return {
                            ...fileInfo,
                            status: 'error' as const,
                            errorMessage: result.error,
                        };
                    }
                }
                return fileInfo; // Keep non-image files as they are
            });
        });

    } catch (error) {
        console.error('Aircraft ID & Describe failed:', error);
        setFilesInfo(prev => prev.map(f => f.originalFile.type.startsWith('image/') 
            ? { ...f, status: 'error', errorMessage: 'An API error occurred during batch processing.' } 
            : f
        ));
    } finally {
        setIsRenaming(false);
        setProgressMessage('');
    }
  };


  return {
    filesInfo,
    setFiles,
    handleRename,
    isRenaming,
    progressMessage,
  };
};