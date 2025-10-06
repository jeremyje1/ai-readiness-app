/**
 * Tests for audience context provider and hooks
 */

import {
  AudienceProvider,
  useAudience,
  useAudienceCopy,
  useAudienceNouns
} from '@/lib/audience/AudienceContext';
import { getAudienceCookieClient, setAudienceCookieClient } from '@/lib/audience/cookie';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Test component for hook testing
function TestComponent() {
  const { audience, setAudience, loading } = useAudience();
  const copy = useAudienceCopy();
  const nouns = useAudienceNouns();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="audience">{audience}</div>
      <div data-testid="welcome-message">{copy.dashboard}</div>
      <div data-testid="organization-noun">{nouns.organization}</div>
      <div data-testid="leader-noun">{nouns.leader}</div>
      <button
        data-testid="change-audience"
        onClick={() => setAudience(audience === 'k12' ? 'highered' : 'k12')}
      >
        Change Audience
      </button>
    </div>
  );
}

// Mock audience detection
vi.mock('@/lib/audience/deriveAudience', () => ({
  deriveAudience: vi.fn().mockReturnValue({
    audience: 'k12',
    source: 'default',
    confidence: 'low'
  })
}));

// Mock cookie utilities
vi.mock('@/lib/audience/cookie', () => ({
  AUDIENCE_COOKIE_NAME: 'audience',
  getAudienceCookieClient: vi.fn().mockReturnValue('k12'),
  setAudienceCookieClient: vi.fn()
}));

// Mock Next.js router
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

describe('AudienceContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing cookies
    document.cookie = 'audience=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Reset cookie mock to default k12
    vi.mocked(getAudienceCookieClient).mockReturnValue('k12');
  });

  describe('AudienceProvider', () => {
    it('should provide default K-12 audience when no detection occurs', async () => {
      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('audience')).toHaveTextContent('k12');
    });

    it('should accept initial audience from prop', async () => {
      // Mock cookie to return null so initialAudience is used
      vi.mocked(getAudienceCookieClient).mockReturnValue(null);

      render(
        <AudienceProvider initialAudience="highered">
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('audience')).toHaveTextContent('highered');
    });

    it('should detect audience from cookies', async () => {
      // Mock getAudienceCookieClient to return highered
      vi.mocked(getAudienceCookieClient).mockReturnValue('highered');

      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('audience')).toHaveTextContent('highered');
    });

    it('should allow manual audience changes', async () => {
      // Reset getAudienceCookieClient to not interfere with state changes
      vi.mocked(getAudienceCookieClient).mockReturnValue(null);

      render(
        <AudienceProvider allowClientOverride={true}>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('audience')).toHaveTextContent('k12');

      // Click the change button
      const changeButton = screen.getByTestId('change-audience');
      fireEvent.click(changeButton);

      // Wait for the state to update
      await waitFor(() => {
        expect(screen.getByTestId('audience')).toHaveTextContent('highered');
      }, { timeout: 2000 });

      // Verify setAudienceCookieClient was called
      expect(setAudienceCookieClient).toHaveBeenCalledWith('highered');
    });

    it('should persist audience changes in cookies', async () => {
      // Mock setAudienceCookieClient to also update document.cookie
      vi.mocked(setAudienceCookieClient).mockImplementation((audience) => {
        document.cookie = `ai_blueprint_audience=${audience}; path=/`;
      });

      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('change-audience'));

      await waitFor(() => {
        expect(setAudienceCookieClient).toHaveBeenCalledWith('highered');
        expect(document.cookie).toContain('ai_blueprint_audience=highered');
      });
    });
  });

  describe('useAudienceCopy hook', () => {
    it('should provide K-12 specific copy', async () => {
      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const welcomeMessage = screen.getByTestId('welcome-message');
      expect(welcomeMessage.textContent?.toLowerCase()).toContain('district');
    });

    it('should provide Higher Ed specific copy', async () => {
      // Mock cookie to return highered
      vi.mocked(getAudienceCookieClient).mockReturnValue('highered');

      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const welcomeMessage = screen.getByTestId('welcome-message');
      expect(welcomeMessage.textContent?.toLowerCase()).toContain('institution');
    });
  });

  describe('useAudienceNouns hook', () => {
    it('should provide K-12 specific nouns', async () => {
      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('organization-noun')).toHaveTextContent('District');
      expect(screen.getByTestId('leader-noun')).toHaveTextContent('Superintendent');
    });

    it('should provide Higher Ed specific nouns', async () => {
      // Mock cookie to return highered
      vi.mocked(getAudienceCookieClient).mockReturnValue('highered');

      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('organization-noun')).toHaveTextContent('Institution');
      expect(screen.getByTestId('leader-noun')).toHaveTextContent('Provost');
    });
  });

  describe('error handling', () => {
    it('should handle invalid audience values gracefully', async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((param) => param === 'aud' ? 'invalid' : null)
      });

      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should fall back to default K-12 audience
      expect(screen.getByTestId('audience')).toHaveTextContent('k12');
    });

    it('should handle corrupted cookie values', async () => {
      document.cookie = 'audience=corrupted-value; path=/';

      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should fall back to default K-12 audience
      expect(screen.getByTestId('audience')).toHaveTextContent('k12');
    });
  });

  describe('loading states', () => {
    // Skip loading state test as it hydrates too quickly in test environment
    it.skip('should show loading state during initialization', () => {
      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide loading state after initialization', async () => {
      render(
        <AudienceProvider>
          <TestComponent />
        </AudienceProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});