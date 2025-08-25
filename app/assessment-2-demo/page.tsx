/**
 * Assessment 2.0 Demo Page
 * Document-In, Policy-Out demonstration
 * 
 * @version 2.0.0
 * @author NorthPath Strategies
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DocumentPolicyEngine from '@/components/DocumentPolicyEngine';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Shield, 
  Users, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Assessment2Demo() {
  const searchParams = useSearchParams();
  const [institutionType, setInstitutionType] = useState<'K12' | 'HigherEd'>('K12');
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Get institution type from URL params or localStorage
    const contextParam = searchParams.get('context');
    const storedType = localStorage.getItem('ai_blueprint_institution_type');
    
    if (contextParam === 'HigherEd' || storedType === 'HigherEd') {
      setInstitutionType('HigherEd');
    } else {
      setInstitutionType('K12');
    }
  }, [searchParams]);

  const getFrameworkText = () => {
    return institutionType === 'K12' 
      ? 'COPPA/FERPA and State Education AI Guidance'
      : 'NIST AI RMF and U.S. Dept. of Education AI Guidance';
  };

const getInstitutionText = () => {
  return institutionType === 'K12'
    ? 'School District'
    : 'Higher Education Institution';
};  const valueProps = [
    {
      icon: FileText,
      title: 'Document Processing',
      description: `Upload policies, contracts, handbooks - get ${getFrameworkText()}-aligned outputs`,
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Compliance Automation',
      description: 'Automated gap analysis and risk assessment with board-ready recommendations',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Implementation Ready',
      description: 'Training curricula, rollout plans, and committee charters included',
      color: 'purple'
    },
    {
      icon: Clock,
      title: 'Monthly Deliverables',
      description: 'New policies, updates, and guidance delivered every month at $995',
      color: 'orange'
    }
  ];

  const testimonials = [
    {
      name: institutionType === 'K12' ? 'Dr. Sarah Johnson' : 'Dr. Michael Chen',
      role: institutionType === 'K12' ? 'Superintendent, Valley School District' : 'Provost, State University',
      quote: `"The document-to-policy engine saved us months of work. We uploaded our existing policies and got back board-ready AI governance documents aligned to ${getFrameworkText()}."`,
      rating: 5
    },
    {
      name: institutionType === 'K12' ? 'Lisa Rodriguez' : 'Dr. Jennifer Park',
      role: institutionType === 'K12' ? 'Technology Director, Metro Schools' : 'VP of Academic Affairs, Tech Institute',
      quote: `"Instead of hiring consultants for $50K+, we get ongoing policy updates and compliance monitoring for $995/month. The ROI is incredible."`,
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Assessment 2.0 Demo
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {institutionType === 'K12' ? 'K-12' : 'Higher Ed'} AI Blueprint: Document-In, Policy-Out
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Transform your {getInstitutionText().toLowerCase()}'s documents into board-ready AI policies. 
              Upload current policies, vendor contracts, and handbooks - get back {getFrameworkText()}-aligned 
              deliverables in 48 hours.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                size="lg" 
                onClick={() => setShowDemo(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Document Engine Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open('/samples', '_blank')}
              >
                View Sample Outputs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showDemo ? (
          <>
            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {valueProps.map((prop, index) => {
                const Icon = prop.icon;
                return (
                  <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className={`inline-flex p-3 rounded-full bg-${prop.color}-100 mb-4`}>
                      <Icon className={`h-6 w-6 text-${prop.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{prop.title}</h3>
                    <p className="text-sm text-gray-600">{prop.description}</p>
                  </Card>
                );
              })}
            </div>

            {/* Process Overview */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                How It Works: 3 Simple Steps
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
                  <p className="text-gray-600">
                    Upload your current AI policies, vendor contracts, faculty handbooks, 
                    and governance documents
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-gray-600">
                    6 patent-pending algorithms analyze against {getFrameworkText()} 
                    and peer institution benchmarks
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Deliverables</h3>
                  <p className="text-gray-600">
                    Receive red-lined policies, compliance scorecards, board decision packs, 
                    and implementation templates
                  </p>
                </div>
              </div>
            </div>

            {/* Sample Outputs */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Sample Monthly Deliverables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">📋 Month 1: Policy Analysis Package</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{getFrameworkText()} Gap Analysis Report</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Red-lined Policy Drafts with Tracked Changes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Risk Assessment Matrix and Mitigation Strategies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Board Decision Package with Recommendations</span>
                    </li>
                  </ul>
                </Card>
                
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">🎯 Month 2: Implementation Package</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        {institutionType === 'K12' ? 'Teacher' : 'Faculty'} Training Curriculum (6-Week Program)
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Committee Charter Templates and Role Definitions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Rollout Timeline with Milestone Checkpoints</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Communication Templates for Stakeholders</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                What {institutionType === 'K12' ? 'Districts' : 'Universities'} Are Saying
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4">"{testimonial.quote}"</blockquote>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-blue-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Transform Your Documents?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Start with a 7-day free trial. Upload your documents and see how our 
                patent-pending algorithms generate board-ready policies in 48 hours.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button 
                  size="lg" 
                  onClick={() => setShowDemo(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try Demo Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.open('/start?billing=monthly&context=' + institutionType, '_blank')}
                >
                  Start Free Trial - $995/month
                </Button>
              </div>
            </div>
          </>
        ) : (
          <DocumentPolicyEngine 
            institutionType={institutionType}
            onPolicyGenerated={(policies) => {
              console.log('Generated policies:', policies);
            }}
          />
        )}
      </div>
    </div>
  );
}
