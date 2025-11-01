export interface FileInfo {
  id: string;
  originalFile: File;
  originalName: string;
  newName: string;
  extension: string;
  status: 'pending' | 'loading' | 'done' | 'error';
  errorMessage?: string;
  description?: string;
}
