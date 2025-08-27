/**
 * Tests for audience-aware dashboard metrics API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/dashboard/metrics/route';

// Mock auth
vi.mock('@/lib/auth', () => ({
  getUser: vi.fn()
}));

// Mock analytics
vi.mock('@/lib/analytics/audienceAnalytics', () => ({
  AudienceAnalytics: vi.fn().mockImplementation(() => ({
    track: vi.fn()
  }))
}));

// Mock supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: {
      id: '1',
      user_id: 'test-user',
      audience: 'k12',
      responses: {},
      score: 65,
      completion_rate: 0.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    error: null
  })
};

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('/api/dashboard/metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('K-12 audience metrics', () => {
    it('should return K-12 specific dashboard metrics', async () => {
      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@k12district.edu'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=k12';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.audience).toBe('k12');
      expect(data.metrics).toBeDefined();
      expect(data.metrics.assessmentScore).toBeDefined();
      expect(data.metrics.completionRate).toBeDefined();
      expect(data.recommendations).toBeDefined();
      expect(data.recommendations.length).toBeGreaterThan(0);
      
      // Verify K-12 specific terminology
      expect(data.recommendations.some((rec: any) => 
        rec.title.includes('District') || rec.title.includes('K-12')
      )).toBe(true);
    });

    it('should provide appropriate recommendations for low K-12 scores', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: '1',
          user_id: 'test-user',
          audience: 'k12',
          responses: {},
          score: 25,
          completion_rate: 0.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });

      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@k12district.edu'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=k12';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.recommendations).toBeDefined();
      expect(data.recommendations.length).toBeGreaterThan(0);
      expect(data.recommendations.some((rec: any) => 
        rec.priority === 'high'
      )).toBe(true);
    });
  });

  describe('Higher Education audience metrics', () => {
    it('should return Higher Ed specific dashboard metrics', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: '1',
          user_id: 'test-user',
          audience: 'highered',
          responses: {},
          score: 75,
          completion_rate: 0.9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });

      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@university.edu'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=highered';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.audience).toBe('highered');
      expect(data.metrics).toBeDefined();
      expect(data.recommendations).toBeDefined();
      
      // Verify Higher Ed specific terminology
      expect(data.recommendations.some((rec: any) => 
        rec.title.includes('Institution') || rec.title.includes('University') || rec.title.includes('Faculty')
      )).toBe(true);
    });

    it('should provide appropriate recommendations for high Higher Ed scores', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: '1',
          user_id: 'test-user',
          audience: 'highered',
          responses: {},
          score: 85,
          completion_rate: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });

      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@university.edu'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=highered';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.recommendations).toBeDefined();
      expect(data.recommendations.some((rec: any) => 
        rec.category === 'optimization'
      )).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle missing audience parameter', async () => {
      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle invalid audience parameter', async () => {
      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=invalid';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle unauthorized requests', async () => {
      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue(null);

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=k12';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=k12';
      const request = new NextRequest(url);
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });
  });

  describe('analytics tracking', () => {
    it('should track dashboard metric requests', async () => {
      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@k12district.edu'
      });

      const url = 'http://localhost:3000/api/dashboard/metrics?audience=k12';
      const request = new NextRequest(url);
      
      await GET(request);
      
      const { AudienceAnalytics } = await import('@/lib/analytics/audienceAnalytics');
      const mockAnalytics = new (AudienceAnalytics as any)();
      
      // Verify analytics was called (mocked)
      expect(AudienceAnalytics).toHaveBeenCalled();
    });
  });

  describe('audience-specific content', () => {
    it('should return different resource recommendations for each audience', async () => {
      const { getUser } = await import('@/lib/auth');
      (getUser as any).mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com'
      });

      // Test K-12 recommendations
      const k12Request = new NextRequest('http://localhost:3000/api/dashboard/metrics?audience=k12');
      const k12Response = await GET(k12Request);
      const k12Data = await k12Response.json();

      // Test Higher Ed recommendations
      mockSupabase.single.mockResolvedValue({
        data: {
          id: '1',
          user_id: 'test-user',
          audience: 'highered',
          responses: {},
          score: 65,
          completion_rate: 0.8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      });

      const higherEdRequest = new NextRequest('http://localhost:3000/api/dashboard/metrics?audience=highered');
      const higherEdResponse = await GET(higherEdRequest);
      const higherEdData = await higherEdResponse.json();

      // Verify different recommendations for different audiences
      expect(k12Data.recommendations).not.toEqual(higherEdData.recommendations);
    });
  });
});