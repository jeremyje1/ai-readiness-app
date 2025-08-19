import { describe, test, expect, vi } from 'vitest';
import { calculateEnterpriseMetrics, persistEnterpriseMetrics } from '../lib/algorithms';

// Mock dynamic import of supabase to simulate available admin client
vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: () => ({ insert: () => Promise.resolve({ error: null }) })
  }
}));

describe('Algorithm Persistence', () => {
  test('persists metrics successfully with mocked supabaseAdmin', async () => {
    const metrics = await calculateEnterpriseMetrics({ responses: [] }, {} as any);
    const res = await persistEnterpriseMetrics('test-assessment', metrics);
    expect(res).toMatchObject({ success: true, assessmentId: 'test-assessment' });
  });
});
