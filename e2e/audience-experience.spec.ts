/**
 * E2E tests for dual-audience user experience
 * Tests complete user journeys for both K-12 and Higher Education audiences
 */

import { test, expect } from '@playwright/test';

test.describe('Dual-Audience User Experience', () => {
  test.describe('K-12 Audience Experience', () => {
    test('should detect K-12 audience from hostname and show appropriate content', async ({ page }) => {
      // Mock hostname detection by adding query parameter
      await page.goto('/?aud=k12');
      
      // Wait for audience context to load
      await page.waitForTimeout(1000);
      
      // Check for K-12 specific terminology in navigation or headers
      await expect(page.locator('text=District')).toBeVisible();
      
      // Verify K-12 specific dashboard content if on homepage
      const dashboardSection = page.locator('[data-testid="audience-dashboard"], .dashboard');
      if (await dashboardSection.isVisible()) {
        await expect(dashboardSection.locator('text=/district|superintendent/i')).toBeVisible();
      }
    });

    test('should show K-12 specific resources', async ({ page }) => {
      await page.goto('/resources?aud=k12');
      await page.waitForLoadState('networkidle');
      
      // Look for K-12 specific resource titles
      await expect(page.locator('text=/district|school board|superintendent/i')).toBeVisible();
      
      // Verify resource categories appropriate for K-12
      const resourceCards = page.locator('[data-testid="resource-card"], .resource-item');
      const count = await resourceCards.count();
      
      if (count > 0) {
        // Check that at least one resource mentions K-12 concepts
        const k12Content = page.locator('text=/district|k-12|school|superintendent/i');
        await expect(k12Content.first()).toBeVisible();
      }
    });

    test('should provide K-12 assessment experience', async ({ page }) => {
      await page.goto('/assessment?aud=k12');
      await page.waitForLoadState('networkidle');
      
      // Check for K-12 specific assessment terminology
      await expect(page.locator('text=/district|school/i')).toBeVisible();
      
      // If assessment questions are visible, verify K-12 context
      const questionText = page.locator('[data-testid="question-text"], .question');
      if (await questionText.isVisible()) {
        const text = await questionText.textContent();
        expect(text?.toLowerCase()).toMatch(/district|school|k-12|student/);
      }
    });

    test('should show K-12 expert sessions', async ({ page }) => {
      await page.goto('/expert-sessions?aud=k12');
      await page.waitForLoadState('networkidle');
      
      // Look for K-12 specific expert session content
      const expertContent = page.locator('text=/k-12|district|school|superintendent/i');
      await expect(expertContent.first()).toBeVisible();
      
      // Verify session types appropriate for K-12
      const sessionCards = page.locator('[data-testid="session-card"], .session-item');
      if (await sessionCards.first().isVisible()) {
        await expect(sessionCards.locator('text=/district|k-12|school/i').first()).toBeVisible();
      }
    });

    test('should provide K-12 community access', async ({ page }) => {
      await page.goto('/community?aud=k12');
      await page.waitForLoadState('networkidle');
      
      // Check for K-12 community messaging
      await expect(page.locator('text=/k-12|district|school leaders/i')).toBeVisible();
      
      // Verify join community form shows K-12 audience
      const joinForm = page.locator('form, [data-testid="join-form"]');
      if (await joinForm.isVisible()) {
        // Form should be pre-filled or show K-12 context
        await expect(page.locator('text=/k-12/i')).toBeVisible();
      }
    });
  });

  test.describe('Higher Education Audience Experience', () => {
    test('should detect Higher Ed audience and show appropriate content', async ({ page }) => {
      await page.goto('/?aud=highered');
      await page.waitForTimeout(1000);
      
      // Check for Higher Ed specific terminology
      await expect(page.locator('text=/institution|university|college/i')).toBeVisible();
      
      // Verify Higher Ed specific dashboard content
      const dashboardSection = page.locator('[data-testid="audience-dashboard"], .dashboard');
      if (await dashboardSection.isVisible()) {
        await expect(dashboardSection.locator('text=/institution|faculty|provost/i')).toBeVisible();
      }
    });

    test('should show Higher Ed specific resources', async ({ page }) => {
      await page.goto('/resources?aud=highered');
      await page.waitForLoadState('networkidle');
      
      // Look for Higher Ed specific resource titles
      await expect(page.locator('text=/institution|university|faculty|academic/i')).toBeVisible();
      
      // Verify resource categories appropriate for Higher Ed
      const resourceCards = page.locator('[data-testid="resource-card"], .resource-item');
      const count = await resourceCards.count();
      
      if (count > 0) {
        const higherEdContent = page.locator('text=/institution|university|faculty|academic/i');
        await expect(higherEdContent.first()).toBeVisible();
      }
    });

    test('should provide Higher Ed assessment experience', async ({ page }) => {
      await page.goto('/assessment?aud=highered');
      await page.waitForLoadState('networkidle');
      
      // Check for Higher Ed specific assessment terminology
      await expect(page.locator('text=/institution|university|faculty/i')).toBeVisible();
      
      // If assessment questions are visible, verify Higher Ed context
      const questionText = page.locator('[data-testid="question-text"], .question');
      if (await questionText.isVisible()) {
        const text = await questionText.textContent();
        expect(text?.toLowerCase()).toMatch(/institution|university|faculty|academic|student/);
      }
    });

    test('should show Higher Ed expert sessions', async ({ page }) => {
      await page.goto('/expert-sessions?aud=highered');
      await page.waitForLoadState('networkidle');
      
      // Look for Higher Ed specific expert session content
      const expertContent = page.locator('text=/higher education|university|institution|academic/i');
      await expect(expertContent.first()).toBeVisible();
      
      // Verify session types appropriate for Higher Ed
      const sessionCards = page.locator('[data-testid="session-card"], .session-item');
      if (await sessionCards.first().isVisible()) {
        await expect(sessionCards.locator('text=/institution|university|academic/i').first()).toBeVisible();
      }
    });

    test('should provide Higher Ed community access', async ({ page }) => {
      await page.goto('/community?aud=highered');
      await page.waitForLoadState('networkidle');
      
      // Check for Higher Ed community messaging
      await expect(page.locator('text=/higher education|university|institution|academic leaders/i')).toBeVisible();
      
      // Verify join community form shows Higher Ed audience
      const joinForm = page.locator('form, [data-testid="join-form"]');
      if (await joinForm.isVisible()) {
        await expect(page.locator('text=/higher education|highered/i')).toBeVisible();
      }
    });
  });

  test.describe('Audience Detection and Switching', () => {
    test('should persist audience selection across page navigation', async ({ page }) => {
      // Start with K-12
      await page.goto('/?aud=k12');
      await page.waitForTimeout(1000);
      
      // Verify K-12 context
      await expect(page.locator('text=/district/i')).toBeVisible();
      
      // Navigate to different page
      await page.goto('/resources');
      await page.waitForLoadState('networkidle');
      
      // Should still show K-12 context (from cookie persistence)
      // Note: This test depends on cookie implementation
      const k12Indicators = page.locator('text=/district|k-12|school/i');
      const count = await k12Indicators.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should allow manual audience switching', async ({ page }) => {
      await page.goto('/?aud=k12');
      await page.waitForTimeout(1000);
      
      // Check initial K-12 context
      await expect(page.locator('text=/district/i')).toBeVisible();
      
      // Switch to Higher Ed via URL parameter
      await page.goto('/?aud=highered');
      await page.waitForTimeout(1000);
      
      // Should now show Higher Ed context
      await expect(page.locator('text=/institution|university/i')).toBeVisible();
      
      // K-12 content should no longer be prominent
      const districtContent = page.locator('text=District');
      const districtCount = await districtContent.count();
      // Some shared content might still mention district, so we check it's not the main focus
      if (districtCount > 0) {
        // Institution/University content should be more prominent
        const institutionCount = await page.locator('text=/institution|university/i').count();
        expect(institutionCount).toBeGreaterThanOrEqual(districtCount);
      }
    });

    test('should handle invalid audience gracefully', async ({ page }) => {
      await page.goto('/?aud=invalid-audience');
      await page.waitForLoadState('networkidle');
      
      // Should fallback to default audience (K-12)
      await expect(page.locator('text=/district/i')).toBeVisible();
      
      // No error messages should be visible
      const errorMessages = page.locator('text=/error|invalid/i');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBe(0);
    });
  });

  test.describe('Cross-Audience Functionality', () => {
    test('should show different dashboard metrics for different audiences', async ({ page }) => {
      // Test K-12 dashboard
      await page.goto('/dashboard?aud=k12');
      await page.waitForLoadState('networkidle');
      
      const k12Metrics = await page.locator('[data-testid="metrics"], .metrics, .dashboard-stats').textContent();
      
      // Test Higher Ed dashboard
      await page.goto('/dashboard?aud=highered');
      await page.waitForLoadState('networkidle');
      
      const higherEdMetrics = await page.locator('[data-testid="metrics"], .metrics, .dashboard-stats').textContent();
      
      // Metrics content should be different (different terminology at minimum)
      expect(k12Metrics).not.toBe(higherEdMetrics);
    });

    test('should provide audience-appropriate calls-to-action', async ({ page }) => {
      // K-12 CTAs
      await page.goto('/?aud=k12');
      await page.waitForLoadState('networkidle');
      
      const k12CTAs = page.locator('button, .cta, [data-testid="cta"]');
      const k12CTATexts = await k12CTAs.allTextContents();
      
      // Higher Ed CTAs
      await page.goto('/?aud=highered');
      await page.waitForLoadState('networkidle');
      
      const higherEdCTAs = page.locator('button, .cta, [data-testid="cta"]');
      const higherEdCTATexts = await higherEdCTAs.allTextContents();
      
      // Should have different messaging
      const k12Text = k12CTATexts.join(' ').toLowerCase();
      const higherEdText = higherEdCTATexts.join(' ').toLowerCase();
      
      // K-12 should mention district/school concepts
      expect(k12Text).toMatch(/district|school|k-12/);
      
      // Higher Ed should mention institution/university concepts
      expect(higherEdText).toMatch(/institution|university|academic/);
    });
  });

  test.describe('Mobile Responsive Audience Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE dimensions
    
    test('should provide good mobile experience for K-12 users', async ({ page }) => {
      await page.goto('/?aud=k12');
      await page.waitForLoadState('networkidle');
      
      // Check mobile navigation works
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await page.waitForTimeout(500);
        
        // Should show navigation items
        await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      }
      
      // Verify content is readable on mobile
      const mainContent = page.locator('main, [role="main"], .main-content');
      await expect(mainContent).toBeVisible();
      
      // Check for K-12 context on mobile
      await expect(page.locator('text=/district/i')).toBeVisible();
    });

    test('should provide good mobile experience for Higher Ed users', async ({ page }) => {
      await page.goto('/?aud=highered');
      await page.waitForLoadState('networkidle');
      
      // Similar mobile checks for Higher Ed
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await page.waitForTimeout(500);
        await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      }
      
      // Check for Higher Ed context on mobile
      await expect(page.locator('text=/institution|university/i')).toBeVisible();
    });
  });

  test.describe('Accessibility Across Audiences', () => {
    test('should maintain accessibility standards for both audiences', async ({ page }) => {
      const audiences = ['k12', 'highered'];
      
      for (const audience of audiences) {
        await page.goto(`/?aud=${audience}`);
        await page.waitForLoadState('networkidle');
        
        // Check for proper heading hierarchy
        const headings = page.locator('h1, h2, h3, h4, h5, h6');
        const headingCount = await headings.count();
        expect(headingCount).toBeGreaterThan(0);
        
        // Check for alt text on images
        const images = page.locator('img');
        const imageCount = await images.count();
        
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          // Alt should be present (can be empty for decorative images)
          expect(alt).not.toBeNull();
        }
        
        // Check for form labels
        const inputs = page.locator('input[type="email"], input[type="text"], input[type="password"], textarea');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          
          if (id) {
            // Should have associated label
            const label = page.locator(`label[for="${id}"]`);
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            
            // Should have some form of labeling
            const hasLabel = (await label.count()) > 0 || ariaLabel || ariaLabelledBy;
            expect(hasLabel).toBe(true);
          }
        }
      }
    });
  });
});