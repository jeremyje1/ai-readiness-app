/**
 * Resource Catalog with Audience Segmentation
 * Centralized catalog of templates, checklists, curricula, and webinars
 */

import { Audience } from '../audience/deriveAudience';

export type ResourceType = 'template' | 'checklist' | 'curriculum' | 'webinar' | 'guide' | 'policy';
export type ResourceFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'video' | 'url';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  format: ResourceFormat;
  audience: Audience | 'both';
  
  // File/URL information
  file?: string;        // File path for downloadable resources
  url?: string;         // External URL for links/webinars
  size?: string;        // File size display
  
  // Metadata
  tags: string[];
  category: string;
  featured?: boolean;
  downloadCount?: number;
  
  // Content details
  pageCount?: number;
  duration?: string;    // For videos/webinars
  lastUpdated: string;
  version?: string;
  
  // Prerequisites & related resources
  prerequisites?: string[];
  relatedResources?: string[];
  
  // Access control
  requiresAuth?: boolean;
  tierRequired?: 'basic' | 'comprehensive' | 'enterprise';
}

/**
 * Master resource catalog
 */
export const resources: Resource[] = [
  // Higher Education Resources
  {
    id: 'he-ai-ethics-policy',
    title: 'AI Ethics Policy Template for Higher Education',
    description: 'Comprehensive policy template addressing ethical AI use in academic settings, research, and administration.',
    type: 'template',
    format: 'docx',
    audience: 'highered',
    file: '/resources/templates/he_ai_ethics_policy_v2024.docx',
    size: '124 KB',
    tags: ['ethics', 'policy', 'governance', 'research'],
    category: 'Governance & Policy',
    featured: true,
    pageCount: 12,
    lastUpdated: '2024-01-15',
    version: '2.1',
    requiresAuth: true,
    tierRequired: 'comprehensive'
  },
  
  {
    id: 'he-faculty-ai-curriculum',
    title: 'Faculty AI Integration Curriculum Guide',
    description: 'Step-by-step curriculum for training faculty on AI tools and pedagogical integration.',
    type: 'curriculum',
    format: 'pdf',
    audience: 'highered',
    file: '/resources/curriculum/faculty_ai_curriculum_v2024.pdf',
    size: '2.1 MB',
    tags: ['faculty development', 'curriculum', 'training', 'pedagogy'],
    category: 'Faculty Development',
    featured: true,
    pageCount: 45,
    lastUpdated: '2024-02-01',
    version: '1.3',
    requiresAuth: true
  },
  
  {
    id: 'he-accreditation-checklist',
    title: 'AI Readiness Accreditation Planning Checklist',
    description: 'Checklist for addressing AI considerations in accreditation self-studies and site visits.',
    type: 'checklist',
    format: 'pdf',
    audience: 'highered',
    file: '/resources/checklists/he_accreditation_ai_checklist.pdf',
    size: '89 KB',
    tags: ['accreditation', 'compliance', 'planning', 'SACSCOC', 'Middle States'],
    category: 'Compliance & Accreditation',
    pageCount: 8,
    lastUpdated: '2024-01-20',
    requiresAuth: true
  },
  
  {
    id: 'he-research-ai-guidelines',
    title: 'Research AI Guidelines & Best Practices',
    description: 'Guidelines for faculty and students using AI in research, including disclosure and ethical considerations.',
    type: 'guide',
    format: 'pdf',
    audience: 'highered',
    file: '/resources/guides/research_ai_guidelines.pdf',
    size: '156 KB',
    tags: ['research', 'guidelines', 'ethics', 'disclosure'],
    category: 'Research & Innovation',
    pageCount: 16,
    lastUpdated: '2024-02-10',
    requiresAuth: true
  },

  // K-12 Resources
  {
    id: 'k12-district-policy-pack',
    title: 'K-12 District AI Policy Template Pack',
    description: 'Complete set of policy templates covering student use, staff guidelines, and data privacy.',
    type: 'template',
    format: 'docx',
    audience: 'k12',
    file: '/resources/templates/k12_district_policy_pack_v2024.docx',
    size: '198 KB',
    tags: ['policy', 'district', 'student safety', 'staff guidelines'],
    category: 'District Policy',
    featured: true,
    pageCount: 24,
    lastUpdated: '2024-01-18',
    version: '2.0',
    requiresAuth: true,
    tierRequired: 'comprehensive'
  },
  
  {
    id: 'k12-classroom-integration-guide',
    title: 'Classroom AI Integration Implementation Guide',
    description: 'Practical guide for teachers to integrate AI tools into curriculum and instruction.',
    type: 'guide',
    format: 'pdf',
    audience: 'k12',
    file: '/resources/guides/classroom_ai_integration.pdf',
    size: '1.8 MB',
    tags: ['classroom', 'teaching', 'curriculum', 'instruction'],
    category: 'Curriculum & Instruction',
    featured: true,
    pageCount: 32,
    lastUpdated: '2024-02-05',
    requiresAuth: true
  },
  
  {
    id: 'k12-parent-communication-templates',
    title: 'Parent Communication Templates for AI Initiatives',
    description: 'Email templates and letters for communicating AI initiatives to parents and community.',
    type: 'template',
    format: 'docx',
    audience: 'k12',
    file: '/resources/templates/parent_communication_ai.docx',
    size: '76 KB',
    tags: ['parent communication', 'community', 'transparency'],
    category: 'Community Engagement',
    pageCount: 6,
    lastUpdated: '2024-01-25',
    requiresAuth: true
  },
  
  {
    id: 'k12-digital-citizenship-curriculum',
    title: 'AI-Enhanced Digital Citizenship Curriculum',
    description: 'Curriculum modules teaching responsible AI use and digital citizenship.',
    type: 'curriculum',
    format: 'pdf',
    audience: 'k12',
    file: '/resources/curriculum/ai_digital_citizenship.pdf',
    size: '1.2 MB',
    tags: ['digital citizenship', 'student safety', 'ethics', 'responsibility'],
    category: 'Student Development',
    pageCount: 28,
    lastUpdated: '2024-02-12',
    requiresAuth: true
  },

  // Shared Resources (Both Audiences)
  {
    id: 'ai-vendor-evaluation-checklist',
    title: 'AI Vendor Evaluation Checklist',
    description: 'Comprehensive checklist for evaluating AI vendors and tools for educational use.',
    type: 'checklist',
    format: 'pdf',
    audience: 'both',
    file: '/resources/checklists/ai_vendor_evaluation.pdf',
    size: '112 KB',
    tags: ['vendor evaluation', 'procurement', 'security', 'privacy'],
    category: 'Procurement & Evaluation',
    pageCount: 10,
    lastUpdated: '2024-01-30',
    requiresAuth: true
  },
  
  {
    id: 'ai-privacy-impact-assessment',
    title: 'AI Privacy Impact Assessment Template',
    description: 'Template for conducting privacy impact assessments for AI implementations.',
    type: 'template',
    format: 'docx',
    audience: 'both',
    file: '/resources/templates/ai_privacy_impact_assessment.docx',
    size: '95 KB',
    tags: ['privacy', 'assessment', 'compliance', 'FERPA'],
    category: 'Privacy & Compliance',
    pageCount: 14,
    lastUpdated: '2024-02-08',
    requiresAuth: true
  },
  
  // Webinars
  {
    id: 'he-ai-webinar-series',
    title: 'Higher Ed AI Leadership Webinar Series',
    description: 'Monthly webinar series featuring provosts and deans discussing AI implementation strategies.',
    type: 'webinar',
    format: 'video',
    audience: 'highered',
    url: 'https://aiblueprint.com/webinars/higher-ed-leadership',
    tags: ['webinar', 'leadership', 'strategy', 'best practices'],
    category: 'Professional Development',
    duration: '60 minutes',
    lastUpdated: '2024-02-15',
    requiresAuth: true
  },
  
  {
    id: 'k12-superintendent-roundtable',
    title: 'Superintendent AI Roundtable Series',
    description: 'Quarterly roundtable discussions with superintendents sharing AI implementation experiences.',
    type: 'webinar',
    format: 'video',
    audience: 'k12',
    url: 'https://aiblueprint.com/webinars/superintendent-roundtable',
    tags: ['webinar', 'superintendent', 'leadership', 'networking'],
    category: 'Professional Development',
    duration: '90 minutes',
    lastUpdated: '2024-02-20',
    requiresAuth: true
  }
];

/**
 * Filter resources by audience
 */
export function getResourcesByAudience(audience: Audience): Resource[] {
  return resources.filter(resource => 
    resource.audience === audience || resource.audience === 'both'
  );
}

/**
 * Filter resources by category and audience
 */
export function getResourcesByCategory(category: string, audience?: Audience): Resource[] {
  let filtered = resources.filter(resource => resource.category === category);
  
  if (audience) {
    filtered = filtered.filter(resource => 
      resource.audience === audience || resource.audience === 'both'
    );
  }
  
  return filtered;
}

/**
 * Get featured resources for audience
 */
export function getFeaturedResources(audience: Audience): Resource[] {
  return resources.filter(resource => 
    resource.featured && 
    (resource.audience === audience || resource.audience === 'both')
  );
}

/**
 * Get resource by ID
 */
export function getResourceById(id: string): Resource | undefined {
  return resources.find(resource => resource.id === id);
}

/**
 * Search resources by query and audience
 */
export function searchResources(query: string, audience?: Audience): Resource[] {
  const searchTerm = query.toLowerCase();
  
  let filtered = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchTerm) ||
    resource.description.toLowerCase().includes(searchTerm) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    resource.category.toLowerCase().includes(searchTerm)
  );
  
  if (audience) {
    filtered = filtered.filter(resource => 
      resource.audience === audience || resource.audience === 'both'
    );
  }
  
  return filtered;
}

/**
 * Get all unique categories for audience
 */
export function getCategories(audience?: Audience): string[] {
  let filtered = resources;
  
  if (audience) {
    filtered = resources.filter(resource => 
      resource.audience === audience || resource.audience === 'both'
    );
  }
  
  const categories = [...new Set(filtered.map(resource => resource.category))];
  return categories.sort();
}

/**
 * Get all unique tags for audience
 */
export function getTags(audience?: Audience): string[] {
  let filtered = resources;
  
  if (audience) {
    filtered = resources.filter(resource => 
      resource.audience === audience || resource.audience === 'both'
    );
  }
  
  const tags = [...new Set(filtered.flatMap(resource => resource.tags))];
  return tags.sort();
}

/**
 * Check if user has access to resource
 */
export function hasAccessToResource(
  resource: Resource, 
  userTier?: 'basic' | 'comprehensive' | 'enterprise',
  isAuthenticated: boolean = false
): boolean {
  if (resource.requiresAuth && !isAuthenticated) {
    return false;
  }
  
  if (resource.tierRequired && (!userTier || !hasRequiredTier(userTier, resource.tierRequired))) {
    return false;
  }
  
  return true;
}

/**
 * Check if user tier meets requirement
 */
function hasRequiredTier(
  userTier: 'basic' | 'comprehensive' | 'enterprise',
  requiredTier: 'basic' | 'comprehensive' | 'enterprise'
): boolean {
  const tierLevels = { basic: 1, comprehensive: 2, enterprise: 3 };
  return tierLevels[userTier] >= tierLevels[requiredTier];
}