'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// NIST AI Risk Management Framework Questions
const NIST_QUESTIONS = {
  GOVERN: [
    {
      id: 1,
      text: 'Our institution has established clear AI governance policies and procedures',
      category: 'GOVERN',
      helpText: 'Do you have documented policies for AI use, oversight committees, and decision-making processes?'
    },
    {
      id: 2,
      text: 'We have designated leadership responsible for AI strategy and implementation',
      category: 'GOVERN',
      helpText: 'Is there a person or team with clear authority and accountability for AI initiatives?'
    },
    {
      id: 3,
      text: 'Our AI governance addresses ethics, bias, and responsible AI use',
      category: 'GOVERN',
      helpText: 'Do your policies cover fairness, transparency, and ethical considerations?'
    },
    {
      id: 4,
      text: 'We have processes for reviewing and approving new AI tools and applications',
      category: 'GOVERN',
      helpText: 'Is there a formal vetting process before adopting new AI technologies?'
    },
    {
      id: 5,
      text: 'Our institution has allocated budget and resources for AI initiatives',
      category: 'GOVERN',
      helpText: 'Are AI projects funded and resourced appropriately?'
    }
  ],
  MAP: [
    {
      id: 6,
      text: 'We have documented all AI systems currently in use across our institution',
      category: 'MAP',
      helpText: 'Do you maintain an inventory of AI tools, applications, and vendors?'
    },
    {
      id: 7,
      text: 'We understand the data flows and inputs required for our AI systems',
      category: 'MAP',
      helpText: 'Can you map where data comes from and how it flows through AI systems?'
    },
    {
      id: 8,
      text: 'We have identified the stakeholders affected by our AI implementations',
      category: 'MAP',
      helpText: 'Do you know which faculty, staff, and students are impacted by AI systems?'
    },
    {
      id: 9,
      text: 'We have assessed the risks associated with each AI system we use',
      category: 'MAP',
      helpText: 'Have you identified potential harms, biases, or failure modes?'
    },
    {
      id: 10,
      text: 'We understand the technical capabilities and limitations of our AI systems',
      category: 'MAP',
      helpText: 'Do you know what your AI tools can and cannot do reliably?'
    }
  ],
  MEASURE: [
    {
      id: 11,
      text: 'We have established metrics to evaluate AI system performance',
      category: 'MEASURE',
      helpText: 'Do you track accuracy, reliability, and effectiveness of AI tools?'
    },
    {
      id: 12,
      text: 'We monitor AI systems for bias, fairness, and equity issues',
      category: 'MEASURE',
      helpText: 'Are you actively checking for discriminatory outcomes?'
    },
    {
      id: 13,
      text: 'We regularly assess user satisfaction with AI tools and services',
      category: 'MEASURE',
      helpText: 'Do you collect feedback from faculty, staff, and students?'
    },
    {
      id: 14,
      text: 'We measure the impact of AI on educational outcomes and operations',
      category: 'MEASURE',
      helpText: 'Can you quantify benefits like efficiency gains or improved learning?'
    },
    {
      id: 15,
      text: 'We track compliance with AI-related policies and regulations',
      category: 'MEASURE',
      helpText: 'Do you monitor adherence to FERPA, ADA, and institutional policies?'
    }
  ],
  MANAGE: [
    {
      id: 16,
      text: 'We have incident response procedures for AI system failures or issues',
      category: 'MANAGE',
      helpText: 'Do you have plans for when AI systems malfunction or cause problems?'
    },
    {
      id: 17,
      text: 'We conduct regular reviews and audits of our AI systems',
      category: 'MANAGE',
      helpText: 'Are AI implementations evaluated periodically for effectiveness and safety?'
    },
    {
      id: 18,
      text: 'We provide training and support for users of AI systems',
      category: 'MANAGE',
      helpText: 'Do faculty, staff, and students receive guidance on AI tool usage?'
    },
    {
      id: 19,
      text: 'We have processes to address complaints or concerns about AI systems',
      category: 'MANAGE',
      helpText: 'Can stakeholders report issues and get them resolved?'
    },
    {
      id: 20,
      text: 'We continuously improve our AI practices based on feedback and outcomes',
      category: 'MANAGE',
      helpText: 'Do you iterate and adapt your AI approach over time?'
    }
  ]
};

const ALL_QUESTIONS = [
  ...NIST_QUESTIONS.GOVERN,
  ...NIST_QUESTIONS.MAP,
  ...NIST_QUESTIONS.MEASURE,
  ...NIST_QUESTIONS.MANAGE
];

const RATING_OPTIONS = [
  { value: 0, label: 'Not at all', description: 'No progress or not applicable', color: 'bg-red-100 border-red-300 text-red-700' },
  { value: 1, label: 'Limited', description: 'Early stages or minimal implementation', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { value: 2, label: 'Moderate', description: 'In progress with some gaps', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { value: 3, label: 'Excellent', description: 'Well established and effective', color: 'bg-green-100 border-green-300 text-green-700' }
];

export default function NISTAssessment() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showHelp, setShowHelp] = useState<Record<number, boolean>>({});

  const categories = ['GOVERN', 'MAP', 'MEASURE', 'MANAGE'];
  const currentCategoryName = categories[currentCategory];
  const currentQuestions = NIST_QUESTIONS[currentCategoryName as keyof typeof NIST_QUESTIONS];
  const totalQuestions = ALL_QUESTIONS.length;
  const answeredQuestions = Object.keys(responses).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.id);

      // Check if assessment already completed
      const { data: existingAssessment } = await supabase
        .from('streamlined_assessment_responses')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingAssessment?.completed_at) {
        // Assessment already completed, go to dashboard
        router.push('/dashboard/personalized');
        return;
      }

      setInitialLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth/login');
    }
  };

  const handleResponse = (questionId: number, value: number) => {
    setResponses({
      ...responses,
      [questionId - 1]: value
    });
  };

  const toggleHelp = (questionId: number) => {
    setShowHelp({
      ...showHelp,
      [questionId]: !showHelp[questionId]
    });
  };

  const isCategoryComplete = () => {
    return currentQuestions.every(q => responses[q.id - 1] !== undefined);
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!userId || answeredQuestions < totalQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting assessment with responses:', responses);

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          answers: responses,
          completedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit assessment');
      }

      console.log('✅ Assessment submitted successfully:', result);

      // Redirect to document upload
      router.push('/assessment/upload-documents');
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      alert(`Failed to submit assessment: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading assessment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Readiness Assessment
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Based on the NIST AI Risk Management Framework
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>{answeredQuestions} of {totalQuestions} questions answered</span>
            <span>•</span>
            <span>Section {currentCategory + 1} of {categories.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Category Navigation */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {categories.map((cat, idx) => {
            const catQuestions = NIST_QUESTIONS[cat as keyof typeof NIST_QUESTIONS];
            const completed = catQuestions.every(q => responses[q.id - 1] !== undefined);
            return (
              <button
                key={cat}
                onClick={() => setCurrentCategory(idx)}
                className={`p-3 rounded-lg font-medium transition-all ${idx === currentCategory
                    ? 'bg-blue-600 text-white shadow-lg'
                    : completed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {completed && <CheckCircle2 className="h-4 w-4 inline mr-1" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Questions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{currentCategoryName}</CardTitle>
            <CardDescription>
              {currentCategoryName === 'GOVERN' && 'AI governance, policies, and leadership'}
              {currentCategoryName === 'MAP' && 'Understanding AI systems and their impacts'}
              {currentCategoryName === 'MEASURE' && 'Metrics, monitoring, and evaluation'}
              {currentCategoryName === 'MANAGE' && 'Risk management and continuous improvement'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestions.map((question) => {
              const response = responses[question.id - 1];
              const helpVisible = showHelp[question.id];

              return (
                <div key={question.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 flex-1">
                        {question.id}. {question.text}
                      </h3>
                      <button
                        onClick={() => toggleHelp(question.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4 whitespace-nowrap"
                      >
                        {helpVisible ? 'Hide help' : 'Show help'}
                      </button>
                    </div>
                    {helpVisible && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mt-2">
                        {question.helpText}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {RATING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(question.id, option.value)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${response === option.value
                            ? `${option.color} border-current shadow-md scale-105`
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
                          }`}
                      >
                        <div className="font-semibold mb-1">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCategory === 0}
            className="w-32"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {isCategoryComplete() ? (
              <span className="text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Section complete
              </span>
            ) : (
              <span>Answer all questions to continue</span>
            )}
          </div>

          {currentCategory < categories.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isCategoryComplete()}
              className="w-32"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredQuestions < totalQuestions || loading}
              className="w-48"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Assessment
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Summary at bottom */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">What happens next?</h3>
              <p className="text-gray-600 text-sm">
                After completing this assessment, you'll upload relevant documents for AI analysis,
                then receive your personalized AI readiness score, gap analysis, and implementation blueprint.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
