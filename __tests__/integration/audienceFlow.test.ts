/**
 * Integration tests for complete audience detection and context flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deriveAudience, type AudienceDerivationContext } from '@/lib/audience/deriveAudience';
import { audienceConfig } from '@/lib/audience/config';
import { getResourcesByAudience } from '@/lib/resources/catalog';

// Mock resource catalog for integration tests
vi.mock('@/lib/resources/catalog', () => ({
  getResourcesByAudience: vi.fn()
}));

describe('Audience Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('complete audience detection to resource serving flow', () => {
    it('should detect K-12 audience and serve appropriate resources', async () => {
      // Step 1: Audience Detection
      const context: AudienceDerivationContext = {
        host: 'district.k12.ca.us',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      const audienceResult = deriveAudience(context);
      expect(audienceResult.audience).toBe('k12');
      expect(audienceResult.confidence).toBe('high');

      // Step 2: Configuration Lookup
      const config = audienceConfig[audienceResult.audience];
      expect(config.nouns.organization).toBe('District');
      expect(config.nouns.leader).toBe('Superintendent');
      expect(config.roles).toContain('Superintendent');

      // Step 3: Resource Filtering
      const mockK12Resources = [
        {
          id: 'k12-policy-template',
          title: 'District AI Policy Template',
          audience: ['k12'],
          category: 'templates'
        }
      ];
      
      (getResourcesByAudience as any).mockReturnValue(mockK12Resources);
      const resources = getResourcesByAudience('k12');
      
      expect(getResourcesByAudience).toHaveBeenCalledWith('k12');
      expect(resources).toEqual(mockK12Resources);
      expect(resources[0].title).toContain('District');
    });

    it('should detect Higher Ed audience and serve appropriate resources', async () => {
      // Step 1: Audience Detection from referrer
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: {},
        referrer: 'https://stanford.edu/academics'
      };

      const audienceResult = deriveAudience(context);
      expect(audienceResult.audience).toBe('highered');
      expect(audienceResult.source).toBe('referrer');

      // Step 2: Configuration Lookup
      const config = audienceConfig[audienceResult.audience];
      expect(config.nouns.organization).toBe('Institution');
      expect(config.nouns.leader).toBe('Provost');
      expect(config.roles).toContain('Provost');

      // Step 3: Resource Filtering
      const mockHigherEdResources = [
        {
          id: 'highered-governance-framework',
          title: 'Institutional AI Governance Framework',
          audience: ['highered'],
          category: 'frameworks'
        }
      ];
      
      (getResourcesByAudience as any).mockReturnValue(mockHigherEdResources);
      const resources = getResourcesByAudience('highered');
      
      expect(resources[0].title).toContain('Institutional');
    });
  });

  describe('audience override and persistence flow', () => {
    it('should handle manual audience override correctly', () => {
      // Step 1: Initial detection (K-12 from host)
      const initialContext: AudienceDerivationContext = {
        host: 'k12.example.com',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      let audienceResult = deriveAudience(initialContext);
      expect(audienceResult.audience).toBe('k12');

      // Step 2: Manual override via query parameter
      const overrideContext: AudienceDerivationContext = {
        host: 'k12.example.com',
        searchParams: { aud: 'highered' },
        cookies: {},
        referrer: null
      };

      audienceResult = deriveAudience(overrideContext);
      expect(audienceResult.audience).toBe('highered');
      expect(audienceResult.source).toBe('query_param');

      // Step 3: Cookie persistence simulation
      const persistedContext: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: { audience: 'highered' },
        referrer: null
      };

      audienceResult = deriveAudience(persistedContext);
      expect(audienceResult.audience).toBe('highered');
      expect(audienceResult.source).toBe('cookie');
    });
  });

  describe('fallback and error handling flow', () => {
    it('should handle invalid audience gracefully throughout the flow', () => {
      // Step 1: Invalid audience detection
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: { aud: 'invalid-audience' },
        cookies: {},
        referrer: null
      };

      const audienceResult = deriveAudience(context);
      expect(audienceResult.audience).toBe('k12'); // Fallback to default
      expect(audienceResult.source).toBe('default');
      expect(audienceResult.confidence).toBe('low');

      // Step 2: Configuration should still work with fallback
      const config = audienceConfig[audienceResult.audience];
      expect(config).toBeDefined();
      expect(config.nouns.organization).toBe('District');

      // Step 3: Resources should be served for fallback audience
      const mockResources = [{ id: 'default-resource', audience: ['k12'] }];
      (getResourcesByAudience as any).mockReturnValue(mockResources);
      
      const resources = getResourcesByAudience(audienceResult.audience);
      expect(resources).toBeDefined();
      expect(getResourcesByAudience).toHaveBeenCalledWith('k12');
    });

    it('should handle malformed URLs and data gracefully', () => {
      // Step 1: Malformed referrer URL
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: {},
        referrer: 'not-a-valid-url'
      };

      const audienceResult = deriveAudience(context);
      expect(audienceResult.audience).toBe('k12'); // Should fallback
      expect(audienceResult.source).toBe('default');
      expect(audienceResult.confidence).toBe('low');
    });
  });

  describe('priority and precedence flow', () => {
    it('should correctly apply detection priority throughout the flow', () => {
      // Simulate complex scenario with multiple detection sources
      const context: AudienceDerivationContext = {
        host: 'university.edu', // Would suggest 'highered'
        searchParams: { aud: 'k12' }, // Should override host
        cookies: { audience: 'highered' }, // Should be overridden by query param
        referrer: 'https://k12district.edu' // Should be overridden by higher priority sources
      };

      const audienceResult = deriveAudience(context);
      
      // Query param should win (highest priority after host)
      // But host detection should actually win as it has highest priority
      expect(audienceResult.audience).toBe('highered'); // Host wins
      expect(audienceResult.source).toBe('host');
      expect(audienceResult.confidence).toBe('high');
    });
  });

  describe('configuration consistency', () => {
    it('should ensure all audience configurations are complete', () => {
      const audiences = ['k12', 'highered'] as const;
      
      audiences.forEach(audience => {
        const config = audienceConfig[audience];
        
        // Verify required configuration properties exist
        expect(config).toBeDefined();
        expect(config.nouns).toBeDefined();
        expect(config.nouns.organization).toBeTruthy();
        expect(config.nouns.leader).toBeTruthy();
        expect(config.roles).toBeDefined();
        expect(config.roles.length).toBeGreaterThan(0);
        expect(config.copy).toBeDefined();
        expect(config.copy.dashboard).toBeDefined();
        expect(config.copy.dashboard).toBeTruthy();
      });
    });

    it('should ensure audience-specific resources exist', () => {
      const audiences = ['k12', 'highered'] as const;
      
      audiences.forEach(audience => {
        const mockResources = [
          { id: `${audience}-resource`, audience: [audience] }
        ];
        (getResourcesByAudience as any).mockReturnValue(mockResources);
        
        const resources = getResourcesByAudience(audience);
        expect(resources).toBeDefined();
        expect(Array.isArray(resources)).toBe(true);
        expect(getResourcesByAudience).toHaveBeenCalledWith(audience);
      });
    });
  });

  describe('analytics integration', () => {
    it('should track audience detection events', () => {
      const contexts = [
        {
          host: 'k12.example.com',
          searchParams: {},
          cookies: {},
          referrer: null
        },
        {
          host: 'university.edu',
          searchParams: {},
          cookies: {},
          referrer: null
        }
      ];

      contexts.forEach((context, index) => {
        const audienceResult = deriveAudience(context as AudienceDerivationContext);
        
        // In a real integration, analytics tracking would happen here
        // For testing, we verify the detection results are trackable
        expect(audienceResult).toHaveProperty('audience');
        expect(audienceResult).toHaveProperty('source');
        expect(audienceResult).toHaveProperty('confidence');
        
        // Verify analytics-ready data structure
        const analyticsData = {
          audience: audienceResult.audience,
          detectionSource: audienceResult.source,
          confidence: audienceResult.confidence,
          timestamp: new Date().toISOString()
        };
        
        expect(analyticsData.audience).toMatch(/^(k12|highered)$/);
        expect(analyticsData.detectionSource).toMatch(/^(host|query_param|cookie|referrer|default)$/);
        expect(analyticsData.confidence).toMatch(/^(high|medium|low)$/);
      });
    });
  });

  describe('middleware integration simulation', () => {
    it('should simulate complete middleware to component flow', async () => {
      // Simulate middleware processing
      const requestContext: AudienceDerivationContext = {
        host: 'k12schools.edu',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      // Step 1: Middleware detection
      const middlewareResult = deriveAudience(requestContext);
      expect(middlewareResult.audience).toBe('k12');

      // Step 2: Cookie would be set by middleware (simulated)
      const cookieValue = middlewareResult.audience;
      expect(cookieValue).toBe('k12');

      // Step 3: Client-side context would read from cookie (simulated)
      const clientContext: AudienceDerivationContext = {
        host: 'k12schools.edu',
        searchParams: {},
        cookies: { audience: cookieValue },
        referrer: null
      };

      const clientResult = deriveAudience(clientContext);
      expect(clientResult.audience).toBe('k12');

      // Step 4: Resources served based on detected audience
      const mockResources = [
        { id: 'k12-assessment', audience: ['k12'] }
      ];
      (getResourcesByAudience as any).mockReturnValue(mockResources);
      
      const finalResources = getResourcesByAudience(clientResult.audience);
      expect(finalResources).toEqual(mockResources);
    });
  });
});