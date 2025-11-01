import React from 'react';
import { FileInfo } from '../types';
import { FileIcon, ImageIcon, AlertTriangleIcon, CheckCircleIcon, ArrowRightIcon, LoaderIcon } from './icons';

interface FilePreviewProps {
  filesInfo: FileInfo[];
  isRenaming: boolean;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />;
  }
  return <FileIcon className="w-8 h-8 text-text-secondary flex-shrink-0" />;
};

const FilePreview: React.FC<FilePreviewProps> = ({ filesInfo, isRenaming }) => {
  if (filesInfo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-surface border border-border rounded-lg p-8">
        <ImageIcon className="w-24 h-24 text-secondary mb-4" />
        <h3 className="text-xl font-semibold text-text-primary">No files selected</h3>
        <p className="text-text-secondary mt-2">Select some files to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">File Preview ({filesInfo.length})</h2>
      </div>
      <div className="divide-y divide-border">
        {filesInfo.map((fileInfo) => (
          <div key={fileInfo.id} className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                {/* Original Name */}
                <div className="flex items-start gap-3 min-w-0">
                    {getFileIcon(fileInfo.originalFile.type)}
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm text-text-secondary">Original</p>
                        <span className="truncate text-text-primary" title={fileInfo.originalName}>
                            {fileInfo.originalName}
                        </span>
                    </div>
                </div>

                {/* New Name */}
                <div className="flex items-start gap-3 min-w-0">
                    <ArrowRightIcon className="w-8 h-8 text-text-secondary flex-shrink-0 hidden md:block" />
                     <div className="flex flex-col min-w-0 flex-grow">
                        <p className="text-sm text-text-secondary">New Name</p>
                        <div className="flex items-center gap-2">
                             <span className="truncate font-mono text-primary" title={fileInfo.newName}>
                                {fileInfo.newName}
                            </span>
                            {fileInfo.status === 'loading' && <LoaderIcon className="w-5 h-5 text-primary animate-spin" />}
                            {fileInfo.status === 'done' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                            {fileInfo.status === 'error' && <AlertTriangleIcon className="w-5 h-5 text-red-500" title={fileInfo.errorMessage}/>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {fileInfo.description && (
                <div className="pl-0 md:pl-11 pt-2 border-t border-background mt-3">
                    <p className="text-sm text-text-secondary italic">
                        <span className="font-semibold not-italic">Description:</span> {fileInfo.description}
                    </p>
                </div>
            )}
             {fileInfo.status === 'error' && fileInfo.errorMessage && (
                <div className="pl-0 md:pl-11 pt-2 border-t border-background mt-3">
                    <p className="text-sm text-red-400">
                        <span className="font-semibold">Error:</span> {fileInfo.errorMessage}
                    </p>
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;