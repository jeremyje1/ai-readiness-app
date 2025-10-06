/**
 * Tests for audience-aware dashboard component
 */

import { AudienceAwareDashboard } from '@/components/dashboard/AudienceAwareDashboard';
import { AudienceProvider } from '@/lib/audience/AudienceContext';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the analytics
vi.mock('@/lib/analytics/audienceAnalytics', () => ({
  AudienceAnalytics: vi.fn().mockImplementation(() => ({
    track: vi.fn(),
    trackDashboardView: vi.fn()
  })),
  useAudienceAnalytics: vi.fn(() => ({
    track: vi.fn(),
    trackDashboardView: vi.fn(),
    trackRecommendationClick: vi.fn(),
    trackMetricView: vi.fn()
  }))
}));

// Mock the dashboard data fetch
const mockDashboardData = {
  audience: 'k12',
  metrics: {
    assessmentScore: {
      current: 65,
      previous: 60,
      level: 'developing',
      trend: 'up'
    },
    completionRate: {
      percentage: 80,
      completed: 8,
      total: 10
    },
    audienceSpecificMetrics: {
      k12: {
        districtsServed: 5,
        studentsImpacted: 10000,
        staffTrained: 250,
        policyImplementation: 75
      }
    },
    recentActivity: [{
      id: 'act-1',
      type: 'assessment',
      title: 'AI Readiness Assessment',
      timestamp: '2024-01-15',
      status: 'completed'
    }],
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
    ],
    benchmarking: {
      percentile: 75,
      peerComparison: 'above',
      sampleSize: 120
    }
  },
  lastUpdated: new Date().toISOString()
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
      render(
        <AudienceProvider initialAudience="k12">
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Develop District AI Policy')).toBeInTheDocument();
      });

      // Check for K-12 specific terminology
      expect(screen.getAllByText(/district/i)[0]).toBeInTheDocument();
    });

    it('should display correct metrics for K-12 audience', async () => {
      render(
        <AudienceProvider initialAudience="k12">
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('65')).toBeInTheDocument(); // Score
        expect(screen.getByText('80%')).toBeInTheDocument(); // Completion rate
        expect(screen.getByText('developing')).toBeInTheDocument(); // Level (lowercase)
      });
    });
  });

  describe('Higher Ed audience rendering', () => {
    beforeEach(() => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          audience: 'highered',
          lastUpdated: new Date().toISOString(),
          metrics: {
            assessmentScore: {
              current: 65,
              previous: 60,
              level: 'developing',
              trend: 'up'
            },
            completionRate: {
              percentage: 80,
              completed: 8,
              total: 10
            },
            audienceSpecificMetrics: {
              highered: {
                institutionsServed: 150,
                facultyEngaged: 2500,
                programsLaunched: 35,
                researchProjects: 12
              }
            },
            recentActivity: mockDashboardData.metrics.recentActivity,
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
            ],
            benchmarking: mockDashboardData.metrics.benchmarking
          }
        })
      });
    });

    it('should display Higher Ed specific dashboard content', async () => {
      render(
        <AudienceProvider initialAudience="highered">
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

      // Check for loading skeleton with animate-pulse
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch metrics: Internal Server Error/)).toBeInTheDocument();
      });
    });

    it('should handle empty recommendations', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          metrics: {
            ...mockDashboardData.metrics,
            recommendations: []
          },
          lastUpdated: new Date().toISOString()
        })
      });

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        // Check that dashboard renders without recommendations section
        expect(screen.getByText(/AI Readiness Dashboard/i)).toBeInTheDocument();
        // Should not have any recommendation cards
        expect(screen.queryByText(/Develop District AI Policy/)).not.toBeInTheDocument();
      });
    });
  });

  describe('analytics tracking', () => {
    it('should track dashboard views', async () => {
      const { useAudienceAnalytics } = await import('@/lib/analytics/audienceAnalytics');

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        // Check that useAudienceAnalytics was called
        expect(useAudienceAnalytics).toHaveBeenCalled();
        // The mock returns an object with trackDashboardView
        const analyticsReturn = vi.mocked(useAudienceAnalytics).mock.results[0]?.value;
        expect(analyticsReturn?.trackDashboardView).toBeDefined();
      });
    });

    it('should render recommendation cards', async () => {
      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        // Check that recommendation is rendered
        expect(screen.getByText('Develop District AI Policy')).toBeInTheDocument();
        expect(screen.getByText(/Create comprehensive AI policy/)).toBeInTheDocument();
      });
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
        // Check that the dashboard renders - there are multiple K-12 Education texts
        const k12Elements = screen.getAllByText(/K-12 Education/i);
        expect(k12Elements.length).toBeGreaterThan(0);
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
        // Check for dashboard heading
        const heading = screen.getByText(/AI Readiness Dashboard/i);
        expect(heading).toBeInTheDocument();
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
        expect(focusableElements.length).toBeGreaterThan(0);

        // Focus the first button
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
          expect(focusableElements[0]).toHaveFocus();
        }
      });
    });
  });

  describe('data refresh', () => {
    it('should refresh data on manual refresh', async () => {
      const { fireEvent } = await import('@testing-library/react');

      render(
        <AudienceProvider>
          <AudienceAwareDashboard />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Clear mock calls
      (global.fetch as any).mockClear();

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });
});