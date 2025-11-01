
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons';

interface FileSelectorProps {
  onFilesSelected: (files: File[]) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesSelected]);

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ${isDragging ? 'border-primary bg-teal-900/20' : 'border-border hover:border-primary'}`}
    >
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <UploadCloudIcon className="w-10 h-10 mx-auto text-text-secondary mb-2" />
        <p className="text-text-primary font-semibold">Click to select files</p>
        <p className="text-sm text-text-secondary">or drag and drop</p>
      </label>
    </div>
  );
};

export default FileSelector;
