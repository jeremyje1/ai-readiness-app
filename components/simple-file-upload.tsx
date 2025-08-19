/**
 * Simple File Upload Component for Dashboard
 * Basic drag & drop interface for document uploads during trial
 */

'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface SimpleFileUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSize?: string;
  disabled?: boolean;
}

export function SimpleFileUpload({ 
  onUpload, 
  maxFiles = 5, 
  acceptedTypes = '.pdf,.doc,.docx,.txt,.csv,.xlsx',
  maxSize = '10MB',
  disabled = false 
}: SimpleFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (disabled) return;
    
    const validFiles = files.slice(0, maxFiles);
    const fileNames = validFiles.map(f => f.name);
    
    setUploadedFiles(prev => [...prev, ...fileNames]);
    onUpload(validFiles);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(name => name !== fileName));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-3">
          <Upload className={`h-12 w-12 mx-auto ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop files here' : 'Upload institutional documents'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop files here, or click to browse
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <p>Supported: PDF, Word, Excel, CSV, Text files</p>
            <p>Maximum {maxFiles} files, up to {maxSize} each</p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((fileName, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{fileName}</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileName);
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">💡 Recommended Documents to Upload:</h5>
        <ul className="space-y-1 text-blue-800">
          <li>• Strategic plans and institutional mission statements</li>
          <li>• Current technology and AI-related policies</li>
          <li>• Faculty handbooks and governance documents</li>
          <li>• Student codes of conduct and academic policies</li>
          <li>• IT security policies and data management procedures</li>
          <li>• Recent accreditation reports or self-studies</li>
        </ul>
        <p className="mt-3 text-blue-700 font-medium">
          📈 Uploading these documents will enhance your AI readiness analysis and provide more targeted recommendations.
        </p>
      </div>
    </div>
  );
}
