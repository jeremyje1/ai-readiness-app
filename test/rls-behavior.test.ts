import { describe, test, expect, vi } from 'vitest';
import { fetchEnterpriseResultsForUser, fetchAllEnterpriseResultsAdmin } from '../lib/enterprise-results';

function createQueryChain() {
  const chain: any = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => Promise.resolve({ data: [], error: null }));
  return chain;
}

function createClient(store: any) {
  return {
    from: (table: string) => {
      store.table = table;
      const chain = createQueryChain();
      store.chain = chain;
      return chain;
    }
  };
}

describe('Enterprise Results RLS query helpers', () => {
  test('fetchEnterpriseResultsForUser applies user filter', async () => {
    const spy: any = {};
    const client = createClient(spy);
    await fetchEnterpriseResultsForUser(client as any, 'user-xyz', 10);
    expect(spy.table).toBe('enterprise_algorithm_results');
    expect(spy.chain.select).toHaveBeenCalledWith('*');
    expect(spy.chain.eq).toHaveBeenCalledWith('user_id', 'user-xyz');
    expect(spy.chain.limit).toHaveBeenCalledWith(10);
  });

  test('fetchAllEnterpriseResultsAdmin omits user filter', async () => {
    const spy: any = {};
    const client = createClient(spy);
    await fetchAllEnterpriseResultsAdmin(client as any, 5);
    expect(spy.table).toBe('enterprise_algorithm_results');
    expect(spy.chain.eq).not.toHaveBeenCalled();
    expect(spy.chain.limit).toHaveBeenCalledWith(5);
  });
});
