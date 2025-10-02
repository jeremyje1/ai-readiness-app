'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface UploadedDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_size: number;
  processing_status: string;
  upload_date: string;
}

const DOCUMENT_TYPES = [
  {
    type: 'strategic_plan',
    label: 'Strategic Plan',
    description: 'Your institution\'s strategic plan or vision document',
    icon: '🎯',
    required: true,
  },
  {
    type: 'ai_policy',
    label: 'Current AI Policy',
    description: 'Existing AI policies or guidelines (if available)',
    icon: '📋',
    required: false,
  },
  {
    type: 'faculty_handbook',
    label: 'Faculty Handbook',
    description: 'Faculty policies, procedures, and guidelines',
    icon: '👨‍🏫',
    required: false,
  },
  {
    type: 'tech_plan',
    label: 'Technology Plan',
    description: 'IT strategic plan or technology roadmap',
    icon: '💻',
    required: false,
  },
  {
    type: 'student_handbook',
    label: 'Student Handbook',
    description: 'Student policies, code of conduct, or handbook',
    icon: '📚',
    required: false,
  },
];

export default function UploadDocumentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUserId(user.id);
    loadExistingDocuments(user.id);
  };

  const loadExistingDocuments = async (uid: string) => {
    const { data, error } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('user_id', uid)
      .order('upload_date', { ascending: false });

    if (data) {
      setUploadedDocs(data);
    }
  };

  const handleFileSelect = async (documentType: string, file: File) => {
    if (!userId) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload PDF or Word documents only');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploading(documentType);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('user_id', userId);

      // Upload to API
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Reload documents
      await loadExistingDocuments(userId);

      // Log activity
      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'document_uploaded',
        activity_data: {
          document_type: documentType,
          file_name: file.name,
          file_size: file.size,
        },
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(documentType, file);
    }
  };

  const handleDragOver = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const getUploadedDoc = (docType: string) => {
    return uploadedDocs.find(doc => doc.document_type === docType);
  };

  const handleAnalyze = async () => {
    if (!userId) return;
    setAnalyzing(true);

    try {
      // Trigger AI analysis
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      // Log activity
      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'analysis_started',
        activity_data: { document_count: uploadedDocs.length },
      });

      // Redirect to dashboard
      router.push('/dashboard/personalized');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to start analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const hasRequiredDocuments = () => {
    return DOCUMENT_TYPES
      .filter(dt => dt.required)
      .every(dt => getUploadedDoc(dt.type));
  };

  const canProceed = uploadedDocs.length >= 2 && hasRequiredDocuments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Documents</h1>
          <p className="text-gray-600">
            Upload 2-5 key institutional documents. Our AI will analyze them to create your personalized roadmap.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Upload Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Cards */}
        <div className="space-y-4 mb-8">
          {DOCUMENT_TYPES.map((docType) => {
            const uploadedDoc = getUploadedDoc(docType.type);
            const isUploading = uploading === docType.type;
            const isDragOver = dragOver === docType.type;

            return (
              <Card
                key={docType.type}
                className={`transition-all ${
                  isDragOver ? 'border-indigo-500 bg-indigo-50' : ''
                } ${uploadedDoc ? 'border-green-500 bg-green-50' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{docType.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {docType.label}
                            {docType.required && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{docType.description}</p>
                        </div>
                        {uploadedDoc && (
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      {uploadedDoc ? (
                        <div className="mt-3 p-3 bg-white rounded border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{uploadedDoc.file_name}</p>
                              <p className="text-xs text-gray-500">
                                {(uploadedDoc.file_size / 1024).toFixed(0)} KB
                                {uploadedDoc.processing_status === 'processing' && ' • Processing...'}
                                {uploadedDoc.processing_status === 'completed' && ' • Ready'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Allow re-upload
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.doc,.docx';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) handleFileSelect(docType.type, file);
                              };
                              input.click();
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <div
                          onDrop={(e) => handleDrop(e, docType.type)}
                          onDragOver={(e) => handleDragOver(e, docType.type)}
                          onDragLeave={handleDragLeave}
                          className={`mt-3 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragOver
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                              <p className="text-sm text-gray-600">Uploading...</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">
                                Drag and drop or{' '}
                                <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                                  browse
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileSelect(docType.type, file);
                                    }}
                                  />
                                </label>
                              </p>
                              <p className="text-xs text-gray-500">PDF or Word documents, max 10MB</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="mb-8 bg-indigo-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Upload Progress</h3>
                <p className="text-sm text-gray-600">
                  {uploadedDocs.length} of 5 documents uploaded
                  {canProceed ? ' • Ready to analyze!' : ' • Upload at least 2 documents to continue'}
                </p>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {uploadedDocs.length}/5
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/assessment/streamlined')}
          >
            Back to Assessment
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/personalized')}
              disabled={uploadedDocs.length === 0}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!canProceed || analyzing}
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Documents...
                </>
              ) : (
                <>
                  Start AI Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            What happens next?
          </h4>
          <ul className="text-sm text-gray-700 space-y-2 ml-7">
            <li>• Our AI analyzes your documents against the NIST AI RMF framework</li>
            <li>• Identifies gaps in governance, policy, and implementation</li>
            <li>• Generates a personalized 15-page gap analysis report</li>
            <li>• Creates custom 30/60/90-day implementation roadmaps</li>
            <li>• Analysis typically completes in 2-3 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
