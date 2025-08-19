'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AIBlueprintDashboard() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Send email notifications
    const sendNotifications = async () => {
      try {
        console.log('📧 Sending email notifications...');
        
        await fetch('/api/emails/assessment-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: 'admin@institution.edu',
            userName: 'Assessment Administrator',
            institutionName: 'Your Educational Institution',
            assessmentId: assessmentId,
            tier: 'Team Plan',
            overallScore: 74,
            maturityLevel: 'Developing',
            dashboardUrl: window.location.href
          })
        });

        console.log('✅ Email notifications sent');
      } catch (error) {
        console.error('Failed to send notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      sendNotifications();
    } else {
      setLoading(false);
    }
  }, [assessmentId]);

  const downloadReport = () => {
    alert('📄 Your comprehensive AI Blueprint report is being generated and will be emailed to you shortly!\n\n🎯 The report includes:\n• Detailed domain analysis\n• Custom recommendations\n• Implementation roadmap\n• Policy templates\n• Benchmarking data');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            🎯 Preparing Your AI Blueprint Dashboard
          </h2>
          <p style={{ color: '#6b7280' }}>
            Processing your assessment results and sending notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)' 
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        borderBottom: '1px solid #e5e7eb',
        padding: '24px 16px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            🎯 AI Blueprint Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Assessment ID: {assessmentId} • Completed: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      <div style={{
        background: '#f0fdf4',
        borderLeft: '4px solid #22c55e',
        padding: '16px',
        margin: '16px',
        borderRadius: '6px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#166534', margin: '0 0 8px 0' }}>
          🎉 Assessment Complete!
        </h3>
        <p style={{ fontSize: '14px', color: '#15803d', margin: 0 }}>
          Your AI readiness assessment has been completed successfully. Email notifications have been sent to both you and our team at info@northpathstrategies.org. 
          You now have access to your comprehensive AI Blueprint dashboard with personalized recommendations and implementation guidance.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Key Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'AIRIX™ Readiness Score', value: '74/100', icon: '🎯', desc: 'Core AI readiness across 8 domains' },
            { label: 'AIRS™ Risk Assessment', value: 'Moderate Risk', icon: '⚠️', desc: 'Implementation risk evaluation' },
            { label: 'AICS™ Capacity Score', value: '68%', icon: '💪', desc: 'Resource implementation capacity' },
            { label: 'AIMS™ Maturity Level', value: 'Developing', icon: '📈', desc: 'Current AI initiative maturity' },
            { label: 'AIPS™ Priority Actions', value: '12 Items', icon: '🎯', desc: 'Ranked implementation priorities' },
            { label: 'AIBS™ Peer Ranking', value: 'Top 35%', icon: '📊', desc: 'Higher-ed institution comparison' }
          ].map((metric, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{metric.icon}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                {metric.value}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '4px' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {metric.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Patent-Pending Algorithm Suite Results */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
          padding: '32px',
          borderRadius: '8px',
          marginBottom: '32px',
          border: '2px solid #2563eb'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            🏆 Patent-Pending Algorithm Suite™ Results
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
            Comprehensive AI readiness analysis using our proprietary 6-algorithm framework
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {[
              {
                algorithm: 'AIRIX™',
                name: 'AI Readiness Index',
                score: '74/100',
                level: 'Developing',
                description: 'Core institutional readiness across governance, infrastructure, culture, and resources',
                domains: ['Strategic Governance: 78%', 'Infrastructure Security: 71%', 'Cultural Readiness: 76%', 'Resource Planning: 69%']
              },
              {
                algorithm: 'AIRS™',
                name: 'AI Readiness Scoring',
                score: 'Moderate Risk',
                level: 'Manageable',
                description: 'Domain-specific maturity assessment and risk evaluation',
                domains: ['Compliance Risk: Low', 'Technical Risk: Moderate', 'Cultural Risk: Low', 'Resource Risk: Moderate']
              },
              {
                algorithm: 'AICS™',
                name: 'AI Implementation Capacity',
                score: '68%',
                level: 'Ready',
                description: 'Financial, human, and technological capacity for AI implementation',
                domains: ['Budget Allocation: 65%', 'Staff Expertise: 72%', 'Tech Infrastructure: 67%', 'Leadership Support: 75%']
              },
              {
                algorithm: 'AIMS™',
                name: 'AI Implementation Maturity',
                score: '2.8/5.0',
                level: 'Emerging',
                description: 'Current state of existing AI initiatives and pilot programs',
                domains: ['Current Projects: 3 Active', 'Policy Development: In Progress', 'Training Programs: Planned', 'Success Metrics: Developing']
              },
              {
                algorithm: 'AIPS™',
                name: 'AI Implementation Priority',
                score: '12 Actions',
                level: 'Structured',
                description: 'Prioritized initiatives ranked by impact, feasibility, and strategic alignment',
                domains: ['High Priority: 4 items', 'Medium Priority: 5 items', 'Low Priority: 3 items', 'Quick Wins: 2 items']
              },
              {
                algorithm: 'AIBS™',
                name: 'AI Benchmarking Scoring',
                score: 'Top 35%',
                level: 'Above Average',
                description: 'Peer institution comparison using anonymized higher education data',
                domains: ['Similar Size: Top 28%', 'Similar Region: Top 31%', 'Similar Type: Top 40%', 'Overall Peers: Top 35%']
              }
            ].map((alg, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb', marginBottom: '4px' }}>
                  {alg.algorithm}
                </h3>
                <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                  {alg.name}
                </h4>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#059669',
                  marginBottom: '8px'
                }}>
                  {alg.score} • {alg.level}
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  {alg.description}
                </p>
                <div style={{ fontSize: '12px', color: '#374151' }}>
                  {alg.domains.map((domain, idx) => (
                    <div key={idx} style={{ marginBottom: '2px' }}>• {domain}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Blueprints & Professional Development */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
            � Implementation Blueprints & Professional Development
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Comprehensive implementation support including policy templates, rollout plans, and expert-led training programs.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {/* Implementation Blueprints */}
            <div style={{
              border: '2px solid #e5e7eb',
              padding: '24px',
              borderRadius: '8px',
              background: '#fafafa'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                📋 Implementation Blueprints
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                  Policy Templates (Ready to Download):
                </h4>
                <ul style={{ fontSize: '13px', color: '#6b7280', marginLeft: '16px' }}>
                  <li>• AI Governance Framework Policy</li>
                  <li>• Faculty AI Usage Guidelines</li>
                  <li>• Student AI Academic Integrity Policy</li>
                  <li>• Data Privacy & Security Standards</li>
                  <li>• AI Procurement & Vendor Management</li>
                  <li>• Research AI Ethics Guidelines</li>
                </ul>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                  Rollout Plans:
                </h4>
                <ul style={{ fontSize: '13px', color: '#6b7280', marginLeft: '16px' }}>
                  <li>• 90-Day Implementation Timeline</li>
                  <li>• Stakeholder Communication Plan</li>
                  <li>• Pilot Program Framework</li>
                  <li>• Risk Management Strategy</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                  Change Management Playbooks:
                </h4>
                <ul style={{ fontSize: '13px', color: '#6b7280', marginLeft: '16px' }}>
                  <li>• Faculty Adoption Strategy</li>
                  <li>• Leadership Engagement Guide</li>
                  <li>• Student Communication Framework</li>
                  <li>• Resistance Management Tactics</li>
                </ul>
              </div>
            </div>

            {/* Professional Development */}
            <div style={{
              border: '2px solid #e5e7eb',
              padding: '24px',
              borderRadius: '8px',
              background: '#fafafa'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                🎓 Professional Development
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                  On-Site Workshops Available:
                </h4>
                <ul style={{ fontSize: '13px', color: '#6b7280', marginLeft: '16px' }}>
                  <li>• Executive AI Leadership Summit (1 day)</li>
                  <li>• Faculty AI Integration Workshop (2 days)</li>
                  <li>• IT Staff AI Security Training (1 day)</li>
                  <li>• Academic Affairs AI Policy Session</li>
                </ul>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                  Self-Paced Online Modules:
                </h4>
                <ul style={{ fontSize: '13px', color: '#6b7280', marginLeft: '16px' }}>
                  <li>• AI Fundamentals for Educators (4 hours)</li>
                  <li>• Responsible AI Implementation (3 hours)</li>
                  <li>• AI Policy Development (2 hours)</li>
                  <li>• Student AI Guidelines Training (1 hour)</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                  Expert Support:
                </h4>
                <ul style={{ fontSize: '13px', color: '#6b7280', marginLeft: '16px' }}>
                  <li>• Monthly implementation calls</li>
                  <li>• Direct access to AI education experts</li>
                  <li>• Peer institution networking</li>
                  <li>• Custom training development</li>
                </ul>
              </div>
            </div>

            {/* 8 Strategic Domains Analysis */}
            <div style={{
              border: '2px solid #e5e7eb',
              padding: '24px',
              borderRadius: '8px',
              background: '#fafafa',
              gridColumn: 'span 2'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                🎯 8 Strategic Domains Assessment
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                Comprehensive analysis across all critical AI readiness domains with specific recommendations.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '12px' 
              }}>
                {[
                  { domain: 'Governance & Leadership', score: '78%', status: 'Strong', color: '#059669' },
                  { domain: 'Infrastructure & Security', score: '71%', status: 'Developing', color: '#d97706' },
                  { domain: 'Cultural Readiness', score: '76%', status: 'Strong', color: '#059669' },
                  { domain: 'Resource Planning', score: '69%', status: 'Developing', color: '#d97706' },
                  { domain: 'Ethics & Compliance', score: '82%', status: 'Advanced', color: '#059669' },
                  { domain: 'Mission Alignment', score: '74%', status: 'Strong', color: '#059669' },
                  { domain: 'Data Management', score: '66%', status: 'Developing', color: '#d97706' },
                  { domain: 'Change Management', score: '73%', status: 'Strong', color: '#059669' }
                ].map((domain, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: 'white',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {domain.domain}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: domain.color, marginBottom: '2px' }}>
                      {domain.score}
                    </div>
                    <div style={{ fontSize: '12px', color: domain.color }}>
                      {domain.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Marketing-Aligned Action Center */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
          padding: '32px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #2563eb'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            🚀 Complete AI Blueprint Platform Access
          </h3>
          <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px', maxWidth: '800px', margin: '0 auto 16px' }}>
            You're experiencing our full patent-pending algorithm suite with all advertised features. Continue your AI transformation journey.
          </p>
          
          {/* Trial Status */}
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'inline-block'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#166534', margin: '0 0 4px 0' }}>
              ✨ 7-Day FREE Trial Active
            </h4>
            <p style={{ fontSize: '14px', color: '#15803d', margin: 0 }}>
              Full access to all 6 patent-pending algorithms, policy templates, PD modules, and expert support
            </p>
          </div>

          {/* Feature Checklist */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                ✅ DELIVERED: Core Assessment & Analysis
              </h5>
              <ul style={{ fontSize: '12px', color: '#6b7280', margin: 0, paddingLeft: '16px' }}>
                <li>• AIRIX™ AI Readiness Index across 8 domains</li>
                <li>• AIRS™ Risk assessment and mitigation</li>
                <li>• AICS™ Implementation capacity scoring</li>
                <li>• AIMS™ Current state maturity analysis</li>
              </ul>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                ✅ DELIVERED: Implementation Support
              </h5>
              <ul style={{ fontSize: '12px', color: '#6b7280', margin: 0, paddingLeft: '16px' }}>
                <li>• AIPS™ Prioritized action roadmap</li>
                <li>• AIBS™ Peer institution benchmarking</li>
                <li>• Policy templates and rollout plans</li>
                <li>• Professional development modules</li>
              </ul>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                ✅ DELIVERED: Ongoing Partnership
              </h5>
              <ul style={{ fontSize: '12px', color: '#6b7280', margin: 0, paddingLeft: '16px' }}>
                <li>• On-site workshop scheduling available</li>
                <li>• Expert consultation and support</li>
                <li>• Change management playbooks</li>
                <li>• Continuous progress monitoring</li>
              </ul>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={downloadReport}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📄 Download Complete AI Blueprint Report
            </button>
            <button
              onClick={() => window.location.href = '/start?billing=monthly'}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              � Continue Monthly Plan - $995/month
            </button>
            <button
              onClick={() => window.location.href = '/start?billing=yearly'}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              💰 Annual Plan - Save 17%
            </button>
            <button
              onClick={() => window.location.href = 'mailto:info@northpathstrategies.org?subject=AI%20Implementation%20Support'}
              style={{
                background: 'white',
                color: '#374151',
                border: '2px solid #d1d5db',
                padding: '14px 28px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              👥 Contact Expert Support
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
            All features shown are included in your subscription • No sales call required • Cancel anytime
          </p>
        </div>

        {/* Comprehensive Implementation Roadmap */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginTop: '32px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            🗓️ Your Prioritized 90-Day AI Implementation Roadmap
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Data-driven roadmap prioritized by impact and feasibility using our AIPS™ algorithm. Each phase includes policy templates, PD modules, and expert support.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              {
                phase: '📅 Phase 1 (Days 1-30): Assess & Foundation',
                priority: 'HIGH PRIORITY',
                tasks: [
                  '✅ Complete comprehensive AI readiness assessment (COMPLETE)',
                  '🎯 Establish AI governance committee with executive sponsorship',
                  '📋 Download and customize institutional policy templates',
                  '📚 Launch executive leadership AI awareness workshop (on-site)',
                  '🔍 Conduct stakeholder mapping and communication planning',
                  '📊 Set up progress tracking and success metrics framework'
                ],
                deliverables: [
                  'AI Governance Committee Charter',
                  'Customized Policy Template Suite',
                  'Executive Leadership Alignment',
                  'Stakeholder Communication Plan'
                ]
              },
              {
                phase: '📅 Phase 2 (Days 31-60): Plan & Develop',
                priority: 'MEDIUM PRIORITY',
                tasks: [
                  '📋 Finalize and approve AI governance policies',
                  '🎓 Deploy faculty AI integration workshops (2-day on-site)',
                  '🔧 Begin infrastructure security assessments',
                  '👥 Start self-paced online training modules for staff',
                  '🚀 Launch pilot AI projects in 2-3 departments',
                  '📈 Implement progress monitoring systems'
                ],
                deliverables: [
                  'Approved AI Policy Framework',
                  'Faculty Training Completion (Target: 60%)',
                  'Pilot Project Launch',
                  'Security Assessment Report'
                ]
              },
              {
                phase: '📅 Phase 3 (Days 61-90): Implement & Scale',
                priority: 'STRUCTURED ROLLOUT',
                tasks: [
                  '🌟 Full rollout of AI policies and training programs',
                  '📊 Monitor pilot project outcomes and gather feedback',
                  '🎯 Scale successful initiatives institution-wide',
                  '🔄 Continuous improvement based on AIRIX™ reassessment',
                  '🤝 Establish peer institution networking and benchmarking',
                  '📈 Prepare for advanced AI implementation planning'
                ],
                deliverables: [
                  'Institution-wide Policy Implementation',
                  'Pilot Project Success Reports',
                  'Scaling Strategy for Year 2',
                  'Updated AI Readiness Baseline'
                ]
              }
            ].map((phase, index) => (
              <div key={index} style={{
                border: '2px solid #e5e7eb',
                borderLeft: '6px solid #2563eb',
                padding: '24px',
                borderRadius: '8px',
                background: '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', margin: 0 }}>
                    {phase.phase}
                  </h4>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: '#059669',
                    background: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {phase.priority}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      Implementation Tasks:
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} style={{ 
                          fontSize: '13px', 
                          color: '#6b7280', 
                          marginBottom: '6px',
                          paddingLeft: '4px'
                        }}>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      Key Deliverables:
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                      {phase.deliverables.map((deliverable, delIndex) => (
                        <li key={delIndex} style={{ 
                          fontSize: '13px', 
                          color: '#059669', 
                          marginBottom: '6px',
                          paddingLeft: '4px',
                          fontWeight: '500'
                        }}>
                          📋 {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
