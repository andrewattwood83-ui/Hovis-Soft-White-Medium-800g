import React, { useState } from 'react';
import { useFileRenamer } from './hooks/useFileRenamer';
import FileSelector from './components/FileSelector';
import RenameControls from './components/RenameControls';
import FilePreview from './components/FilePreview';
import { DownloadIcon, LogoIcon } from './components/icons';
import JSZip from 'jszip';

const App: React.FC = () => {
  const {
    filesInfo,
    setFiles,
    handleRename,
    isRenaming,
    progressMessage,
  } = useFileRenamer();
  
  const [isZipping, setIsZipping] = useState(false);
  const [zipFileName, setZipFileName] = useState('renamed-files');

  const handleDownload = async () => {
    if (filesInfo.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      filesInfo.forEach(fileInfo => {
        zip.file(fileInfo.newName, fileInfo.originalFile);
      });

      const imageFiles = filesInfo.filter(f => f.originalFile.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        let descriptionContent = 'File Descriptions\n=================\n\n';
        imageFiles.forEach(fileInfo => {
            descriptionContent += `${fileInfo.newName}: ${fileInfo.description || 'No description generated.'}\n`;
        });
        zip.file('descriptions.txt', descriptionContent);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${zipFileName.trim() || 'renamed-files'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error zipping files:", error);
      alert("An error occurred while creating the zip file.");
    } finally {
      setIsZipping(false);
    }
  };

  const canDownload = filesInfo.length > 0 && !isRenaming && !isZipping && filesInfo.every(f => f.newName !== '') && !!zipFileName.trim();

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="bg-surface/50 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">AI Aircraft Identifier</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-6">
              <FileSelector onFilesSelected={setFiles} />
              <RenameControls
                onRename={handleRename}
                isRenaming={isRenaming}
                hasFiles={filesInfo.length > 0}
                progressMessage={progressMessage}
              />
            </div>
          </div>
          
          <div className="lg:col-span-8 xl:col-span-9">
            <FilePreview filesInfo={filesInfo} isRenaming={isRenaming} />
          </div>
        </div>
      </main>
      
      {filesInfo.length > 0 && (
         <footer className="sticky bottom-0 bg-surface/80 backdrop-blur-sm mt-8 py-4 px-4 md:px-8 border-t border-border">
          <div className="container mx-auto flex flex-col sm:flex-row justify-end items-center gap-4">
             <div className="flex items-center w-full sm:w-auto">
                <label htmlFor="zipFileName" className="text-sm font-medium text-text-secondary whitespace-nowrap mr-2">
                    Archive name:
                </label>
                <input
                    id="zipFileName"
                    type="text"
                    value={zipFileName}
                    onChange={(e) => setZipFileName(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 focus:ring-primary focus:border-primary w-full sm:w-48 transition-colors"
                    placeholder="e.g., my-renamed-files"
                />
            </div>
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isZipping ? 'Zipping...' : <><DownloadIcon className="w-5 h-5" /> Download as .zip</>}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;