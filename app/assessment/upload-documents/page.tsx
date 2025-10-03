'use client';

import AIReadinessDocumentUploader from '@/components/AIReadinessDocumentUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AssessmentUploadDocumentsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/get-started');
            return;
        }
        setUserId(user.id);

        // Check if assessment was completed
        const { data: assessment } = await supabase
            .from('streamlined_assessment_responses')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!assessment) {
            // If no assessment found, redirect back to assessment
            router.push('/assessment');
        }
    };

    const handleDocumentsAnalyzed = (documents: any[]) => {
        setUploadedFiles(documents);
    };

    const handleSkip = () => {
        router.push('/dashboard/personalized');
    };

    const handleContinue = async () => {
        setLoading(true);
        try {
            // Log the document upload completion
            if (userId) {
                await supabase.from('user_activity_log').insert({
                    user_id: userId,
                    activity_type: 'documents_uploaded',
                    activity_data: { fileCount: uploadedFiles.length },
                });
            }

            router.push('/dashboard/personalized');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/assessment')}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assessment
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Upload Your Institution Documents</CardTitle>
                        <CardDescription>
                            Upload key documents to help us create a personalized AI roadmap for your institution.
                            This step is optional but highly recommended for the best results.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Success Message if Assessment Complete */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-green-900">Assessment Complete!</p>
                                    <p className="text-sm text-green-700">
                                        Your assessment has been saved. Now upload documents for enhanced personalization.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Document Types Guide */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                Recommended Documents
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• Strategic Plan or Vision Document</li>
                                <li>• Current AI or Technology Policy (if available)</li>
                                <li>• Faculty/Staff Handbook</li>
                                <li>• Student Handbook or Code of Conduct</li>
                                <li>• Technology Plan or Digital Strategy</li>
                            </ul>
                        </div>

                        {/* File Uploader */}
                        <AIReadinessDocumentUploader
                            onDocumentsAnalyzed={handleDocumentsAnalyzed}
                            maxFiles={5}
                            acceptedTypes={['.pdf', '.docx', '.doc', '.txt']}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={handleSkip}
                                disabled={loading}
                            >
                                Skip for Now
                            </Button>

                            <Button
                                onClick={handleContinue}
                                disabled={loading || uploadedFiles.length === 0}
                            >
                                {loading ? 'Processing...' : `Continue with ${uploadedFiles.length} Document${uploadedFiles.length !== 1 ? 's' : ''}`}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}