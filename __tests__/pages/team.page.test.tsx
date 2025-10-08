/**
 * Tests for the team workspace gating logic
 */

import TeamWorkspacePage from '@/app/team/page';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useSubscription', () => ({
    useSubscription: vi.fn()
}));

import { useSubscription } from '@/hooks/useSubscription';

const mockUseSubscription = vi.mocked(useSubscription);

describe('TeamWorkspacePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows upgrade messaging when premium collaboration is unavailable', () => {
        mockUseSubscription.mockReturnValue({
            isLoading: false,
            hasActiveSubscription: false,
            isTrialUser: false,
            trialEndsAt: null,
            daysLeftInTrial: 0,
            subscriptionTier: 'free',
            canAccessPremiumFeatures: false
        });

        render(<TeamWorkspacePage />);

        expect(screen.getByText('Unlock Unlimited Team Invites')).toBeInTheDocument();
        expect(screen.getByText(/unlimited team invitations/i)).toBeInTheDocument();
    });

    it('grants workspace access to trial accounts with collaboration benefits', () => {
        mockUseSubscription.mockReturnValue({
            isLoading: false,
            hasActiveSubscription: false,
            isTrialUser: true,
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysLeftInTrial: 7,
            subscriptionTier: 'ai-blueprint-edu',
            canAccessPremiumFeatures: true
        });

        render(<TeamWorkspacePage />);

        expect(screen.getByText('Team Workspace')).toBeInTheDocument();
        expect(screen.queryByText('Unlock Unlimited Team Invites')).not.toBeInTheDocument();
    });
});
