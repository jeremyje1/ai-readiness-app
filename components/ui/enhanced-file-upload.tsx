/**
 * Enhanced File Upload Component for One-Time Diagnostic Package
 * Professional-grade drag & drop interface with validation and preview
 * 
 * @version 2.0.0
 * @author NorthPath Strategies
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  FileText, 
  FileSpreadsheet, 
  Image,
  Archive,
  X,
  Check,
  AlertCircle,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

interface EnhancedFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  '.csv', '.xlsx', '.xls', 
  '.pdf', '.docx', '.doc',
  '.png', '.jpg', '.jpeg',
  '.zip'
];

const FILE_TYPE_ICONS = {
  'text/csv': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/pdf': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/msword': FileText,
  'image/png': Image,
  'image/jpeg': Image,
  'image/jpg': Image,
  'application/zip': Archive,
  'default': File
};

export function EnhancedFileUpload({
  onFilesSelected,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = 50, // 50MB default - increased for larger institutional documents
  maxFiles = 5,
  className,
  disabled = false
}: EnhancedFileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  const processFiles = useCallback(async (fileList: FileList) => {
    const newErrors: string[] = [];
    const validFiles: FileWithPreview[] = [];

    // Check total file count
    if (files.length + fileList.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed. You're trying to add ${fileList.length} files to ${files.length} existing files.`);
      setErrors(newErrors);
      return;
    }

    // Process each file
    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        newErrors.push(validationError);
      } else {
        const fileWithPreview: FileWithPreview = {
          ...file,
          id: crypto.randomUUID(),
          status: 'uploading',
          progress: 0
        };
        validFiles.push(fileWithPreview);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    
    // Add files to state
    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);

    // Simulate upload progress
    validFiles.forEach((file, index) => {
      simulateUpload(file.id, index * 200); // Stagger uploads
    });

    // Notify parent component
    onFilesSelected([...files.map(f => f as File), ...validFiles]);
  }, [files, maxFiles, validateFile, onFilesSelected]);

  const simulateUpload = (fileId: string, delay: number = 0) => {
    setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'completed', progress: 100 }
              : file
          ));
        } else {
          setFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, progress }
              : file
          ));
        }
      }, 100);
    }, delay);
  };

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  }, [files, onFilesSelected]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const getFileIcon = (file: FileWithPreview) => {
    const IconComponent = (FILE_TYPE_ICONS as Record<string, any>)[file.type] || FILE_TYPE_ICONS.default;
    return IconComponent;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
          isDragOver && !disabled
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-400"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/20"
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={cn(
              "h-12 w-12 transition-colors",
              isDragOver && !disabled 
                ? "text-blue-500" 
                : "text-gray-400"
            )} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isDragOver ? 'Drop files here' : 'Upload organizational files'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop or click to select files
            </p>
            <p className="text-xs text-gray-500">
              Accepted formats: {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file • Up to {maxFiles} files
            </p>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            disabled={disabled}
            className="mx-auto"
          >
            Choose Files
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Upload errors:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            
            <div className="space-y-2">
              {files.map((file) => {
                const IconComponent = getFileIcon(file);
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <IconComponent className="h-6 w-6 text-gray-500 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {file.status === 'uploading' && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {file.status === 'completed' && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {file.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {files.filter(f => f.status === 'completed').length} of {files.length} files uploaded successfully
            </p>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
            Your organizational data is being processed for analysis
          </p>
        </div>
      )}
    </div>
  );
}

export default EnhancedFileUpload;
