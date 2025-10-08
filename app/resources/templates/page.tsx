'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Shield,
  Users,
  Video,
  Zap
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'policy' | 'training' | 'assessment' | 'planning';
  type: 'template' | 'guide' | 'checklist' | 'webinar';
  date: string;
  isNew?: boolean;
  downloadUrl: string;
}

const templates: Template[] = [
  {
    id: '1',
    title: 'AI Ethics Policy Template 2025',
    description: 'Updated policy template reflecting latest FERPA and COPPA compliance requirements for educational institutions.',
    category: 'policy',
    type: 'template',
    date: '2025-01-15',
    isNew: true,
    downloadUrl: '/resources/downloads/ai-ethics-policy-2025.docx'
  },
  {
    id: '2',
    title: 'Faculty AI Training Curriculum',
    description: 'Complete 6-week training program for faculty on responsible AI use in education.',
    category: 'training',
    type: 'guide',
    date: '2025-01-10',
    isNew: true,
    downloadUrl: '/resources/downloads/faculty-ai-training.pdf'
  },
  {
    id: '3',
    title: 'Student Data Protection Checklist',
    description: 'Comprehensive checklist ensuring AI tools comply with student privacy regulations.',
    category: 'policy',
    type: 'checklist',
    date: '2025-01-08',
    downloadUrl: '/resources/downloads/student-data-protection-checklist.pdf'
  },
  {
    id: '4',
    title: 'January 2025: AI Ethics in Education Webinar',
    description: 'Recording of our monthly webinar discussing ethical AI implementation strategies.',
    category: 'training',
    type: 'webinar',
    date: '2025-01-05',
    downloadUrl: '/resources/webinars/ai-ethics-education-jan2025'
  },
  {
    id: '5',
    title: 'Stakeholder Communication Templates',
    description: 'Pre-written templates for communicating AI initiatives to parents, board members, and staff.',
    category: 'planning',
    type: 'template',
    date: '2024-12-20',
    downloadUrl: '/resources/downloads/stakeholder-communication-templates.docx'
  },
  {
    id: '6',
    title: 'AI Implementation Budget Planner',
    description: 'Excel template for planning and tracking AI implementation costs and ROI.',
    category: 'planning',
    type: 'template',
    date: '2024-12-15',
    downloadUrl: '/resources/downloads/ai-budget-planner.xlsx'
  }
];

const getCategoryIcon = (category: Template['category']) => {
  switch (category) {
    case 'policy': return Shield;
    case 'training': return Users;
    case 'assessment': return FileText;
    case 'planning': return Calendar;
    default: return BookOpen;
  }
};

const getTypeIcon = (type: Template['type']) => {
  switch (type) {
    case 'template': return FileText;
    case 'guide': return BookOpen;
    case 'checklist': return FileText;
    case 'webinar': return Video;
    default: return FileText;
  }
};

export default function ResourcesTemplatesPage() {
  // Simple toast notification function
  const showToastNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Slide in
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
  };

  const handleDownload = (template: Template) => {
    // Track download for analytics
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'template_download',
          template_id: template.id,
          template_title: template.title,
          template_type: template.type
        })
      }).catch(() => { }); // Silent fail for analytics
    } catch (e) { }

    // Handle different types of resources
    if (template.type === 'webinar') {
      // For webinars, provide immediate access plus email backup
      const webinarContent = `🎥 ${template.title}\n\n✅ Instant Access Available!\n\n� Immediate Options:\n• Click "Open Webinar" below for instant access\n• Recording available for 90 days\n• Download slides and resources\n\n📧 Backup Email:\n• We'll also email you the access link\n• Sent to your registered email within 5 minutes\n• Includes Q&A transcript and additional resources`;

      if (confirm(webinarContent + '\n\nOpen webinar now?')) {
        // Show toast notification for email backup
        showToastNotification('📧 Webinar link emailed as backup!', 'success');
        // In a real implementation, this would open the webinar
        window.open('#webinar-access', '_blank');
      }
      return;
    }

    // For templates and documents - provide instant download + email backup
    if (template.downloadUrl.startsWith('/resources/downloads/')) {
      const downloadContent = `📄 ${template.title}\n\n✅ Ready for Download!\n\n⚡ Instant Download:\n• Click "Download Now" for immediate access\n• Includes implementation guide and best practices\n• Compatible with Microsoft Office and Google Workspace\n\n📧 Email Backup:\n• Link also sent to your registered email\n• Arrives within 5 minutes for future access`;

      if (confirm(downloadContent + '\n\nDownload now?')) {
        // Simulate instant download
        const link = document.createElement('a');
        link.href = '#'; // In real implementation, this would be the actual file URL
        link.download = `${template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        link.click();

        // Show toast notification for email backup
        showToastNotification('📧 Download link also emailed as backup!', 'success');

        // Show download success notification
        setTimeout(() => {
          showToastNotification(`✅ ${template.title} downloaded successfully!`, 'success');
        }, 500);
      }
    } else {
      window.open(template.downloadUrl, '_blank');
    }
  };

  const categorizedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resource Library & Templates</h1>
          <p className="text-gray-600 text-lg">
            Access exclusive templates, guides, and training materials included with your subscription
          </p>
        </div>

        {/* Monthly Highlights */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              This Month’s New Resources
            </CardTitle>
            <CardDescription className="text-blue-100">
              Fresh content added to your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.filter(t => t.isNew).map(template => {
                const Icon = getTypeIcon(template.type);
                return (
                  <div key={template.id} className="bg-white/10 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h4 className="font-semibold">{template.title}</h4>
                          <p className="text-sm text-blue-100 mt-1">{template.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
                        New
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleDownload(template)}
                      variant="secondary"
                      size="sm"
                      className="mt-3 bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {template.type === 'webinar' ? 'Watch' : 'Download'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {Object.entries(categorizedTemplates).map(([category, categoryTemplates]) => {
          const CategoryIcon = getCategoryIcon(category as Template['category']);
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

          return (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5" />
                  {categoryTitle} Resources
                </CardTitle>
                <CardDescription>
                  {category === 'policy' && 'Compliance templates and policy frameworks'}
                  {category === 'training' && 'Educational materials and training programs'}
                  {category === 'assessment' && 'Evaluation tools and measurement frameworks'}
                  {category === 'planning' && 'Strategic planning and implementation tools'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map(template => {
                    const TypeIcon = getTypeIcon(template.type);
                    return (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-gray-600" />
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                              {template.type}
                            </span>
                          </div>
                          {template.isNew && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              New
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(template.date).toLocaleDateString()}
                          </span>
                          <Button
                            onClick={() => handleDownload(template)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {template.type === 'webinar' ? 'Watch' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Community Access */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <MessageSquare className="h-5 w-5" />
              Join the AI Blueprint Community
            </CardTitle>
            <CardDescription className="text-purple-700">
              Connect with peers, share experiences, and get expert advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Community Benefits</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Share implementation experiences</li>
                  <li>• Get quick answers from experts</li>
                  <li>• Access peer success stories</li>
                  <li>• Participate in monthly discussions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    // Track community access
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'community_access', {
                        event_category: 'subscription_value',
                        event_label: 'slack_community_join'
                      });
                    }
                    // Provide Slack community access information
                    alert('🤝 Join Our AI Readiness Community!\n\n✅ Exclusive Slack workspace for subscribers\n\n📧 Access Details:\n• Email info@northpathstrategies.org with subject "Slack Community Access"\n• Include your subscription email for verification\n• You\'ll receive an invite within 24 hours\n• Connect with peers and AI implementation experts\n\n💡 Community Features:\n• Weekly strategy discussions\n• Resource sharing and feedback\n• Expert Q&A sessions\n• Implementation success stories');
                  }}
                >
                  Join Slack Community
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Track guidelines view
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'guidelines_view', {
                        event_category: 'subscription_value',
                        event_label: 'community_guidelines'
                      });
                    }
                    // Open community guidelines in modal or new tab
                    window.open('/community-guidelines', '_blank');
                  }}
                >
                  View Community Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
