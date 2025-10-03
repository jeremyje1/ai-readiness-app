'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { ArrowRight, Building2, CheckCircle2, Clock, FileText, Target, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AssessmentData {
  // Step 1: Institution Context
  institutionType: string;
  institutionSize: string;
  institutionState: string;

  // Step 2: Current AI Status
  aiJourneyStage: string;
  biggestChallenge: string;

  // Step 3: Strategic Priorities
  topPriorities: string[];
  implementationTimeline: string;

  // Step 4: Contact & Preferences
  contactName: string;
  contactEmail: string;
  contactRole: string;
  preferredConsultationTime: string;
  specialConsiderations: string;
}

const INSTITUTION_TYPES = [
  { value: 'university', label: 'University (4-year)', icon: '🎓' },
  { value: 'community_college', label: 'Community College (2-year)', icon: '📚' },
  { value: 'trade_school', label: 'Trade/Technical School', icon: '🔧' },
  { value: 'k12_district', label: 'K-12 School District', icon: '🏫' },
];

const INSTITUTION_SIZES = [
  { value: 'small', label: 'Small (<2,000 students)' },
  { value: 'medium', label: 'Medium (2,000-5,000)' },
  { value: 'large', label: 'Large (5,000-10,000)' },
  { value: 'very_large', label: 'Very Large (10,000+)' },
];

const AI_JOURNEY_STAGES = [
  { value: 'just_starting', label: '🌱 Just Starting', desc: "We're exploring AI but haven't begun implementation" },
  { value: 'piloting', label: '🧪 Piloting', desc: 'Testing AI tools in limited areas' },
  { value: 'implementing', label: '🚀 Implementing', desc: 'Actively rolling out AI across institution' },
  { value: 'optimizing', label: '⚡ Optimizing', desc: 'Refining and scaling existing AI initiatives' },
];

const PRIORITIES = [
  { value: 'faculty_development', label: 'Faculty Development & Training', icon: '👨‍🏫' },
  { value: 'student_safety', label: 'Student Safety & Ethics', icon: '🛡️' },
  { value: 'research_innovation', label: 'Research & Innovation', icon: '🔬' },
  { value: 'compliance_governance', label: 'Compliance & Governance', icon: '📋' },
  { value: 'operational_efficiency', label: 'Operational Efficiency', icon: '⚙️' },
  { value: 'academic_integrity', label: 'Academic Integrity', icon: '✅' },
];

const TIMELINES = [
  { value: 'immediate', label: 'Need to act now (0-3 months)', icon: '🔥' },
  { value: 'planning', label: 'Planning ahead (3-6 months)', icon: '📅' },
  { value: 'long_term', label: 'Long-term strategy (6-12 months)', icon: '🗓️' },
];

export default function StreamlinedAssessment() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AssessmentData>({
    institutionType: '',
    institutionSize: '',
    institutionState: '',
    aiJourneyStage: '',
    biggestChallenge: '',
    topPriorities: [],
    implementationTimeline: '',
    contactName: '',
    contactEmail: '',
    contactRole: '',
    preferredConsultationTime: '',
    specialConsiderations: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const supabase = createClient();

    const waitForAuthenticatedUser = () =>
      new Promise<User | null>((resolve) => {
        let resolved = false;
        let authSubscription: { unsubscribe: () => void } | null = null;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            authSubscription?.unsubscribe();
            resolve(null);
          }
        }, 5000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user && !resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
            resolve(session.user);
          }
        });

        authSubscription = subscription;
      });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Auth session lookup failed:', sessionError.message);
      }

      let activeUser: User | null = session?.user ?? null;

      if (!activeUser) {
        activeUser = await waitForAuthenticatedUser();
      }

      if (!activeUser) {
        router.replace('/auth/login?redirect=/assessment');
        return;
      }

      setUserId(activeUser.id);

      // Load existing assessment data if any - use maybeSingle() to avoid error for new users
      const { data: existingAssessment, error } = await supabase
        .from('streamlined_assessment_responses')
        .select('*')
        .eq('user_id', activeUser.id)
        .maybeSingle();

      if (existingAssessment && !error) {
        setFormData({
          institutionType: existingAssessment.institution_type || '',
          institutionSize: existingAssessment.institution_size || '',
          institutionState: existingAssessment.institution_state || '',
          aiJourneyStage: existingAssessment.ai_journey_stage || '',
          biggestChallenge: existingAssessment.biggest_challenge || '',
          topPriorities: existingAssessment.top_priorities || [],
          implementationTimeline: existingAssessment.implementation_timeline || '',
          contactName: existingAssessment.contact_name || '',
          contactEmail: existingAssessment.contact_email || activeUser?.email || '',
          contactRole: existingAssessment.contact_role || '',
          preferredConsultationTime: existingAssessment.preferred_consultation_time || '',
          specialConsiderations: existingAssessment.special_considerations || '',
        });
      } else {
        // Pre-fill email from user
        setFormData(prev => ({ ...prev, contactEmail: activeUser?.email || '' }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // If auth times out or fails, redirect to login
      router.replace('/auth/login?redirect=/assessment');
    } finally {
      setInitialLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!userId) return;

    const supabase = createClient();
    await supabase
      .from('streamlined_assessment_responses')
      .upsert({
        user_id: userId,
        institution_type: formData.institutionType,
        institution_size: formData.institutionSize,
        institution_state: formData.institutionState,
        ai_journey_stage: formData.aiJourneyStage,
        biggest_challenge: formData.biggestChallenge,
        top_priorities: formData.topPriorities,
        implementation_timeline: formData.implementationTimeline,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_role: formData.contactRole,
        preferred_consultation_time: formData.preferredConsultationTime,
        special_considerations: formData.specialConsiderations,
        updated_at: new Date().toISOString(),
      });

    // Log activity
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      activity_type: 'assessment_progress_saved',
      activity_data: { step: currentStep },
    });
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from('streamlined_assessment_responses')
        .upsert({
          user_id: userId,
          institution_type: formData.institutionType,
          institution_size: formData.institutionSize,
          institution_state: formData.institutionState,
          ai_journey_stage: formData.aiJourneyStage,
          biggest_challenge: formData.biggestChallenge,
          top_priorities: formData.topPriorities,
          implementation_timeline: formData.implementationTimeline,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_role: formData.contactRole,
          preferred_consultation_time: formData.preferredConsultationTime,
          special_considerations: formData.specialConsiderations,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      // Log completion
      await supabase.from('user_activity_log').insert({
        user_id: userId,
        activity_type: 'assessment_completed',
        activity_data: formData,
      });

      // Redirect to document upload
      router.push('/assessment/upload-documents');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePriority = (priority: string) => {
    if (formData.topPriorities.includes(priority)) {
      setFormData({
        ...formData,
        topPriorities: formData.topPriorities.filter(p => p !== priority),
      });
    } else if (formData.topPriorities.length < 3) {
      setFormData({
        ...formData,
        topPriorities: [...formData.topPriorities, priority],
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.institutionType && formData.institutionSize && formData.institutionState;
      case 2:
        return formData.aiJourneyStage && formData.biggestChallenge;
      case 3:
        return formData.topPriorities.length > 0 && formData.implementationTimeline;
      case 4:
        return formData.contactName && formData.contactEmail && formData.contactRole;
      default:
        return false;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Strategic AI Readiness Assessment</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of 5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <><Building2 className="h-6 w-6" /> Institution Context</>}
              {currentStep === 2 && <><Target className="h-6 w-6" /> Current AI Status</>}
              {currentStep === 3 && <><CheckCircle2 className="h-6 w-6" /> Strategic Priorities</>}
              {currentStep === 4 && <><FileText className="h-6 w-6" /> Contact Information</>}
              {currentStep === 5 && <><Upload className="h-6 w-6" /> Next Steps</>}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Institution Context */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">What type of institution are you?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INSTITUTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, institutionType: type.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${formData.institutionType === type.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-semibold">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Institution Size</Label>
                  <select
                    value={formData.institutionSize}
                    onChange={(e) => setFormData({ ...formData, institutionSize: e.target.value })}
                    className="w-full mt-2 p-3 border rounded-lg"
                  >
                    <option value="">Select size...</option>
                    {INSTITUTION_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>State/Region</Label>
                  <Input
                    value={formData.institutionState}
                    onChange={(e) => setFormData({ ...formData, institutionState: e.target.value })}
                    placeholder="e.g., California, New York"
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Current AI Status */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Where is your institution in its AI journey?
                  </Label>
                  <div className="space-y-3">
                    {AI_JOURNEY_STAGES.map((stage) => (
                      <button
                        key={stage.value}
                        onClick={() => setFormData({ ...formData, aiJourneyStage: stage.value })}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${formData.aiJourneyStage === stage.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-semibold">{stage.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{stage.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>What's your biggest AI challenge? (100 characters)</Label>
                  <Textarea
                    value={formData.biggestChallenge}
                    onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value.slice(0, 100) })}
                    placeholder="e.g., Faculty resistance, lack of policy, budget constraints..."
                    className="mt-2"
                    rows={3}
                    maxLength={100}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.biggestChallenge.length}/100 characters
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Strategic Priorities */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Select your top 3 priorities (choose up to 3)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => togglePriority(priority.value)}
                        disabled={
                          !formData.topPriorities.includes(priority.value) &&
                          formData.topPriorities.length >= 3
                        }
                        className={`p-4 border-2 rounded-lg text-left transition-all ${formData.topPriorities.includes(priority.value)
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{priority.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold">{priority.label}</div>
                            {formData.topPriorities.includes(priority.value) && (
                              <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-1" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Selected: {formData.topPriorities.length}/3
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Implementation Timeline</Label>
                  <div className="space-y-3">
                    {TIMELINES.map((timeline) => (
                      <button
                        key={timeline.value}
                        onClick={() => setFormData({ ...formData, implementationTimeline: timeline.value })}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${formData.implementationTimeline === timeline.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <span className="mr-3">{timeline.icon}</span>
                        <span className="font-semibold">{timeline.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Full name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="email@institution.edu"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Your Role</Label>
                  <Input
                    value={formData.contactRole}
                    onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                    placeholder="e.g., CIO, Dean, Department Chair"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Best time for expert consultation call (optional)</Label>
                  <Input
                    value={formData.preferredConsultationTime}
                    onChange={(e) => setFormData({ ...formData, preferredConsultationTime: e.target.value })}
                    placeholder="e.g., Weekday mornings, Tuesday afternoons"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Special considerations or requirements (optional)</Label>
                  <Textarea
                    value={formData.specialConsiderations}
                    onChange={(e) => setFormData({ ...formData, specialConsiderations: e.target.value })}
                    placeholder="Any specific needs, concerns, or context we should know about..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Next Steps */}
            {currentStep === 5 && (
              <div className="space-y-6 text-center">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Assessment Complete!</h3>
                  <p className="text-gray-600">
                    Great work! Now let's analyze your institution's documents to create your personalized AI
                    roadmap.
                  </p>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 text-left">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Next: Upload Your Documents
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Upload 2-5 key documents for AI analysis. This helps us create a truly personalized
                    roadmap:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>Strategic Plan (PDF/DOCX)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>Current AI Policy (if exists)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>Faculty Handbook</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>Technology Plan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>Student Handbook/Policy</span>
                    </li>
                  </ul>
                </div>

                <Button size="lg" onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Continue to Document Upload'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  {currentStep === 4 ? 'Review' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Estimate */}
        <div className="mt-6 text-center text-sm text-gray-600 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Estimated time: 10-15 minutes
        </div>
      </div>
    </div>
  );
}
