// components/ui/file-drop.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FileDropProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Fires when files are selected or dropped */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFiles?: (_files: FileList) => void;
}

export function FileDrop({
  onFiles,
  className,
  multiple = true,
  ...props
}: FileDropProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(
    null,
  );
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
      onFiles?.(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      setSelectedFiles(e.dataTransfer.files);
      onFiles?.(e.dataTransfer.files);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
              'flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-center text-sm text-gray-500 hover:bg-gray-50',
        className,
      )}
    >
      <p>Drag & drop or click to upload</p>
      {selectedFiles && (
        <ul className="mt-2 text-xs text-neutral-600">
          {Array.from(selectedFiles).map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        onChange={handleSelect}
        className="hidden"
        {...props}
      />
    </div>
  );
}