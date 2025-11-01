import React from 'react';
import { AirplaneIcon } from './icons';

interface RenameControlsProps {
  onRename: () => void;
  isRenaming: boolean;
  hasFiles: boolean;
  progressMessage: string;
}

const RenameControls: React.FC<RenameControlsProps> = ({
  onRename,
  isRenaming,
  hasFiles,
  progressMessage,
}) => {
  return (
    <div className="bg-surface p-4 rounded-lg border border-border">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Aircraft Identifier</h3>
        <p className="text-sm text-text-secondary">
          Identifies aircraft in your images, renames the files, and adds a brief description.
          It will add sequential numbers for duplicate aircraft types.
        </p>
        <button 
          onClick={onRename} 
          disabled={isRenaming || !hasFiles} 
          className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <AirplaneIcon className="w-5 h-5" />
          {isRenaming ? 'Analyzing Images...' : 'Identify & Describe'}
        </button>
        {isRenaming && progressMessage && (
            <p className="text-sm text-center text-text-secondary animate-pulse">{progressMessage}</p>
        )}
      </div>
    </div>
  );
};

export default RenameControls;