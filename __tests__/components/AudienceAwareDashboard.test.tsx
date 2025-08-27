/**
 * Tests for audience-aware dashboard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AudienceAwareDashboard } from '@/components/dashboard/AudienceAwareDashboard';
import { AudienceProvider } from '@/lib/audience/AudienceContext';

// Mock the analytics
vi.mock('@/lib/analytics/audienceAnalytics', () => ({
  AudienceAnalytics: vi.fn().mockImplementation(() => ({
    track: vi.fn(),
    trackDashboardView: vi.fn()
  }))
}));

// Mock the dashboard data fetch
const mockDashboardData = {
  audience: 'k12',
  metrics: {
    assessmentScore: {
      current: 65,
      level: 'Developing',
      change: '+5',
      trend: 'up'
    },
    completionRate: {
      percentage: 80,
      completed: 8,
      total: 10
    },
    lastActivity: '2024-01-15',
    activeUsers: 12
  },
  recommendations: [
    {
      id: 'k12-rec-1',
      title: 'Develop District AI Policy',
      description: 'Create comprehensive AI policy for your district',
      priority: 'high',
      category: 'policy',
      estimatedTime: '2-3 weeks',
      resources: ['policy-template', 'implementation-guide']
    }
  ]
};

global.fetch = vi.fn();

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null)
  }))
}));

describe('AudienceAwareDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockDashboardData
    });
  });

  describe('K-12 audience rendering', () => {
    it('should display K-12 specific dashboard content', async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((param) => param === 'aud' ? 'k12' : null)
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Develop District AI Policy')).toBeInTheDocument();
      });

      // Check for K-12 specific terminology
      expect(screen.getByText(/district/i)).toBeInTheDocument();
    });

    it('should display correct metrics for K-12 audience', async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((param) => param === 'aud' ? 'k12' : null)
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('65')).toBeInTheDocument(); // Score
        expect(screen.getByText('80%')).toBeInTheDocument(); // Completion rate
        expect(screen.getByText('Developing')).toBeInTheDocument(); // Level
      });
    });
  });

  describe('Higher Ed audience rendering', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockDashboardData,
          audience: 'highered',
          recommendations: [
            {
              id: 'highered-rec-1',
              title: 'Institutional AI Governance Framework',
              description: 'Establish governance structure for AI initiatives',
              priority: 'high',
              category: 'governance',
              estimatedTime: '4-6 weeks',
              resources: ['governance-template', 'committee-guide']
            }
          ]
        })
      });
    });

    it('should display Higher Ed specific dashboard content', async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((param) => param === 'aud' ? 'highered' : null)
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Institutional AI Governance Framework')).toBeInTheDocument();
      });

      // Check for Higher Ed specific terminology
      expect(screen.getByText(/institutional/i)).toBeInTheDocument();
    });
  });

  describe('loading and error states', () => {
    it('should show loading state while fetching data', () => {
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('API Error'));

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle empty recommendations', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockDashboardData,
          recommendations: []
        })
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/no recommendations/i)).toBeInTheDocument();
      });
    });
  });

  describe('analytics tracking', () => {
    it('should track dashboard views', async () => {
      const { AudienceAnalytics } = await import('@/lib/analytics/audienceAnalytics');
      const mockAnalytics = new (AudienceAnalytics as any)();

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(mockAnalytics.track).toHaveBeenCalled();
      });
    });

    it('should track recommendation interactions', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const { AudienceAnalytics } = await import('@/lib/analytics/audienceAnalytics');
      const mockAnalytics = new (AudienceAnalytics as any)();

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        const recommendation = screen.getByText('Develop District AI Policy');
        fireEvent.click(recommendation);
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          recommendationId: 'k12-rec-1'
        }),
        'k12',
        expect.any(String)
      );
    });
  });

  describe('responsive design', () => {
    it('should adapt to different screen sizes', async () => {
      // Mock window.matchMedia for responsive testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('max-width: 768px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        const dashboard = screen.getByTestId?.('audience-dashboard') || document.querySelector('[data-testid="audience-dashboard"]');
        expect(dashboard).toBeTruthy();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        const dashboard = screen.getByRole?.('main') || screen.getByTestId?.('audience-dashboard');
        expect(dashboard).toBeTruthy();
      });

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      const { fireEvent } = await import('@testing-library/react');

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        const focusableElements = screen.getAllByRole('button');
        if (focusableElements.length > 0) {
          fireEvent.keyDown(focusableElements[0], { key: 'Tab' });
          expect(focusableElements[0]).toHaveFocus();
        }
      });
    });
  });

  describe('data refresh', () => {
    it('should refresh data when audience changes', async () => {
      const { fireEvent } = await import('@testing-library/react');

      function TestWrapper() {
        return (
          <AudienceProvider>
            <AudienceAwareDashboard />
            <button onClick={() => {
              // Simulate audience change
              document.cookie = 'audience=highered; path=/';
              window.dispatchEvent(new Event('storage'));
            }}>
              Change Audience
            </button>
          </AudienceProvider>
        );
      }

      render(<TestWrapper />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(screen.getByText('Change Audience'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });
});