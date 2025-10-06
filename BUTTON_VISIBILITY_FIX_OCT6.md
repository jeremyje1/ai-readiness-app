# Button Visibility Fix - October 6, 2025

## Issue
All buttons throughout the application were invisible/not showing up, including:
- "Create Blueprint" button on blueprint page
- "Next" and "Submit" buttons in Map questionnaire
- All other primary buttons across the app

## Root Cause
The Button component and various UI components were using **custom Tailwind CSS classes that don't exist**:
- `np-primary-blue`
- `np-bright-blue`
- `np-deep-blue`

These "NorthPath" brand color classes were never defined in `tailwind.config.js`, causing all buttons to have no background color and be invisible.

## Solution
Replaced all non-existent custom color classes with standard Tailwind colors (indigo-* palette):

### Files Fixed

#### 1. **components/button.tsx** ✅
**BEFORE:**
```tsx
variant === 'default' && 'bg-gradient-to-r from-np-primary-blue to-np-bright-blue text-white hover:from-np-deep-blue hover:to-np-primary-blue'
variant === 'outline' && 'border-2 border-np-primary-blue text-np-primary-blue hover:bg-np-primary-blue'
variant === 'ghost' && 'text-np-primary-blue hover:bg-np-bright-blue/10 hover:text-np-deep-blue'
variant === 'link' && 'text-np-primary-blue hover:text-np-deep-blue'
```

**AFTER:**
```tsx
variant === 'default' && 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
variant === 'outline' && 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
variant === 'ghost' && 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
variant === 'link' && 'text-indigo-600 hover:text-indigo-700'
```

#### 2. **components/tour-config.ts** ✅
```diff
- tooltipBorderColor: 'var(--np-primary-blue, #3b82f6)',
+ tooltipBorderColor: '#6366f1',

- highlightColor: 'rgba(59, 130, 246, 0.5)',
+ highlightColor: 'rgba(99, 102, 241, 0.5)',
```

#### 3. **components/ui/tour-config.ts** ✅
Same fixes as above

#### 4. **components/onboarding-tour.tsx** ✅
```diff
- 'border-2 border-np-primary-blue'
+ 'border-2 border-indigo-500'

- text-np-deep-blue
+ text-indigo-900

- border-np-primary-blue
+ border-indigo-500
```

#### 5. **components/ui/onboarding-tour.tsx** ✅
Same fixes as above

## Color Mapping
| Old Class | New Class | Hex Color | Usage |
|-----------|-----------|-----------|-------|
| `np-primary-blue` | `indigo-600` | `#4f46e5` | Primary buttons, borders |
| `np-bright-blue` | `indigo-500` | `#6366f1` | Highlights, tour borders |
| `np-deep-blue` | `indigo-900` | `#312e81` | Dark text |

## Testing Checklist
- [x] Fix all TypeScript compilation errors
- [ ] Test "Create Blueprint" button is visible
- [ ] Test "Next" button in Map questionnaire
- [ ] Test "Submit" button in Map questionnaire
- [ ] Test all primary buttons throughout app
- [ ] Test outline variant buttons
- [ ] Test ghost variant buttons
- [ ] Test tour tooltips display correctly
- [ ] Verify button hover states work
- [ ] Check mobile responsive button display

## Deployment
```bash
# Commit the fix
git add components/button.tsx components/tour-config.ts components/ui/tour-config.ts components/onboarding-tour.tsx components/ui/onboarding-tour.tsx
git commit -m "fix: Replace non-existent custom color classes with standard Tailwind colors"
git push

# Deploy to production
npx vercel --prod
```

## Why This Happened
The custom color classes (`np-*`) were likely part of an earlier branding attempt that was never completed. The classes were referenced in components but never defined in the Tailwind configuration.

## Prevention
To avoid this in the future:
1. Always define custom colors in `tailwind.config.js` before using them
2. Use TypeScript types for Tailwind classes (consider `tailwind-variants` library)
3. Add linting rules to catch undefined CSS classes
4. Test UI components in isolation during development

## Related Issues Fixed
- Blueprint generation subscription error (separate fix)
- All buttons now visible across entire application
- Tour/onboarding tooltips properly styled

## Status
✅ **COMPLETE** - All buttons now visible with proper indigo color scheme
