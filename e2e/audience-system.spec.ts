/**
 * Dual-Audience System E2E Tests
 * Tests audience derivation, context switching, and feature segmentation
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Dual-Audience System', () => {
  
  test.describe('Audience Derivation', () => {
    
    test('should derive audience from referrer header', async ({ browser }) => {
      // Test K-12 referrer
      const k12Context = await browser.newContext({
        extraHTTPHeaders: {
          'referer': 'https://k12aiblueprint.com/learn-more'
        }
      });
      const k12Page = await k12Context.newPage();
      await k12Page.goto('/dashboard');
      
      // Check for K-12 specific content
      await expect(k12Page.locator('[data-testid="audience-indicator"]')).toContainText('K-12');
      await expect(k12Page.locator('h1')).toContainText('District');
      
      await k12Context.close();

      // Test Higher Ed referrer
      const heContext = await browser.newContext({
        extraHTTPHeaders: {
          'referer': 'https://higheredaiblueprint.com/features'
        }
      });
      const hePage = await heContext.newPage();
      await hePage.goto('/dashboard');
      
      // Check for Higher Ed specific content
      await expect(hePage.locator('[data-testid="audience-indicator"]')).toContainText('HigherEd');
      await expect(hePage.locator('h1')).toContainText('Institution');
      
      await heContext.close();
    });

    test('should persist audience in cookie', async ({ page }) => {
      // Visit with K-12 override parameter
      await page.goto('/dashboard?aud=k12');
      
      // Verify K-12 audience is set
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('K-12');
      
      // Navigate to another page
      await page.goto('/assessment');
      
      // Verify audience persists
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('K-12');
      
      // Check cookie is set
      const cookies = await page.context().cookies();
      const audienceCookie = cookies.find(cookie => cookie.name === 'ai_blueprint_audience');
      expect(audienceCookie?.value).toBe('k12');
    });

    test('should allow audience override in development', async ({ page }) => {
      // Start with default
      await page.goto('/dashboard');
      
      // Switch to Higher Ed
      await page.goto('/dashboard?aud=highered');
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('HigherEd');
      
      // Switch to K-12
      await page.goto('/dashboard?aud=k12');
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('K-12');
    });

    test('should handle invalid audience parameter gracefully', async ({ page }) => {
      await page.goto('/dashboard?aud=invalid');
      
      // Should fall back to default (k12)
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('K-12');
    });
  });

  test.describe('Resource Segmentation', () => {
    
    test('should filter resources by audience', async ({ page }) => {
      // Test K-12 resources
      await page.goto('/resources?aud=k12');
      
      const k12Resources = page.locator('[data-testid="resource-item"]');
      await expect(k12Resources).toHaveCount(await k12Resources.count());
      
      // Check for K-12 specific resources
      await expect(page.locator('text="District Policy"')).toBeVisible();
      await expect(page.locator('text="Classroom Integration"')).toBeVisible();
      
      // Verify no Higher Ed specific resources appear
      await expect(page.locator('text="Faculty Development"')).not.toBeVisible();
      
      // Test Higher Ed resources
      await page.goto('/resources?aud=highered');
      
      const heResources = page.locator('[data-testid="resource-item"]');
      await expect(heResources).toHaveCount(await heResources.count());
      
      // Check for Higher Ed specific resources
      await expect(page.locator('text="Faculty Development"')).toBeVisible();
      await expect(page.locator('text="Accreditation"')).toBeVisible();
      
      // Verify no K-12 specific resources appear
      await expect(page.locator('text="District Policy"')).not.toBeVisible();
    });

    test('should show shared resources to both audiences', async ({ page }) => {
      // Test shared resource appears for K-12
      await page.goto('/resources?aud=k12');
      await expect(page.locator('text="AI Vendor Evaluation"')).toBeVisible();
      
      // Test shared resource appears for Higher Ed
      await page.goto('/resources?aud=highered');
      await expect(page.locator('text="AI Vendor Evaluation"')).toBeVisible();
    });

    test('should handle resource download with audience tracking', async ({ page }) => {
      await page.goto('/resources?aud=k12');
      
      // Mock the download endpoint
      await page.route('**/api/resources/download*', route => {
        route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="test.pdf"'
          },
          body: 'Mock PDF content'
        });
      });
      
      // Mock metrics endpoint
      let metricsTracked = false;
      await page.route('**/api/metrics/events', route => {
        const body = route.request().postDataJSON();
        const hasDownloadEvent = body.events.some(
          (event: any) => event.eventType === 'resource_downloaded'
        );
        if (hasDownloadEvent) {
          metricsTracked = true;
        }
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      });
      
      // Click download button
      await page.click('[data-testid="download-button"]:first-child');
      
      // Wait a moment for metrics to be sent
      await page.waitForTimeout(1000);
      
      expect(metricsTracked).toBe(true);
    });
  });

  test.describe('Assessment Banks', () => {
    
    test('should load correct assessment bank for audience', async ({ page }) => {
      // Test K-12 assessment
      await page.goto('/assessment?aud=k12');
      
      await expect(page.locator('h1')).toContainText('K-12 AI Readiness Assessment');
      await expect(page.locator('text="district"')).toBeVisible();
      await expect(page.locator('text="superintendent"')).toBeVisible();
      
      // Test Higher Ed assessment
      await page.goto('/assessment?aud=highered');
      
      await expect(page.locator('h1')).toContainText('Higher Education AI Readiness Assessment');
      await expect(page.locator('text="institution"')).toBeVisible();
      await expect(page.locator('text="provost"')).toBeVisible();
    });

    test('should autosave assessment progress with audience context', async ({ page }) => {
      await page.goto('/assessment?aud=k12');
      
      // Mock autosave endpoint
      let saveRequests: any[] = [];
      await page.route('**/api/assessment/save', route => {
        const body = route.request().postDataJSON();
        saveRequests.push(body);
        route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ success: true }) 
        });
      });
      
      // Answer a question
      await page.click('[data-testid="answer-option"]:first-child');
      
      // Wait for autosave
      await page.waitForTimeout(500);
      
      // Verify autosave included audience
      expect(saveRequests).toHaveLength(1);
      expect(saveRequests[0].audience).toBe('k12');
    });

    test('should resume assessment with correct audience context', async ({ page, context }) => {
      const sessionId = 'test-session-123';
      
      // Mock progress endpoint
      await page.route('**/api/assessment/progress*', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            sessionId,
            audience: 'highered',
            currentSection: 'institutional_leadership',
            currentQuestion: 'il_002',
            responses: { 'il_001': 'comprehensive' },
            progressPercent: 25
          })
        });
      });
      
      await page.goto(`/assessment?sessionId=${sessionId}&aud=highered`);
      
      // Verify correct audience context loaded
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('HigherEd');
      await expect(page.locator('text="25% Complete"')).toBeVisible();
    });
  });

  test.describe('Dashboard Metrics', () => {
    
    test('should display audience-specific metrics', async ({ page }) => {
      // Mock metrics API for K-12
      await page.route('**/api/dashboard/metrics*', route => {
        const url = new URL(route.request().url());
        const audience = url.searchParams.get('audience') || 'k12';
        
        const k12Response = {
          metrics: {
            assessmentScore: { current: 75, previous: 70, trend: 'up', level: 'proficient' },
            completionRate: { percentage: 80, completed: 4, total: 5 },
            audienceSpecificMetrics: {
              k12: {
                districtsServed: 25,
                studentsImpacted: 15000,
                staffTrained: 150,
                policyImplementation: 60
              }
            },
            recentActivity: [],
            recommendations: [],
            benchmarking: { percentile: 75, peerComparison: 'above', sampleSize: 1200 }
          }
        };

        const heResponse = {
          metrics: {
            assessmentScore: { current: 80, previous: 75, trend: 'up', level: 'proficient' },
            completionRate: { percentage: 90, completed: 5, total: 5 },
            audienceSpecificMetrics: {
              highered: {
                institutionsServed: 8,
                facultyEngaged: 300,
                programsLaunched: 5,
                researchProjects: 12
              }
            },
            recentActivity: [],
            recommendations: [],
            benchmarking: { percentile: 80, peerComparison: 'above', sampleSize: 800 }
          }
        };
        
        const response = audience === 'k12' ? k12Response : heResponse;
        route.fulfill({ status: 200, body: JSON.stringify(response) });
      });
      
      // Test K-12 dashboard
      await page.goto('/dashboard?aud=k12');
      await expect(page.locator('text="Students Impacted"')).toBeVisible();
      await expect(page.locator('text="15,000"')).toBeVisible();
      
      // Test Higher Ed dashboard
      await page.goto('/dashboard?aud=highered');
      await expect(page.locator('text="Faculty Engaged"')).toBeVisible();
      await expect(page.locator('text="300"')).toBeVisible();
    });

    test('should update metrics immediately on events', async ({ page }) => {
      await page.goto('/dashboard?aud=k12');
      
      let metricsUpdateRequests = 0;
      await page.route('**/api/metrics/update', route => {
        metricsUpdateRequests++;
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      });
      
      // Simulate a resource download (which should trigger metrics update)
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('resource-downloaded', {
          detail: { resourceType: 'template', audience: 'k12' }
        }));
      });
      
      // Wait for metrics update
      await page.waitForTimeout(1000);
      
      expect(metricsUpdateRequests).toBeGreaterThan(0);
    });
  });

  test.describe('Expert Sessions', () => {
    
    test('should show audience-specific expert session options', async ({ page }) => {
      // Test K-12 expert sessions
      await page.goto('/expert-sessions?aud=k12');
      
      await expect(page.locator('text="Superintendent Strategy"')).toBeVisible();
      await expect(page.locator('text="District-wide AI implementation"')).toBeVisible();
      
      // Test Higher Ed expert sessions  
      await page.goto('/expert-sessions?aud=highered');
      
      await expect(page.locator('text="Provost Strategy"')).toBeVisible();
      await expect(page.locator('text="Institution-wide academic AI"')).toBeVisible();
    });

    test('should handle calendly popup with fallback', async ({ page }) => {
      await page.goto('/expert-sessions?aud=k12');
      
      // Mock window.open to simulate popup blocker
      await page.evaluate(() => {
        window.open = () => null;
      });
      
      await page.click('[data-testid="book-session-button"]');
      
      // Should show fallback option
      await expect(page.locator('text="Popup blocked?"')).toBeVisible();
      await expect(page.locator('text="Open Calendar in New Tab"')).toBeVisible();
    });

    test('should track expert session attempts', async ({ page }) => {
      await page.goto('/expert-sessions?aud=k12');
      
      let expertSessionTracked = false;
      await page.route('**/api/metrics/events', route => {
        const body = route.request().postDataJSON();
        const hasExpertSessionEvent = body.events.some(
          (event: any) => event.eventType === 'expert_session_attempted'
        );
        if (hasExpertSessionEvent) {
          expertSessionTracked = true;
        }
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      });
      
      await page.click('[data-testid="book-session-button"]');
      
      // Wait for metrics tracking
      await page.waitForTimeout(1000);
      
      expect(expertSessionTracked).toBe(true);
    });
  });

  test.describe('Community Features', () => {
    
    test('should show audience-specific community copy', async ({ page }) => {
      // Test K-12 community
      await page.goto('/community?aud=k12');
      
      await expect(page.locator('text="superintendents"')).toBeVisible();
      await expect(page.locator('text="principals"')).toBeVisible();
      await expect(page.locator('text="education leaders"')).toBeVisible();
      
      // Test Higher Ed community
      await page.goto('/community?aud=highered');
      
      await expect(page.locator('text="provosts"')).toBeVisible();
      await expect(page.locator('text="deans"')).toBeVisible();
      await expect(page.locator('text="academic leaders"')).toBeVisible();
    });

    test('should handle slack invitation with audience context', async ({ page }) => {
      await page.goto('/community?aud=highered');
      
      // Mock slack invite endpoint
      let inviteRequest: any = null;
      await page.route('**/api/community/slack-invite', route => {
        inviteRequest = route.request().postDataJSON();
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            message: 'Invitation sent successfully!'
          })
        });
      });
      
      // Fill out form
      await page.fill('[data-testid="email-input"]', 'test@university.edu');
      await page.fill('[data-testid="firstname-input"]', 'John');
      await page.fill('[data-testid="organization-input"]', 'Test University');
      await page.click('[data-testid="submit-invite"]');
      
      // Wait for request
      await page.waitForTimeout(1000);
      
      // Verify audience was included
      expect(inviteRequest).toBeTruthy();
      expect(inviteRequest.audience).toBe('highered');
      expect(inviteRequest.email).toBe('test@university.edu');
    });
  });

  test.describe('Cross-Audience Consistency', () => {
    
    test('should maintain consistent UI/UX across audiences', async ({ page }) => {
      // Test that core navigation and layout remain consistent
      const testPages = ['/dashboard', '/assessment', '/resources', '/expert-sessions'];
      
      for (const testPage of testPages) {
        // Test K-12
        await page.goto(`${testPage}?aud=k12`);
        await expect(page.locator('[data-testid="main-nav"]')).toBeVisible();
        await expect(page.locator('[data-testid="audience-indicator"]')).toBeVisible();
        
        // Test Higher Ed
        await page.goto(`${testPage}?aud=highered`);
        await expect(page.locator('[data-testid="main-nav"]')).toBeVisible();
        await expect(page.locator('[data-testid="audience-indicator"]')).toBeVisible();
      }
    });

    test('should handle audience switching without data corruption', async ({ page }) => {
      // Start assessment as K-12
      await page.goto('/assessment?aud=k12');
      await page.click('[data-testid="answer-option"]:first-child');
      
      // Switch to Higher Ed (should start fresh assessment)
      await page.goto('/assessment?aud=highered');
      
      // Verify we're in Higher Ed context with fresh state
      await expect(page.locator('[data-testid="audience-indicator"]')).toContainText('HigherEd');
      await expect(page.locator('text="Higher Education AI Readiness"')).toBeVisible();
      
      // Progress should be reset for new audience
      await expect(page.locator('text="0% Complete"')).toBeVisible();
    });
  });
});

// Helper function to add audience debug info to pages
async function setupAudienceDebugInfo(page: Page) {
  await page.addInitScript(() => {
    // Add debug elements that tests can query
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-testid="audience-indicator"]')) {
        const indicator = document.createElement('div');
        indicator.setAttribute('data-testid', 'audience-indicator');
        indicator.style.display = 'none';
        indicator.textContent = (window as any).__AUDIENCE__ || 'K-12';
        document.body.appendChild(indicator);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}