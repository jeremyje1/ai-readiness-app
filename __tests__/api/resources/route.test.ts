/**
 * Tests for audience-aware resources API
 */

import { GET } from '@/app/api/resources/route';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the resource catalog
vi.mock('@/lib/resources/catalog', () => ({
  getResourcesByAudience: vi.fn(),
  getResourceById: vi.fn(),
  getAllResources: vi.fn(),
  getResourcesByCategory: vi.fn(),
  getFeaturedResources: vi.fn(),
  searchResources: vi.fn(),
  getCategories: vi.fn(() => ['templates', 'guides', 'presentations']),
  getTags: vi.fn(() => ['strategy', 'planning', 'policy']),
  hasAccessToResource: vi.fn(() => true),
  isValidAudience: vi.fn(() => true)
}));

// Mock the audience cookie
vi.mock('@/lib/audience/cookie', () => ({
  getAudienceCookie: vi.fn(() => null)
}));

// Mock the audience derivation
vi.mock('@/lib/audience/deriveAudience', () => ({
  isValidAudience: vi.fn((audience) => audience === 'k12' || audience === 'highered')
}));

describe('/api/resources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('audience-specific resource filtering', () => {
    it('should return K-12 specific resources', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'k12-strategic-plan',
          title: 'District Strategic Planning Template',
          description: 'Comprehensive template for K-12 district strategic planning',
          category: 'templates',
          audience: ['k12'],
          type: 'document',
          tags: ['strategy', 'planning', 'district']
        },
        {
          id: 'k12-board-presentation',
          title: 'School Board AI Presentation',
          description: 'Present AI readiness to school board members',
          category: 'presentations',
          audience: ['k12'],
          type: 'presentation',
          tags: ['board', 'presentation', 'governance']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(2);
      expect(data.resources[0].title).toContain('District');
      expect(data.resources[1].title).toContain('School Board');
      expect(getResourcesByAudience).toHaveBeenCalledWith('k12');
    });

    it('should return Higher Ed specific resources', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'highered-academic-policy',
          title: 'Academic AI Policy Framework',
          description: 'Framework for developing institutional AI policies',
          category: 'frameworks',
          audience: ['highered'],
          type: 'document',
          tags: ['policy', 'academic', 'institutional']
        },
        {
          id: 'highered-faculty-training',
          title: 'Faculty AI Training Program',
          description: 'Comprehensive faculty development for AI integration',
          category: 'training',
          audience: ['highered'],
          type: 'curriculum',
          tags: ['faculty', 'training', 'development']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=highered';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(2);
      expect(data.resources[0].title).toContain('Academic');
      expect(data.resources[1].title).toContain('Faculty');
      expect(getResourcesByAudience).toHaveBeenCalledWith('highered');
    });

    it('should return shared resources for both audiences', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'shared-checklist',
          title: 'AI Implementation Checklist',
          description: 'Universal checklist for AI implementation',
          category: 'checklists',
          audience: ['k12', 'highered'],
          type: 'checklist',
          tags: ['implementation', 'checklist']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources[0].audience).toContain('k12');
      expect(data.resources[0].audience).toContain('highered');
    });
  });

  describe('category filtering', () => {
    it('should filter resources by category', async () => {
      const { getResourcesByCategory } = await import('@/lib/resources/catalog');
      (getResourcesByCategory as any).mockReturnValue([
        {
          id: 'template-1',
          title: 'Template Resource',
          category: 'templates',
          audience: ['k12'],
          type: 'document'
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12&category=templates';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(1);
      expect(data.resources[0].category).toBe('templates');
    });

    it('should handle multiple category filters', async () => {
      const { getResourcesByCategory } = await import('@/lib/resources/catalog');
      (getResourcesByCategory as any).mockReturnValue([
        { id: '1', category: 'templates', audience: ['k12'], type: 'document' },
        { id: '2', category: 'checklists', audience: ['k12'], type: 'checklist' }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12&category=templates,checklists';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(2);
    });
  });

  describe('search functionality', () => {
    it('should search resources by title and description', async () => {
      const { searchResources } = await import('@/lib/resources/catalog');
      (searchResources as any).mockReturnValue([
        {
          id: '1',
          title: 'Strategic Planning Template',
          description: 'Help with strategic planning',
          audience: ['k12']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12&q=strategic';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(1);
      expect(data.resources[0].title).toContain('Strategic');
    });

    it('should search case-insensitively', async () => {
      const { searchResources } = await import('@/lib/resources/catalog');
      (searchResources as any).mockReturnValue([
        {
          id: '1',
          title: 'Strategic Planning Template',
          description: 'Help with strategic planning',
          audience: ['k12']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12&q=STRATEGIC';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should default to k12 when no audience is provided', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'k12-default',
          title: 'K12 Default Resource',
          audience: ['k12'],
          type: 'document'
        }
      ]);

      const url = 'http://localhost:3000/api/resources';
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.resources[0].audience).toContain('k12');
    });

    it('should fall back to k12 for invalid audience parameter', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'k12-fallback',
          title: 'K12 Fallback Resource',
          audience: ['k12'],
          type: 'document'
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=invalid';
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.resources[0].audience).toContain('k12');
    });

    it('should handle resource catalog errors', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockImplementation(() => {
        throw new Error('Catalog error');
      });

      const url = 'http://localhost:3000/api/resources?audience=k12';
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('response format', () => {
    it('should return properly formatted response', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'test-resource',
          title: 'Test Resource',
          description: 'Test description',
          category: 'templates',
          audience: ['k12'],
          type: 'document',
          tags: ['test']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('resources');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('audience');
      expect(data.total).toBe(1);
      expect(data.audience).toBe('k12');
      expect(data.resources[0]).toHaveProperty('id');
      expect(data.resources[0]).toHaveProperty('title');
      expect(data.resources[0]).toHaveProperty('description');
      expect(data.resources[0]).toHaveProperty('category');
      expect(data.resources[0]).toHaveProperty('audience');
    });

    it('should return all resources without pagination', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      const mockResources = Array.from({ length: 25 }, (_, i) => ({
        id: `resource-${i}`,
        title: `Resource ${i}`,
        audience: ['k12'],
        type: 'document'
      }));
      (getResourcesByAudience as any).mockReturnValue(mockResources);

      const url = 'http://localhost:3000/api/resources?audience=k12';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(25);
      expect(data.total).toBe(25);
    });
  });
});