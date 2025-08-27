/**
 * Tests for audience derivation logic
 */

import { describe, it, expect } from 'vitest';
import { 
  deriveAudience, 
  isValidAudience, 
  type AudienceDerivationContext 
} from '@/lib/audience/deriveAudience';

describe('deriveAudience', () => {
  describe('host-based derivation', () => {
    it('should derive k12 from k12 hostname', () => {
      const context: AudienceDerivationContext = {
        host: 'k12.example.com',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('host');
      expect(result.confidence).toBe('high');
    });

    it('should derive highered from university hostname', () => {
      const context: AudienceDerivationContext = {
        host: 'university.edu',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('highered');
      expect(result.source).toBe('host');
      expect(result.confidence).toBe('high');
    });

    it('should derive highered from college hostname', () => {
      const context: AudienceDerivationContext = {
        host: 'college.edu',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('highered');
      expect(result.source).toBe('host');
      expect(result.confidence).toBe('high');
    });
  });

  describe('search parameter derivation', () => {
    it('should derive audience from aud parameter', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: { aud: 'k12' },
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('query_param');
      expect(result.confidence).toBe('high');
    });

    it('should derive audience from audience parameter', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: { audience: 'highered' },
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('highered');
      expect(result.source).toBe('query_param');
      expect(result.confidence).toBe('high');
    });

    it('should prioritize aud over audience parameter', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: { 
          aud: 'k12',
          audience: 'highered' 
        },
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('query_param');
    });
  });

  describe('cookie-based derivation', () => {
    it('should derive audience from cookie', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: { audience: 'k12' },
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('cookie');
      expect(result.confidence).toBe('medium');
    });
  });

  describe('referrer-based derivation', () => {
    it('should derive k12 from school district referrer', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: {},
        referrer: 'https://springfieldschools.k12.ca.us'
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('referrer');
      expect(result.confidence).toBe('medium');
    });

    it('should derive highered from university referrer', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: {},
        referrer: 'https://stanford.edu/department'
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('highered');
      expect(result.source).toBe('referrer');
      expect(result.confidence).toBe('medium');
    });
  });

  describe('priority order', () => {
    it('should prioritize search params over cookie', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: { aud: 'k12' },
        cookies: { audience: 'highered' },
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('query_param');
    });

    it('should prioritize host over search params', () => {
      const context: AudienceDerivationContext = {
        host: 'k12.example.com',
        searchParams: { aud: 'highered' },
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('host');
    });

    it('should prioritize cookie over referrer', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: { audience: 'k12' },
        referrer: 'https://stanford.edu'
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('cookie');
    });
  });

  describe('fallback behavior', () => {
    it('should default to k12 when no audience detected', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: {},
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('default');
      expect(result.confidence).toBe('low');
    });

    it('should ignore invalid audience values', () => {
      const context: AudienceDerivationContext = {
        host: 'example.com',
        searchParams: { aud: 'invalid' },
        cookies: {},
        referrer: null
      };

      const result = deriveAudience(context);
      
      expect(result.audience).toBe('k12');
      expect(result.source).toBe('default');
    });
  });
});

describe('isValidAudience', () => {
  it('should return true for valid audiences', () => {
    expect(isValidAudience('k12')).toBe(true);
    expect(isValidAudience('highered')).toBe(true);
  });

  it('should return false for invalid audiences', () => {
    expect(isValidAudience('invalid')).toBe(false);
    expect(isValidAudience('')).toBe(false);
    expect(isValidAudience(null as any)).toBe(false);
    expect(isValidAudience(undefined as any)).toBe(false);
  });
});

describe('edge cases', () => {
  it('should handle empty search params', () => {
    const context: AudienceDerivationContext = {
      host: 'example.com',
      searchParams: { aud: '' },
      cookies: {},
      referrer: null
    };

    const result = deriveAudience(context);
    
    expect(result.audience).toBe('k12');
    expect(result.source).toBe('default');
  });

  it('should handle malformed referrer URLs', () => {
    const context: AudienceDerivationContext = {
      host: 'example.com',
      searchParams: {},
      cookies: {},
      referrer: 'not-a-valid-url'
    };

    const result = deriveAudience(context);
    
    expect(result.audience).toBe('k12');
    expect(result.source).toBe('default');
  });

  it('should be case insensitive for host patterns', () => {
    const context: AudienceDerivationContext = {
      host: 'STANFORD.EDU',
      searchParams: {},
      cookies: {},
      referrer: null
    };

    const result = deriveAudience(context);
    
    expect(result.audience).toBe('highered');
    expect(result.source).toBe('host');
  });
});