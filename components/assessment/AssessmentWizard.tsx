/**
 * Assessment 2.0 UI Wizard
 * Document-in, Policy-out interface
 * @version 2.0.0
 */

'use client'

import { AssessmentTutorialTrigger } from '@/components/TutorialTrigger'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    AlertCircle,
    BarChart3,
    CheckCircle,
    Download,
    Eye,
    FileText,
    Settings,
    Upload,
    Users
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface AssessmentWizardProps {
    organizationId: string
    userId: string
}

interface ProcessingStatus {
    document: any
    processing: {
        progress: number
        stage: string
        estimatedCompletionTime: string | null
    }
    assessment: any
}

const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ organizationId, userId }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [documentId, setDocumentId] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)
    const [status, setStatus] = useState<ProcessingStatus | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [settings, setSettings] = useState({
        enablePIIRedaction: true,
        frameworks: ['AIRIX', 'AIRS', 'AICS', 'AIMS', 'AIPS', 'AIBS'],
        artifactTypes: ['gap-report', 'policy-redline', 'board-deck'],
        strictMode: false
    })

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0])
            setError(null)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'text/plain': ['.txt']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false
    })

    const uploadDocument = async () => {
        if (!uploadedFile) return

        setProcessing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', uploadedFile)
            formData.append('organizationId', organizationId)
            formData.append('userId', userId)
            formData.append('settings', JSON.stringify(settings))

            const response = await fetch('/api/assessment-2', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            setDocumentId(result.documentId)
            setCurrentStep(2)

            // Start polling for status
            pollStatus(result.documentId)

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setProcessing(false)
        }
    }

    const pollStatus = async (docId: string) => {
        try {
            const response = await fetch(`/api/assessment-2/status/${docId}`)
            const result = await response.json()

            if (response.ok) {
                setStatus(result)

                if (result.processing.stage === 'completed') {
                    setCurrentStep(3)
                } else if (result.processing.stage === 'failed') {
                    setError(result.document.errorMessage || 'Processing failed')
                } else {
                    // Continue polling
                    setTimeout(() => pollStatus(docId), 3000)
                }
            }
        } catch (error) {
            console.error('Status polling error:', error)
            setTimeout(() => pollStatus(docId), 5000) // Retry after longer delay
        }
    }

    const downloadArtifact = async (artifactType: string) => {
        if (!documentId) return

        try {
            const response = await fetch(`/api/assessment-2/status/${documentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artifactType })
            })

            const result = await response.json()

            if (response.ok && result.artifact?.downloadUrl) {
                // In a real implementation, this would trigger a file download
                window.open(result.artifact.downloadUrl, '_blank')
            }
        } catch (error) {
            console.error('Download error:', error)
        }
    }

    const resetWizard = () => {
        setCurrentStep(1)
        setUploadedFile(null)
        setDocumentId(null)
        setStatus(null)
        setError(null)
        setProcessing(false)
    }

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />
            case 'processing': return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
        }
    }

    const getComplianceBadgeColor = (level: string) => {
        switch (level) {
            case 'full': return 'bg-green-100 text-green-800'
            case 'substantial': return 'bg-blue-100 text-blue-800'
            case 'partial': return 'bg-yellow-100 text-yellow-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6" data-testid="assessment-wizard">
            <div className="text-center mb-8 relative">
                <div className="absolute top-0 right-0">
                    <AssessmentTutorialTrigger showNewBadge={true} variant="floating" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Assessment 2.0 – Document‑in, Policy‑out
                </h1>
                <p className="text-lg text-gray-600">
                    Upload your AI governance documents and receive comprehensive policy analysis
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                {[
                    { step: 1, label: 'Upload', icon: Upload },
                    { step: 2, label: 'Process', icon: Settings },
                    { step: 3, label: 'Results', icon: BarChart3 }
                ].map(({ step, label, icon: Icon }) => (
                    <div key={step} className="flex items-center space-x-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={`font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                            {label}
                        </span>
                        {step < 3 && <div className="w-8 h-0.5 bg-gray-300" />}
                    </div>
                ))}
            </div>

            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Step 1: Upload */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>Upload Document</span>
                        </CardTitle>
                        <CardDescription>
                            Upload your AI governance policy, procedure document, or related materials for analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            {uploadedFile ? (
                                <div>
                                    <p className="text-lg font-medium text-gray-900">{uploadedFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg text-gray-600 mb-2">
                                        {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supports PDF, DOCX, PPTX, images, and text files (max 10MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {uploadedFile && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Processing Settings</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enablePIIRedaction}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, enablePIIRedaction: e.target.checked }))}
                                                    className="rounded"
                                                />
                                                <span>Enable PII Redaction</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.strictMode}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, strictMode: e.target.checked }))}
                                                    className="rounded"
                                                />
                                                <span>Strict Compliance Mode</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={uploadDocument}
                                    disabled={processing}
                                    className="w-full"
                                    size="lg"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Start Analysis
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Processing */}
            {currentStep === 2 && status && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            {getStageIcon(status.processing.stage)}
                            <span>Processing Document</span>
                        </CardTitle>
                        <CardDescription>
                            Analyzing your document for AI governance compliance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{status.processing.progress}%</span>
                            </div>
                            <Progress value={status.processing.progress} className="w-full" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Document OCR', status: status.processing.progress > 0 ? 'completed' : 'pending' },
                                { label: 'PII Detection', status: status.processing.progress > 25 ? 'completed' : 'pending' },
                                { label: 'Framework Mapping', status: status.processing.progress > 50 ? 'completed' : 'pending' },
                                { label: 'Artifact Generation', status: status.processing.progress > 75 ? 'completed' : 'pending' }
                            ].map((item) => (
                                <div key={item.label} className="text-center p-3 border rounded-lg">
                                    {getStageIcon(item.status)}
                                    <p className="text-xs mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {status.processing.estimatedCompletionTime && (
                            <p className="text-sm text-gray-600 text-center">
                                Estimated completion: {new Date(status.processing.estimatedCompletionTime).toLocaleTimeString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Results */}
            {currentStep === 3 && status?.assessment && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Analysis Complete</span>
                            </CardTitle>
                            <CardDescription>
                                Your AI governance assessment is ready for review
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Math.round((status.assessment.overallScore || 0) * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Overall Score</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Badge className={getComplianceBadgeColor(status.assessment.complianceLevel)}>
                                        {status.assessment.complianceLevel?.toUpperCase()}
                                    </Badge>
                                    <div className="text-sm text-gray-600 mt-1">Compliance Level</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {status.assessment.artifacts?.length || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Artifacts Generated</div>
                                </div>
                            </div>

                            <Tabs defaultValue="summary" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="summary">Summary</TabsTrigger>
                                    <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
                                    <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                                </TabsList>

                                <TabsContent value="summary" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Key Findings</h4>
                                            <ul className="text-sm space-y-1">
                                                <li>• {status.assessment.summary?.piiDetected || 0} PII items detected</li>
                                                <li>• {status.assessment.frameworks?.length || 0} frameworks analyzed</li>
                                                <li>• {status.assessment.frameworkScores?.filter((s: any) => s.score > 0.7).length || 0} frameworks with strong compliance</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Recommendations</h4>
                                            <ul className="text-sm space-y-1">
                                                <li>• Review COPPA compliance requirements</li>
                                                <li>• Strengthen data governance policies</li>
                                                <li>• Implement AI risk assessment framework</li>
                                            </ul>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="frameworks" className="space-y-4">
                                    <div className="grid gap-3">
                                        {status.assessment.frameworkScores?.map((framework: any) => (
                                            <div key={framework.framework} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{framework.framework}</div>
                                                    <Badge className={getComplianceBadgeColor(framework.compliance_level)}>
                                                        {framework.compliance_level}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">{Math.round(framework.score * 100)}%</div>
                                                    <Progress value={framework.score * 100} className="w-20" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="artifacts" className="space-y-4">
                                    <div className="grid gap-3">
                                        {[
                                            { type: 'gap-report', title: 'Gap Analysis Report', description: 'Comprehensive compliance gap analysis', icon: BarChart3 },
                                            { type: 'policy-redline', title: 'Policy Redlines', description: 'Marked-up policy with recommendations', icon: FileText },
                                            { type: 'board-deck', title: 'Board Presentation', description: 'Executive summary for leadership', icon: Users }
                                        ].map(({ type, title, description, icon: Icon }) => (
                                            <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Icon className="w-8 h-8 text-blue-600" />
                                                    <div>
                                                        <div className="font-medium">{title}</div>
                                                        <div className="text-sm text-gray-600">{description}</div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => { }}>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Preview
                                                    </Button>
                                                    <Button size="sm" onClick={() => downloadArtifact(type)}>
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-center mt-6">
                                <Button onClick={resetWizard} variant="outline">
                                    Start New Assessment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default AssessmentWizard
