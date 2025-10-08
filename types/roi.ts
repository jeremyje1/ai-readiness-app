import type { RoiAssumptions, RoiResults } from '@/lib/roi/calculations';

export interface RoiScenario {
    id: string;
    organization: string;
    user_id: string;
    name: string;
    description: string | null;
    audience_label: string | null;
    assumptions: RoiAssumptions;
    results: RoiResults;
    is_favorite: boolean;
    last_used_at: string | null;
    created_at: string;
    updated_at: string;
}
