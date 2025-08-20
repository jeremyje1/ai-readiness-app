import { describe, test, expect, vi, beforeEach } from 'vitest';
import { calculateEnterpriseMetrics, persistEnterpriseMetrics } from '../lib/algorithms';

// Flexible insert mock to control per-test behavior
const insertMock = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: () => ({
      insert: (record: any) => insertMock(record)
    })
  }
}));

beforeEach(() => {
  insertMock.mockReset();
});

describe('Algorithm Persistence', () => {
  test('persists metrics successfully with mocked supabaseAdmin', async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    const metrics = await calculateEnterpriseMetrics({ responses: [] }, {} as any);
    const res = await persistEnterpriseMetrics('test-assessment', metrics);
    expect(res).toMatchObject({ success: true, assessmentId: 'test-assessment' });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  test('returns error object on duplicate insert (unique index violation) with code', async () => {
    // First insert succeeds, second fails with simulated unique constraint violation
    insertMock
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'duplicate key value violates unique constraint "enterprise_algorithm_results_assessment_user_version_uidx"' } });

    const base = await calculateEnterpriseMetrics({ responses: [] }, {} as any);
    // Attach userId to exercise unique (assessment_id, user_id, algorithm_version)
    const withUser = { ...base, meta: { ...base.meta, userId: '11111111-1111-1111-1111-111111111111' } } as any;

    const first = await persistEnterpriseMetrics('dup-assessment', withUser);
    const second = await persistEnterpriseMetrics('dup-assessment', withUser);

    expect(first).toMatchObject({ success: true });
  expect(second).toMatchObject({ success: false, code: 'DUPLICATE_RESULT' });
  expect((second as any).error).toMatch(/duplicate key value/);
    expect(insertMock).toHaveBeenCalledTimes(2);
  });
});
