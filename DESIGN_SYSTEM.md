# NorthPath Strategies Design System

A modern, cohesive design system for NorthPath Strategies assessment and survey applications.

## Brand Tokens

### Colors

- **Primary Blue**: `#1654A3` (nps-blue) - Main brand color for headers, CTAs, and primary elements
- **Dark Slate**: `#2A2E33` (nps-slate) - Text color for professional readability
- **Light Background**: `#F6F8FC` (nps-light) - Page background for clean, modern feel

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weight Range**: 300-900
- **Usage**: Professional, clean, highly readable across devices

### Layout Tokens

- **Border Radius**: `0.5rem` (nps-radius) - Consistent rounded corners
- **Shadow**: `0 4px 14px rgba(0,0,0,0.06)` (nps-shadow) - Subtle depth for cards

## Core Components

### PageContainer

```tsx
import { PageContainer } from "@/components/ui/page-container";

<PageContainer>{/* Your page content */}</PageContainer>;
```

- Max width: 6xl (1152px)
- Responsive padding: 6px mobile, 8px tablet, 12px desktop
- Vertical spacing: space-y-8 between sections

### PageHero

```tsx
import { PageHero } from "@/components/ui/page-hero";

<PageHero title="Page Title" subtitle="Supporting description" icon="🚀">
  <Button>Optional CTA</Button>
</PageHero>;
```

- Gradient background: slate-50 → blue-50/50 → indigo-50
- Centered layout with icon, title, subtitle, and optional children

### NpsCard

```tsx
import { NpsCard } from "@/components/ui/nps-card";

<NpsCard icon="📊" title="Card Title" description="Card description">
  {/* Optional additional content */}
</NpsCard>;
```

- White background with brand shadow
- Rounded corners (rounded-2xl)
- Centered content with icon, title, description

### NpsButton

```tsx
import { NpsButton } from "@/components/ui/nps-button";

<NpsButton variant="primary" size="lg">
  Button Text
</NpsButton>;
```

**Variants:**

- `primary`: nps-blue background, white text
- `secondary`: gray background, slate text
- `outline`: transparent background, blue border

**Sizes:**

- `sm`: px-4 py-2 text-sm
- `md`: px-6 py-3 text-base (default)
- `lg`: px-8 py-4 text-lg

## Layout Patterns

### Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Cards */}
</div>
```

### Responsive Breakpoints

- Mobile: Base styles
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

## Animation Guidelines

### Framer Motion Patterns

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: index * 0.1 }}
>
```

**Standard Animations:**

- Fade in: `opacity: 0 → 1`
- Slide up: `y: 20 → 0`
- Stagger delay: `index * 0.1`

## Accessibility Standards

### Color Contrast (WCAG AA)

- nps-blue on nps-light: ✅ 4.5:1+
- nps-slate on nps-light: ✅ 4.5:1+
- White on nps-blue: ✅ 4.5:1+

### Semantic HTML

- Proper heading hierarchy (h1→h2→h3)
- Alt text for all images
- Focus management for interactive elements

## Usage Examples

### Quick Wins Page

```tsx
<PageContainer>
  <PageHero title="Free Quick Wins" icon="🚀">
    <NpsButton size="lg">Start Assessment</NpsButton>
  </PageHero>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
    {features.map((feature, index) => (
      <NpsCard key={feature.title} {...feature} />
    ))}
  </div>
</PageContainer>
```

### Assessment Pages

```tsx
<PageContainer className="max-w-md">
  <PageHero title="Secure Access" icon="🔒" />

  <NpsCard className="p-8">
    <form>{/* Form content */}</form>
  </NpsCard>
</PageContainer>
```

## CSS Variables

The design system automatically injects these CSS variables:

```css
:root {
  --nps-blue: #1654a3;
  --nps-slate: #2a2e33;
  --nps-light: #f6f8fc;
  --nps-radius: 0.5rem;
  --nps-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}
```

## File Structure

```
components/ui/
├── page-container.tsx     # Layout wrapper
├── page-hero.tsx         # Hero section component
├── nps-card.tsx          # Content cards
├── nps-button.tsx        # Branded buttons
└── nps-components.tsx    # Export index
```

## Migration Guide

### From Legacy to NPS Design System

1. **Replace containers**:

   ```tsx
   // Before
   <div className="container mx-auto px-4 py-16">

   // After
   <PageContainer>
   ```

2. **Modernize headers**:

   ```tsx
   // Before
   <h1 className="text-4xl font-bold">Title</h1>

   // After
   <PageHero title="Title" subtitle="Description" />
   ```

3. **Update cards**:

   ```tsx
   // Before
   <Card className="p-8 text-center">

   // After
   <NpsCard icon="📊" title="Title" description="Text">
   ```

4. **Standardize buttons**:

   ```tsx
   // Before
   <Button className="bg-blue-600 text-white">

   // After
   <NpsButton variant="primary">
   ```

## Performance Considerations

- Inter font loaded with `display=swap` for optimal performance
- Components use CSS-in-JS pattern with Tailwind for minimal bundle size
- Motion components use `whileInView` with `once: true` to prevent re-animation
- Images use Next.js Image component with proper sizing and loading

## Brand Guidelines

### Do's ✅

- Use nps-blue for primary CTAs and navigation
- Maintain consistent spacing with PageContainer
- Apply nps-shadow to elevated elements
- Use Inter font for all text content

### Don'ts ❌

- Don't use custom colors outside the brand palette
- Don't override border-radius without using nps-radius
- Don't mix old Card components with new NpsCard
- Don't forget responsive classes for mobile-first design
