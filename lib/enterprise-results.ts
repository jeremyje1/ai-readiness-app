// Helper utilities for fetching enterprise algorithm results respecting RLS.
// These utilities build the query; Supabase RLS enforces access at execution.

export interface SupabaseQueryBuilder<T = any> {
	select(columns: string): this;
	eq(column: string, value: any): this;
	order(column: string, opts: { ascending: boolean }): this;
	limit(n: number): Promise<{ data: T[]; error: any }> | this;
}

export interface SupabaseClientLike {
	from(table: string): SupabaseQueryBuilder;
}

export async function fetchEnterpriseResultsForUser(client: SupabaseClientLike, userId: string, limit = 50) {
	if (!userId) throw new Error('userId required');
	return client
		.from('enterprise_algorithm_results')
		.select('*')
		.eq('user_id', userId)
		.order('computed_at', { ascending: false })
		.limit(limit);
}

export async function fetchAllEnterpriseResultsAdmin(client: SupabaseClientLike, limit = 100) {
	return client
		.from('enterprise_algorithm_results')
		.select('*')
		.order('computed_at', { ascending: false })
		.limit(limit);
}

