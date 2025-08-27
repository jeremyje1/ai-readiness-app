/**
 * Lightweight Session Manager
 * Centralizes client-side session retrieval / clearing to avoid race conditions.
 */
import { authService } from './auth-service'

export interface SessionState {
	session: any | null
	user: any | null
	fetchedAt: number
}

class SessionManager {
	private cache: SessionState | null = null
	private inflight: Promise<SessionState> | null = null

	async getSessionState(force = false): Promise<SessionState> {
		if (!force && this.cache && Date.now() - this.cache.fetchedAt < 3000) {
			return this.cache
		}
		if (this.inflight && !force) return this.inflight
		this.inflight = (async () => {
			const { data, error } = await authService.getSession()
			const state: SessionState = {
				session: data || null,
				user: data?.user || null,
				fetchedAt: Date.now()
			}
			if (!error) this.cache = state
			this.inflight = null
			return state
		})()
		return this.inflight
	}

	async clearSession() {
		await authService.signOut()
		this.cache = null
	}
}

export const sessionManager = new SessionManager()
export default sessionManager
