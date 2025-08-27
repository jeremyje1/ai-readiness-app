/**
 * Tests for audience-aware resources API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/resources/route';

// Mock the resource catalog
vi.mock('@/lib/resources/catalog', () => ({
  getResourcesByAudience: vi.fn(),
  getResourceById: vi.fn(),
  getAllResources: vi.fn()
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
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: 'template-1',
          title: 'Template Resource',
          category: 'templates',
          audience: ['k12'],
          type: 'document'
        },
        {
          id: 'checklist-1',
          title: 'Checklist Resource',
          category: 'checklists',
          audience: ['k12'],
          type: 'checklist'
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
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        { id: '1', category: 'templates', audience: ['k12'] },
        { id: '2', category: 'checklists', audience: ['k12'] },
        { id: '3', category: 'guides', audience: ['k12'] }
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
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: '1',
          title: 'Strategic Planning Template',
          description: 'Help with strategic planning',
          audience: ['k12']
        },
        {
          id: '2',
          title: 'Budget Analysis Tool',
          description: 'Financial planning resource',
          audience: ['k12']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12&search=strategic';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(1);
      expect(data.resources[0].title).toContain('Strategic');
    });

    it('should search case-insensitively', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      (getResourcesByAudience as any).mockReturnValue([
        {
          id: '1',
          title: 'Strategic Planning Template',
          description: 'Help with strategic planning',
          audience: ['k12']
        }
      ]);

      const url = 'http://localhost:3000/api/resources?audience=k12&search=STRATEGIC';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should require audience parameter', async () => {
      const url = 'http://localhost:3000/api/resources';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('audience');
    });

    it('should validate audience parameter', async () => {
      const url = 'http://localhost:3000/api/resources?audience=invalid';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
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

    it('should include pagination metadata when applicable', async () => {
      const { getResourcesByAudience } = await import('@/lib/resources/catalog');
      const mockResources = Array.from({ length: 25 }, (_, i) => ({
        id: `resource-${i}`,
        title: `Resource ${i}`,
        audience: ['k12']
      }));
      (getResourcesByAudience as any).mockReturnValue(mockResources);

      const url = 'http://localhost:3000/api/resources?audience=k12&limit=10&offset=0';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.resources).toHaveLength(10);
      expect(data.total).toBe(25);
    });
  });
});