# Institution Context Selection Approach

## Current Problem
- Complex domain-aware redirects causing checkout issues
- Cross-domain redirect complexity 
- DNS management overhead
- User confusion with multiple domains

## Proposed Solution: Single Domain + Context Selection

### User Flow:
1. User visits `aiblueprint.k12aiblueprint.com`
2. **New: Institution Type Selection Page**
   - "Are you from K-12 or Higher Education?"
   - Clear visual distinction between options
   - Store choice in user profile/session
3. All subsequent pages contextualized based on selection
4. Simple checkout flow on single domain

### Benefits:
- ✅ Eliminates cross-domain redirect issues
- ✅ Simpler deployment (single domain)
- ✅ Better user control over experience
- ✅ Easier A/B testing and analytics
- ✅ Simplified checkout flow
- ✅ No complex domain detection logic

### Implementation Plan:
1. Create institution selection page/modal
2. Update user profile to store institution type
3. Contextualize all content based on stored preference
4. Remove domain-specific logic
5. Update marketing to direct to single domain

### Technical Changes:
- Remove domain detection utilities
- Add institution type to user profiles
- Create selection UI component
- Update all contextual text logic
- Simplify checkout to single domain

This approach is much cleaner and eliminates the root cause of the redirect issues!
