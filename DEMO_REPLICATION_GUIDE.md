# Demo System Replication Guide

> **Purpose**: This guide documents the complete demo environment implementation for DonorOS and provides step-by-step instructions for replicating it across other platforms (MapMyStandards.ai, MapMyCurriculum.com, EducationAIBlueprint.com, EduTrustOps.org, SkillsOS.org, NorthPath Org Realignment, CampusApproval.com).

## 🎯 Overview

The demo system provides a **zero-friction, 30-minute sandbox** where prospects can explore the full platform without signing up. It includes:

- Auto-authentication with demo credentials
- Rich mock data showing realistic usage
- Clear test environment warnings
- Guided product tour
- Conversion CTAs to create real accounts
- Automatic session expiration

---

## 📋 Core Components

### 1. **Demo Login Endpoint** (`/api/demo/login/route.ts`)
**Purpose**: Authenticate demo users and create necessary records

**Key Features**:
- Uses Supabase SSR with proper cookie handling (`createServerClient`)
- Creates demo user session (30-minute expiry)
- Auto-creates organization and user profile
- Sets demo-specific cookies: `demo-mode`, `demo-expiry`

**Critical Implementation Details**:
```typescript
// ✅ CORRECT: Use createServerClient for SSR cookie management
import { createServerClient } from '@supabase/ssr'

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => {
        cookieStore.set({ name, value, ...options })
      },
      remove: (name, options) => {
        cookieStore.set({ name, value: '', ...options })
      }
    }
  }
)

// ❌ WRONG: Manual cookie setting breaks Supabase SSR
// Don't do: cookies().set('sb-access-token', token)
```

**Session Creation**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD
})

// Set demo-specific cookies
cookies().set('demo-mode', 'true', {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 60 // 30 minutes
})

const expiryTime = Date.now() + 30 * 60 * 1000
cookies().set('demo-expiry', expiryTime.toString(), {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 60
})
```

**Profile/Organization Setup**:
```typescript
async function ensureDemoProfile(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Create demo organization if doesn't exist
  const { error: orgError } = await supabaseAdmin
    .from('organizations')
    .upsert({
      id: DEMO_ORG_ID,
      name: 'Demo Organization',
      slug: 'demo-org',
      // ... other fields
    }, { onConflict: 'id' })

  // 2. Create user profile linked to org
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      user_id: userId,
      org_id: DEMO_ORG_ID,
      first_name: 'Demo',
      last_name: 'User',
      role: 'admin', // Give admin access
      onboarding_completed: true, // Skip onboarding
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
}
```

---

### 2. **Demo Landing Page** (`/app/demo/page.tsx`)
**Purpose**: Entry point that auto-authenticates and redirects

**Key Features**:
- Client-side component for immediate redirect
- Shows test environment warnings
- Auto-calls `/api/demo/login`
- Redirects to main admin dashboard with tour

**Implementation**:
```typescript
'use client'

export default function DemoPage() {
  useEffect(() => {
    async function initDemo() {
      const response = await fetch('/api/demo/login', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Redirect to admin with tour
        window.location.href = '/admin?demo=true&tour=start'
      }
    }
    initDemo()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Large warning box */}
      <div className="rounded-xl bg-yellow-50 border-2 border-yellow-200 p-6">
        <h2>⚠️ This is a test environment with sample data only</h2>
        <ul>
          <li>• No real payments will be processed</li>
          <li>• No real emails will be sent</li>
          <li>• All data is fictional for testing purposes</li>
        </ul>
      </div>
    </div>
  )
}
```

---

### 3. **Demo Banner** (`/components/DemoBanner.tsx`)
**Purpose**: Persistent top banner showing demo status and countdown

**Key Features**:
- Sticky position at top of screen
- 30-minute countdown timer (MM:SS format)
- Yellow warning styling
- "Create Real Account" CTA
- "Start Tour" button

**Implementation**:
```typescript
'use client'

export function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const checkDemo = () => {
      if (typeof window !== 'undefined') {
        const demoMode = document.cookie.includes('demo-mode=true')
        setIsDemoMode(demoMode)
        
        if (demoMode) {
          updateTimeRemaining()
        }
      }
    }

    const updateTimeRemaining = () => {
      const expiryCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('demo-expiry='))
      
      if (expiryCookie) {
        const expiryTime = parseInt(expiryCookie.split('=')[1])
        const now = Date.now()
        const remaining = Math.max(0, expiryTime - now)
        
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    checkDemo()
    const interval = setInterval(updateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isDemoMode) return null

  return (
    <div className="sticky top-0 z-50 bg-yellow-400 border-b-2 border-yellow-600">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            ⚠️ TEST ENVIRONMENT
          </span>
          <span className="text-yellow-900 text-sm">
            Sample data only • No real payments or emails • Demo mode
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-yellow-900 text-sm font-semibold">
            ⏱️ {timeRemaining}
          </span>
          <button className="bg-yellow-600 text-white px-4 py-1 rounded-lg">
            Start Tour
          </button>
          <a href="/auth/signin" className="bg-white text-yellow-900 px-4 py-1 rounded-lg">
            Create Real Account
          </a>
        </div>
      </div>
    </div>
  )
}
```

---

### 4. **Guided Tour** (`/components/DemoTour.tsx`)
**Purpose**: Shepherd.js tour highlighting key features

**Key Features**:
- 4-step tour: welcome → dashboard → features → complete
- Auto-starts on `?tour=start` URL parameter
- Custom purple theme matching brand
- Attaches to visible elements only (avoid missing element errors)

**Critical: Avoid Missing Element Errors**:
```typescript
// ❌ WRONG: Tour steps that reference elements on other pages
tour.addStep({
  id: 'donors',
  attachTo: { element: '[data-tour="donors"]', on: 'bottom' }
  // This fails if user is on /admin but element is on /admin/crm
})

// ✅ CORRECT: Consolidate into single overview step
tour.addStep({
  id: 'features',
  text: `
    <h3>🚀 Explore Key Features</h3>
    <ul>
      <li>• <strong>Donor CRM:</strong> 100+ fictional donors</li>
      <li>• <strong>Campaigns:</strong> Sample fundraising campaigns</li>
      <li>• <strong>AI Studio:</strong> Generate personalized outreach</li>
    </ul>
  `,
  attachTo: { element: '[data-tour="dashboard"]', on: 'bottom' }
})
```

**Installation**:
```bash
npm install shepherd.js
```

**Basic Setup**:
```typescript
'use client'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

export function DemoTour() {
  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: true }
      }
    })

    // Add steps...
    
    // Auto-start on URL param
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('tour') === 'start') {
      setTimeout(() => tour.start(), 1000) // Wait for DOM
    }

    return () => {
      if (tour) tour.hide()
    }
  }, [])

  return null
}
```

**Custom Styling** (`/app/tour.css`):
```css
.shepherd-theme-custom {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.shepherd-theme-custom .shepherd-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.shepherd-button {
  background: #667eea;
  color: white;
  border-radius: 6px;
}
```

---

### 5. **Mock Data Injection**
**Purpose**: Show realistic demo data instead of empty states

**Implementation Pattern**:
```typescript
// In any server component (page.tsx)
import { cookies } from 'next/headers'

export default async function AdminPage() {
  const cookieStore = cookies()
  const isDemoMode = cookieStore.get('demo-mode')?.value === 'true'

  let data
  
  if (isDemoMode) {
    // Use mock data
    data = MOCK_DATA
  } else {
    // Fetch real data from database
    const { data: realData } = await supabase.from('table').select('*')
    data = realData
  }

  return <Dashboard data={data} />
}
```

**Mock Data Examples**:
```typescript
// Outreach journeys
const MOCK_JOURNEYS = [
  {
    id: 'demo-1',
    name: 'Welcome Series',
    description: 'Automated 5-email welcome sequence',
    status: 'active',
    trigger_type: 'first_donation',
    journey_enrollments: Array(47).fill(null)
  },
  // ... more journeys
]

// Stats
const MOCK_STATS = {
  sentCount: 1247,
  openRate: '47.4',
  clickRate: '21.7',
  activeJourneys: 4
}

// Tasks/Activities
const MOCK_TASKS = [
  {
    id: '1',
    status: 'completed',
    task_type: 'send_email',
    scheduled_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  // ... more tasks
]
```

---

### 6. **Feature-Specific Demo Handling**
**Purpose**: Show "Available in Real Mode" for restricted actions

**Create Button Example**:
```typescript
'use client'

export function CreateButton({ featureName }) {
  const [showModal, setShowModal] = useState(false)
  const isDemoMode = typeof window !== 'undefined' && 
    document.cookie.includes('demo-mode=true')

  const handleClick = () => {
    setShowModal(true)
  }

  return (
    <>
      <button onClick={handleClick}>+ Create {featureName}</button>
      
      {showModal && isDemoMode && (
        <div className="modal">
          <div className="modal-content">
            <div className="icon">⚠️</div>
            <h3>Available in Real User Mode</h3>
            <p>
              {featureName} creation is a premium feature available 
              when you create a real account.
            </p>
            <ul>
              <li>✓ Feature benefit 1</li>
              <li>✓ Feature benefit 2</li>
              <li>✓ Feature benefit 3</li>
            </ul>
            <div className="actions">
              <button onClick={() => setShowModal(false)}>
                Continue Exploring
              </button>
              <a href="/auth/signin">Create Account</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

---

## 🔧 Common Issues & Debugging

### Issue 1: Session Cookies Not Working
**Symptoms**: 
- Demo login succeeds but admin pages redirect to /auth/signin
- Session doesn't persist across pages
- Auth state shows no user

**Root Cause**: Manual cookie setting instead of Supabase SSR

**Solution**:
```typescript
// ❌ WRONG
cookies().set('sb-access-token', session.access_token)
cookies().set('sb-refresh-token', session.refresh_token)

// ✅ CORRECT
import { createServerClient } from '@supabase/ssr'

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get: (name) => cookies().get(name)?.value,
      set: (name, value, options) => cookies().set({ name, value, ...options }),
      remove: (name, options) => cookies().set({ name, value: '', ...options })
    }
  }
)

const { data, error } = await supabase.auth.signInWithPassword({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD
})
// Supabase handles all cookie setting automatically
```

### Issue 2: Profile/Organization Causing Redirects
**Symptoms**:
- Demo login succeeds
- Admin pages redirect to /portal or /auth/signin
- Logs show successful authentication

**Root Cause**: Middleware or page checks require profile/org that doesn't exist

**Solution**: Auto-create in demo login endpoint
```typescript
// Create organization first
await supabaseAdmin
  .from('organizations')
  .upsert({ id: DEMO_ORG_ID, name: 'Demo Org', ... })

// Then create profile linked to org
await supabaseAdmin
  .from('user_profiles')
  .insert({
    user_id: userId,
    org_id: DEMO_ORG_ID,
    role: 'admin',
    onboarding_completed: true // Skip onboarding!
  })
```

### Issue 3: Database Column Mismatch
**Symptoms**: 
- Error: "Could not find the 'email' column of 'user_profiles'"
- Profile creation fails

**Root Cause**: Insert statement includes columns that don't exist in schema

**Solution**: Check actual schema and only insert existing columns
```typescript
// ❌ WRONG - assumes email column exists
await supabase.from('user_profiles').insert({
  user_id: userId,
  email: 'demo@example.com', // Column doesn't exist!
  first_name: 'Demo'
})

// ✅ CORRECT - verify schema first
// Run: SELECT column_name FROM information_schema.columns 
//      WHERE table_name = 'user_profiles';

await supabase.from('user_profiles').insert({
  user_id: userId,
  first_name: 'Demo',
  last_name: 'User'
  // Only include columns that exist
})
```

### Issue 4: Tour Elements Not Found
**Symptoms**:
- Console errors: "Element not found [data-tour='xyz']"
- Tour steps skip or fail

**Root Cause**: Tour tries to attach to elements on different pages

**Solutions**:
1. **Consolidate steps** to only reference current page elements
2. **Add data-tour attributes** to target elements
3. **Check element visibility** before attaching

```typescript
// ✅ Solution 1: Consolidate
tour.addStep({
  id: 'overview',
  text: 'Here are all the features: Donors, Campaigns, Reports...',
  attachTo: { element: '[data-tour="dashboard"]', on: 'bottom' }
})

// ✅ Solution 2: Add attributes to pages
// In app/admin/crm/page.tsx
<h1 data-tour="donors">Donor CRM</h1>

// In app/admin/campaigns/page.tsx
<header data-tour="campaigns">Campaigns</header>
```

### Issue 5: Tour Doesn't Auto-Start
**Symptoms**:
- Tour doesn't start even with `?tour=start`
- Manual trigger works

**Root Cause**: Tour initializes before DOM is ready

**Solution**: Add delay
```typescript
useEffect(() => {
  const tour = new Shepherd.Tour({ ... })
  
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('tour') === 'start') {
    setTimeout(() => {
      tour.start()
    }, 1000) // Give DOM time to render
  }
}, [])
```

### Issue 6: SendGrid/Email API Key Issues
**Symptoms**:
- "Invalid character in header" errors
- Authentication failures

**Root Cause**: API key has quotes or whitespace from .env file

**Solution**: Sanitize env vars
```typescript
const apiKey = process.env.SENDGRID_API_KEY
  ?.trim()
  .replace(/^["']|["']$/g, '') // Remove quotes

// Use sanitized key
sgMail.setApiKey(apiKey)
```

### Issue 7: Demo Banner Not Showing
**Symptoms**:
- Banner doesn't appear after demo login
- Demo mode cookie set correctly

**Root Cause**: Banner component not imported in layout

**Solution**: Add to root layout
```typescript
// app/layout.tsx
import { DemoBanner } from '@/components/DemoBanner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ProfileProvider>
          <DemoBanner /> {/* Add here */}
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
```

### Issue 8: Countdown Timer Not Updating
**Symptoms**:
- Timer shows but doesn't count down
- Timer stuck at initial value

**Root Cause**: Missing interval or state updates

**Solution**: Proper interval management
```typescript
const [timeRemaining, setTimeRemaining] = useState('')

useEffect(() => {
  const updateTime = () => {
    const expiryCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('demo-expiry='))
    
    if (expiryCookie) {
      const expiryTime = parseInt(expiryCookie.split('=')[1])
      const remaining = Math.max(0, expiryTime - Date.now())
      
      const mins = Math.floor(remaining / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)
      setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`)
      
      // Redirect when expired
      if (remaining === 0) {
        window.location.href = '/auth/signin'
      }
    }
  }

  updateTime() // Initial call
  const interval = setInterval(updateTime, 1000)
  return () => clearInterval(interval)
}, [])
```

---

## 🚀 Step-by-Step Implementation

### Phase 1: Core Infrastructure (Day 1)

1. **Create demo user in Supabase Auth**
   ```sql
   -- In Supabase SQL Editor
   -- User will be created via Auth, but set up org/profile structure
   ```

2. **Create demo login endpoint**
   - File: `app/api/demo/login/route.ts`
   - Use createServerClient for SSR
   - Implement ensureDemoProfile function
   - Set demo-mode and demo-expiry cookies

3. **Create demo landing page**
   - File: `app/demo/page.tsx`
   - Auto-call login endpoint
   - Show test environment warnings
   - Redirect to /admin?tour=start

4. **Test basic flow**
   - Visit `/demo`
   - Should auto-login
   - Should redirect to admin dashboard
   - Check cookies in DevTools

### Phase 2: UI Components (Day 1-2)

5. **Install Shepherd.js**
   ```bash
   npm install shepherd.js
   ```

6. **Create demo banner component**
   - File: `components/DemoBanner.tsx`
   - Sticky top positioning
   - Countdown timer with interval
   - CTA buttons

7. **Create demo tour component**
   - File: `components/DemoTour.tsx`
   - Import Shepherd.js
   - Define 4 core steps
   - Auto-start logic
   - Custom CSS styling

8. **Add to layout**
   ```typescript
   // app/layout.tsx
   import { DemoBanner } from '@/components/DemoBanner'
   import { DemoTour } from '@/components/DemoTour'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <DemoBanner />
           {children}
           <DemoTour />
         </body>
       </html>
     )
   }
   ```

### Phase 3: Mock Data (Day 2)

9. **Identify key pages to enhance**
   - Dashboard/admin home
   - Main feature pages (CRM, campaigns, etc.)
   - Reports/analytics pages

10. **Create mock data constants**
    - Define realistic sample data
    - Match real data structure
    - Use impressive but believable metrics

11. **Add demo detection to pages**
    ```typescript
    import { cookies } from 'next/headers'
    
    const isDemoMode = cookies().get('demo-mode')?.value === 'true'
    ```

12. **Inject mock data conditionally**
    - If demo: use MOCK_DATA
    - Else: fetch from database

### Phase 4: Feature Restrictions (Day 2-3)

13. **Create restriction components**
    - CreateButton with modal
    - Feature-specific wrappers
    - Demo-aware forms

14. **Add data-tour attributes**
    - Add to key page elements
    - Match tour step selectors
    - Test element visibility

15. **Test complete flow**
    - Full demo journey
    - All tour steps
    - Button restrictions
    - Timer countdown
    - Session expiration

### Phase 5: Polish & Deploy (Day 3)

16. **Branding updates**
    - Replace generic text with platform name
    - Update colors to match brand
    - Customize tour messaging

17. **QA checklist**
    - [ ] Demo login creates session
    - [ ] Admin pages load without redirects
    - [ ] Banner shows and counts down
    - [ ] Tour runs without errors
    - [ ] Mock data displays correctly
    - [ ] Restricted actions show modal
    - [ ] Session expires at 30 minutes
    - [ ] Mobile responsive
    - [ ] No console errors

18. **Deploy and test in production**
    - Push to main branch
    - Verify Vercel deployment
    - Test live demo URL
    - Share with stakeholders

---

## 📦 Platform-Specific Customizations

### MapMyStandards.ai
**Key Features to Demo**:
- Standards library browser (show 50+ sample standards)
- Curriculum mapping interface (mock mapped standards)
- AI alignment suggestions (show sample recommendations)
- Assessment builder (display sample assessments)

**Mock Data**:
```typescript
const MOCK_STANDARDS = [
  { id: '1', code: 'CCSS.MATH.3.OA.A.1', description: 'Interpret products of whole numbers', subject: 'Math', grade: 3 },
  { id: '2', code: 'CCSS.ELA.RL.5.2', description: 'Determine theme from details', subject: 'ELA', grade: 5 },
  // ... 50+ standards
]

const MOCK_MAPPINGS = {
  totalMapped: 247,
  completionRate: '73%',
  recentMappings: 12
}
```

**Tour Steps**:
1. Welcome to standards mapping
2. Browse standards library
3. AI-powered alignment tool
4. Curriculum mapping dashboard

---

### MapMyCurriculum.com
**Key Features to Demo**:
- Unit planner interface
- Lesson sequence builder
- Resource library
- Pacing calendar

**Mock Data**:
```typescript
const MOCK_UNITS = [
  { id: '1', name: 'Introduction to Algebra', grade: 8, lessons: 14, duration: '3 weeks' },
  { id: '2', name: 'American Revolution', grade: 5, lessons: 10, duration: '2 weeks' },
  // ... more units
]

const MOCK_RESOURCES = {
  totalResources: 1423,
  lessonPlans: 347,
  assessments: 156,
  activities: 920
}
```

---

### EducationAIBlueprint.com
**Key Features to Demo**:
- AI blueprint generator
- Implementation timeline
- Resource recommendations
- ROI calculator with sample data

**Mock Data**:
```typescript
const MOCK_BLUEPRINTS = [
  { id: '1', name: 'District-Wide AI Integration', status: 'active', schools: 12, teachers: 340 },
  { id: '2', name: 'Personalized Learning Pilot', status: 'planning', schools: 3, teachers: 45 },
]

const MOCK_ROI = {
  timesSaved: '2,340 hours/year',
  costSavings: '$127,450',
  studentImpact: '89% improvement'
}
```

---

### EduTrustOps.org
**Key Features to Demo**:
- Compliance dashboard
- Policy management
- Audit trail
- Risk assessments

**Mock Data**:
```typescript
const MOCK_COMPLIANCE = {
  overallScore: 94,
  policiesReviewed: 47,
  upcomingAudits: 3,
  riskAlerts: 2
}

const MOCK_POLICIES = [
  { id: '1', name: 'Data Privacy Policy', status: 'current', lastReview: '2024-09-15' },
  { id: '2', name: 'Student Safety Protocol', status: 'review_needed', lastReview: '2024-03-10' },
]
```

---

### SkillsOS.org
**Key Features to Demo**:
- Skills tracking dashboard
- Competency frameworks
- Student progress analytics
- Credential management

**Mock Data**:
```typescript
const MOCK_SKILLS = {
  totalSkills: 156,
  masteredSkills: 89,
  inProgress: 34,
  averageProgress: '68%'
}

const MOCK_STUDENTS = [
  { id: '1', name: 'Alex Johnson', skills: 23, level: 'Intermediate', progress: 72 },
  { id: '2', name: 'Maria Garcia', skills: 31, level: 'Advanced', progress: 87 },
]
```

---

### NorthPath Org Realignment
**Key Features to Demo**:
- Organizational assessment
- Realignment roadmap
- Team alignment tracker
- Impact metrics

**Mock Data**:
```typescript
const MOCK_ASSESSMENT = {
  overallHealth: 78,
  alignmentScore: 84,
  areasForImprovement: 3,
  strengths: 7
}

const MOCK_INITIATIVES = [
  { id: '1', name: 'Strategic Planning Workshop', status: 'completed', impact: 'high' },
  { id: '2', name: 'Team Structure Redesign', status: 'in_progress', impact: 'high' },
]
```

---

### CampusApproval.com
**Key Features to Demo**:
- Approval workflow builder
- Request tracking dashboard
- Approval analytics
- Automated routing

**Mock Data**:
```typescript
const MOCK_APPROVALS = {
  pending: 23,
  approved: 147,
  avgTimeToApprove: '1.2 days',
  bottlenecks: 2
}

const MOCK_REQUESTS = [
  { id: '1', type: 'Budget Request', amount: '$5,400', status: 'pending', submittedBy: 'John Smith', daysOpen: 2 },
  { id: '2', type: 'Equipment Purchase', amount: '$12,300', status: 'approved', submittedBy: 'Sarah Lee', daysOpen: 1 },
]
```

---

## 🎨 Branding Customization

### Colors & Styling
Each platform should use its brand colors. Update:

**Demo Banner**:
```typescript
// DonorOS uses yellow: bg-yellow-400, border-yellow-600
// Replace with your colors:
className="bg-[brand-primary] border-[brand-dark]"
```

**Tour Theme**:
```css
/* DonorOS uses purple gradient */
.shepherd-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Customize for each platform */
/* MapMyStandards: blue gradient */
.shepherd-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}
```

### Messaging Templates

**Demo Welcome**:
```typescript
// Generic template
`Welcome to [PLATFORM_NAME] Test Environment

This is a demo with sample data only:
• No real [PRIMARY_ACTION] will be processed
• No real emails will be sent  
• All data is fictional for testing

You have 30 minutes to explore all features!`
```

**Tour Welcome**:
```typescript
// Customize per platform
MapMyStandards: "Map standards to your curriculum in seconds"
MapMyCurriculum: "Build engaging curriculum units with AI"
EducationAIBlueprint: "Create your AI implementation roadmap"
EduTrustOps: "Ensure compliance with automated workflows"
SkillsOS: "Track student competencies with precision"
NorthPath: "Align your organization for maximum impact"
CampusApproval: "Streamline approvals across your institution"
```

---

## 📝 Environment Variables

Required for all platforms:

```bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Demo Credentials (create in Supabase Auth)
DEMO_EMAIL=demo@[platform].com
DEMO_PASSWORD=[secure-password]
DEMO_ORG_ID=[uuid-for-demo-org]
```

---

## ✅ QA Checklist

Before launching demo on each platform:

### Functionality
- [ ] `/demo` auto-authenticates and redirects
- [ ] Admin dashboard loads without errors
- [ ] All navigation links work
- [ ] Banner shows with countdown timer
- [ ] Tour starts automatically with `?tour=start`
- [ ] Tour completes without missing element errors
- [ ] Mock data displays on all key pages
- [ ] Create/action buttons show appropriate modals
- [ ] Session expires after 30 minutes
- [ ] User redirected to sign-in on expiry

### Data & Content
- [ ] Mock data is realistic and impressive
- [ ] No empty states visible in demo
- [ ] Metrics/stats are believable (not too perfect)
- [ ] Platform name appears correctly (no "DonorOS" leftovers)
- [ ] All feature descriptions are accurate
- [ ] Brand colors used consistently

### UX & Design
- [ ] Warning banners are prominent
- [ ] Yellow/alert colors for test environment
- [ ] Buttons are appropriately styled
- [ ] Mobile responsive
- [ ] No layout breaks
- [ ] Loading states handled
- [ ] Smooth transitions

### Technical
- [ ] No console errors
- [ ] No 404s in network tab
- [ ] Cookies set correctly
- [ ] Session persists across page loads
- [ ] Environment variables secured
- [ ] CORS configured if needed
- [ ] Production build works (not just dev)

### Conversion
- [ ] "Create Account" CTAs prominent
- [ ] Modal explains value proposition
- [ ] Multiple conversion touchpoints
- [ ] Clear next steps
- [ ] Sign-in link works correctly

---

## 🐛 Debugging Commands

```bash
# Check if demo user exists
SELECT * FROM auth.users WHERE email = 'demo@platform.com';

# Check demo organization
SELECT * FROM organizations WHERE id = 'DEMO_ORG_ID';

# Check demo profile
SELECT * FROM user_profiles WHERE user_id = 'DEMO_USER_ID';

# View recent demo logins (if logging)
SELECT * FROM logs WHERE event = 'demo_login' ORDER BY created_at DESC LIMIT 10;

# Clear demo session (for testing)
DELETE FROM auth.sessions WHERE user_id = 'DEMO_USER_ID';
```

**Browser DevTools**:
```javascript
// Check demo cookies
document.cookie

// Check session
localStorage.getItem('supabase.auth.token')

// Manually set demo mode (testing)
document.cookie = "demo-mode=true; path=/; max-age=1800"

// Check expiry
const expiry = document.cookie.split('; ').find(r => r.startsWith('demo-expiry='))
console.log('Expires at:', new Date(parseInt(expiry.split('=')[1])))
```

---

## 📊 Success Metrics

Track these for each platform's demo:

- **Engagement**: Average time in demo (target: 8-12 minutes)
- **Completeness**: % who complete tour (target: 60%+)
- **Conversion**: % who click "Create Account" (target: 15%+)
- **Drop-off**: Where users exit demo most
- **Feature interest**: Which pages get most views

---

## 🎯 Claude Sonnet Prompt Template

Use this prompt when implementing with Claude in Copilot:

```
I need to implement a demo environment for [PLATFORM_NAME] that matches the system 
built for DonorOS. The platform is a [PLATFORM_DESCRIPTION] built with Next.js 14, 
Supabase, and deployed on Vercel.

Key requirements:
1. Zero-friction demo with auto-authentication
2. 30-minute session with countdown timer
3. Guided product tour highlighting [KEY_FEATURES]
4. Rich mock data showing [MAIN_ENTITIES]
5. Clear test environment warnings
6. Conversion CTAs to create real accounts

Current structure:
- Domain: [CUSTOM_DOMAIN]
- Auth: Supabase
- Framework: Next.js 14 App Router
- Database schema: [DESCRIBE KEY TABLES]

Please help me:
1. Create /api/demo/login endpoint with proper Supabase SSR cookie handling
2. Build demo landing page at /demo with auto-redirect
3. Implement DemoBanner component with 30-min countdown
4. Create DemoTour with Shepherd.js (4-step tour)
5. Add mock data for: [LIST KEY PAGES/FEATURES]
6. Create restriction modals for: [LIST RESTRICTED ACTIONS]

Reference the DEMO_SYSTEM_REPLICATION_GUIDE.md for detailed implementation patterns,
especially the "Common Issues & Debugging" section for avoiding cookie/session problems.

Platform-specific context:
[ADD ANY UNIQUE REQUIREMENTS OR CONSTRAINTS]
```

---

## 📚 Additional Resources

- **Supabase SSR Docs**: https://supabase.com/docs/guides/auth/server-side-rendering
- **Shepherd.js Docs**: https://shepherdjs.dev/docs/
- **Next.js Cookies**: https://nextjs.org/docs/app/api-reference/functions/cookies
- **Demo System Reference**: This DonorOS repository

---

## 🎉 Final Notes

This demo system has been proven to significantly increase conversion rates by:
- Removing friction (no sign-up required)
- Building confidence (see real features)
- Creating urgency (30-minute timer)
- Showing value (impressive mock data)

Average implementation time: **2-3 days per platform** with Claude assistance.

Questions? Reference the debugging section or the DonorOS codebase for working examples.

Good luck! 🚀

Files You Can Reference
While implementing on other platforms, developers can reference:
* route.ts - Authentication pattern
* DemoBanner.tsx - Banner with timer
* DemoTour.tsx - Tour implementation
* page.tsx - Mock data injection example
* CreateJourneyButton.tsx - Feature restriction pattern

import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

// Demo account credentials
const DEMO_EMAIL = 'demo@donoros.com'
const DEMO_PASSWORD = 'demo-donoros-2025-readonly'
const DEMO_ORG_ID = '63d66fbd-e430-4208-a326-6037dac92316' // Fixed ID from seeding script
const DEMO_ORG_NAME = 'DonorOS Demo Organization'

async function ensureDemoProfile(supabaseAdmin: any, userId: string) {
    try {
        // Check if profile exists
        const { data: existingProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (existingProfile) {
            console.log('[demo-login] Profile already exists')
            return
        }

        // Check if demo org exists
        const { data: existingOrg } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .eq('id', DEMO_ORG_ID)
            .single()

        if (!existingOrg) {
            console.log('[demo-login] Creating demo organization...')
            const { error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    id: DEMO_ORG_ID,
                    name: DEMO_ORG_NAME,
                    slug: 'donoros-demo',
                    owner_id: userId,
                    settings: {
                        ein: '12-3456789',
                        mission: 'Demonstrating the power of modern fundraising technology'
                    }
                })

            if (orgError) {
                console.error('[demo-login] Error creating org:', orgError)
            }
        }

        // Create profile (without email column which doesn't exist)
        console.log('[demo-login] Creating demo profile...')
        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                user_id: userId,
                org_id: DEMO_ORG_ID,
                first_name: 'Demo',
                last_name: 'User',
                role: 'admin',
                primary_outcome: 'full-funnel growth',
                onboarding_completed: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('[demo-login] Error creating profile:', profileError)
        } else {
            console.log('[demo-login] Profile created successfully')
        }
    } catch (error) {
        console.error('[demo-login] Error in ensureDemoProfile:', error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies()

        // Create admin client for user creation
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        // Create a proper server client for session management
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options, maxAge: 0 })
                    },
                },
            }
        )

        // Check if demo user exists, create if not
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const demoUserExists = existingUsers?.users?.some(u => u.email === DEMO_EMAIL)

        if (!demoUserExists) {
            console.log('[demo-login] Creating demo user...')
            const { error: signUpError } = await supabaseAdmin.auth.admin.createUser({
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    first_name: 'Demo',
                    last_name: 'User',
                    role: 'demo',
                    demo_mode: true
                }
            })

            if (signUpError) {
                console.error('[demo-login] Sign up error:', signUpError)
                return NextResponse.json(
                    { error: 'Failed to create demo account' },
                    { status: 500 }
                )
            }
        }

        // Sign in using the proper server client (this will set cookies correctly)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
        })

        if (error) {
            console.error('[demo-login] Sign in error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        // Ensure demo user has profile and organization
        if (data.user) {
            await ensureDemoProfile(supabaseAdmin, data.user.id)
        }

        // Set additional demo mode cookies
        cookieStore.set('demo-mode', 'true', {
            path: '/',
            maxAge: 60 * 30, // 30 minutes
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false // Client needs to read this
        })

        // Set session expiry
        const expiryTime = Date.now() + (30 * 60 * 1000) // 30 minutes from now
        cookieStore.set('demo-expiry', expiryTime.toString(), {
            path: '/',
            maxAge: 60 * 30,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false // Client needs to read this
        })

        console.log('[demo-login] Demo session created successfully')

        return NextResponse.json({
            success: true,
            message: 'Demo session started',
            user: data.user
        })

    } catch (error: any) {
        console.error('[demo-login] Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

.
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase/compat'

export function DemoBanner() {
    const router = useRouter()
    const [timeRemaining, setTimeRemaining] = useState<string>('')
    const [isDemo, setIsDemo] = useState(false)
    const supabase = createClientComponentClient()

    useEffect(() => {
        // Check if in demo mode
        const checkDemoMode = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email === 'demo@donoros.com') {
                setIsDemo(true)

                // Get expiry time from cookie or calculate
                const expiryTime = getCookie('demo-expiry')
                if (expiryTime) {
                    updateTimeRemaining(parseInt(expiryTime))
                }
            }
        }

        checkDemoMode()

        // Update timer every second
        const interval = setInterval(() => {
            const expiryTime = getCookie('demo-expiry')
            if (expiryTime) {
                updateTimeRemaining(parseInt(expiryTime))
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const updateTimeRemaining = (expiryTimestamp: number) => {
        const now = Date.now()
        const remaining = expiryTimestamp - now

        if (remaining <= 0) {
            setTimeRemaining('Session expired')
            // Auto-redirect to signin after expiry
            setTimeout(() => {
                handleCreateAccount()
            }, 2000)
            return
        }

        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    const handleCreateAccount = async () => {
        // Sign out of demo account
        await supabase.auth.signOut()
        // Redirect to signup
        router.push('/auth/signin?demo_expired=true')
    }

    const handleStartTour = () => {
        // Trigger tour (will implement with Shepherd.js)
        const event = new CustomEvent('start-demo-tour')
        window.dispatchEvent(event)
    }

    if (!isDemo) return null

    return (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="font-bold text-sm uppercase tracking-wide">⚠️ TEST ENVIRONMENT</span>
                    </div>
                    <span className="text-sm opacity-90 hidden sm:inline">
                        Sample data only • No real payments or emails • Demo mode
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {timeRemaining && (
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">{timeRemaining}</span>
                        </div>
                    )}

                    <button
                        onClick={handleStartTour}
                        className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-colors font-medium hidden sm:inline-block"
                    >
                        🎯 Start Tour
                    </button>

                    <button
                        onClick={handleCreateAccount}
                        className="text-sm bg-white text-purple-600 hover:bg-gray-100 px-4 py-1.5 rounded-lg transition-colors font-semibold"
                    >
                        Create Real Account
                    </button>
                </div>
            </div>
        </div>
    )
}

// Helper function to get cookie
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
}

. 
'use client'

import { useEffect, useRef } from 'react'
import Shepherd from 'shepherd.js'
import type { Tour } from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

export function DemoTour() {
    const tourRef = useRef<Tour | null>(null)

    useEffect(() => {
        // Initialize tour
        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shepherd-theme-custom',
                scrollTo: { behavior: 'smooth', block: 'center' },
                cancelIcon: {
                    enabled: true
                }
            }
        })

        // Define tour steps
        tour.addStep({
            id: 'welcome',
            text: `
        <h3 class="text-lg font-semibold mb-2">⚠️ Welcome to DonorOS Test Environment</h3>
        <p><strong>This is a demo environment with sample data only.</strong></p>
        <p class="mt-2">• No real payments will be processed</p>
        <p>• No real emails will be sent</p>
        <p>• All data is fictional for testing purposes</p>
        <p class="mt-3 text-sm text-purple-600 font-semibold">You have 30 minutes to explore all features. Let's take a quick tour!</p>
      `,
            buttons: [
                {
                    text: 'Skip Tour',
                    action: tour.cancel,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: tour.next
                }
            ]
        })

        tour.addStep({
            id: 'dashboard',
            text: `
        <h3 class="text-lg font-semibold mb-2">📊 Admin Dashboard</h3>
        <p>This is your main control center showing key metrics: donations, campaigns, and donor engagement.</p>
        <p class="mt-2 text-sm text-gray-600"><em>Sample data is displayed for demonstration purposes.</em></p>
      `,
            attachTo: {
                element: '[data-tour="dashboard"]',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        })

        tour.addStep({
            id: 'next-actions',
            text: `
        <h3 class="text-lg font-semibold mb-2">� Explore Key Features</h3>
        <p>Your dashboard shows recommended next actions based on your role. Here's what you can explore:</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li>• <strong>Donor CRM:</strong> 100+ fictional donors with realistic profiles</li>
          <li>• <strong>Campaigns:</strong> Sample fundraising campaigns with P2P features</li>
          <li>• <strong>Corporate Matching:</strong> Payroll reconciliation and variance reports</li>
          <li>• <strong>Grant Pipeline:</strong> Foundation grants at different pipeline stages</li>
          <li>• <strong>AI Studio:</strong> Generate personalized donor outreach</li>
        </ul>
        <p class="mt-3 text-sm text-gray-600">Click any card or navigation link to explore!</p>
      `,
            attachTo: {
                element: '[data-tour="dashboard"]',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        })

        tour.addStep({
            id: 'complete',
            text: `
        <h3 class="text-lg font-semibold mb-2">🎉 Tour Complete!</h3>
        <p>You're ready to explore DonorOS on your own. Click around and test any feature!</p>
        <div class="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p class="text-sm text-yellow-800"><strong>Remember:</strong> This is a test environment. No real transactions will occur.</p>
        </div>
        <p class="mt-3 text-sm font-semibold text-purple-600">Ready to use DonorOS for real? Click "Create Real Account" in the banner above!</p>
      `,
            buttons: [
                {
                    text: 'Start Exploring',
                    action: () => {
                        tour.complete()
                        // Stay on current page - don't navigate
                    }
                }
            ]
        })

        tourRef.current = tour

        // Listen for custom event to start tour
        const handleStartTour = () => {
            tour.start()
        }

        window.addEventListener('start-demo-tour', handleStartTour)

        // Auto-start tour if URL param is present
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('tour') === 'start') {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                tour.start()
            }, 1000)
        }

        return () => {
            window.removeEventListener('start-demo-tour', handleStartTour)
            // Don't call tour.complete() in cleanup - it can cause navigation issues
            if (tourRef.current) {
                tourRef.current.hide()
            }
        }
    }, [])

    return null // This component doesn't render anything
}

import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreateJourneyButton } from '@/components/admin/outreach/CreateJourneyButton';
import { cookies } from 'next/headers';

// Mock data for demo mode
const MOCK_JOURNEYS = [
  {
    id: 'demo-1',
    name: 'Welcome Series',
    description: 'Automated 5-email welcome sequence for new donors',
    status: 'active',
    trigger_type: 'first_donation',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    journey_enrollments: Array(47).fill(null)
  },
  {
    id: 'demo-2',
    name: 'Lapsed Donor Re-engagement',
    description: 'Win back donors who haven\'t given in 12+ months',
    status: 'active',
    trigger_type: 'inactivity_days',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    journey_enrollments: Array(23).fill(null)
  },
  {
    id: 'demo-3',
    name: 'Monthly Giving Upsell',
    description: 'Convert one-time donors to monthly recurring',
    status: 'active',
    trigger_type: 'donation_amount',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    journey_enrollments: Array(18).fill(null)
  },
  {
    id: 'demo-4',
    name: 'Year-End Campaign',
    description: 'Annual giving campaign with matching gift reminder',
    status: 'paused',
    trigger_type: 'manual',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    journey_enrollments: Array(156).fill(null)
  }
];

const MOCK_TASKS = [
  { id: '1', status: 'completed', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Welcome Series' } }, scheduled_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: '2', status: 'completed', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Welcome Series' } }, scheduled_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: '3', status: 'processing', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Monthly Giving Upsell' } }, scheduled_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: '4', status: 'completed', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Lapsed Donor Re-engagement' } }, scheduled_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: '5', status: 'scheduled', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Welcome Series' } }, scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
  { id: '6', status: 'completed', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Monthly Giving Upsell' } }, scheduled_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: '7', status: 'completed', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Welcome Series' } }, scheduled_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: '8', status: 'scheduled', task_type: 'send_email', journey_enrollments: { journeys: { name: 'Lapsed Donor Re-engagement' } }, scheduled_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() },
];

export default async function OutreachAdminPage() {
  const supabase = supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  // Check if in demo mode
  const cookieStore = cookies();
  const isDemoMode = cookieStore.get('demo-mode')?.value === 'true';

  let journeys, sentCount, deliveredCount, openedCount, clickedCount, openRate, clickRate, recentTasks;

  if (isDemoMode) {
    // Use mock data for demo
    journeys = MOCK_JOURNEYS;
    sentCount = 1247;
    deliveredCount = 1232;
    openedCount = 584;
    clickedCount = 127;
    openRate = '47.4';
    clickRate = '21.7';
    recentTasks = MOCK_TASKS;
  } else {
    // Fetch real data
    const { data: fetchedJourneys } = await supabase
      .from('journeys')
      .select(`
        *,
        journey_enrollments(count)
      `)
      .order('created_at', { ascending: false });

    journeys = fetchedJourneys;

    const { data: stats } = await supabase
      .from('outreach_analytics')
      .select('event_type')
      .in('event_type', ['sent', 'delivered', 'opened', 'clicked']);

    sentCount = stats?.filter((s: any) => s.event_type === 'sent').length || 0;
    deliveredCount = stats?.filter((s: any) => s.event_type === 'delivered').length || 0;
    openedCount = stats?.filter((s: any) => s.event_type === 'opened').length || 0;
    clickedCount = stats?.filter((s: any) => s.event_type === 'clicked').length || 0;

    openRate = deliveredCount > 0 ? ((openedCount / deliveredCount) * 100).toFixed(1) : '0';
    clickRate = openedCount > 0 ? ((clickedCount / openedCount) * 100).toFixed(1) : '0';

    const { data: fetchedTasks } = await supabase
      .from('outreach_tasks')
      .select(`
        *,
        journey_enrollments(
          donor_id,
          journeys(name)
        )
      `)
      .order('scheduled_at', { ascending: false })
      .limit(10);

    recentTasks = fetchedTasks;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Automated Donor Outreach</h1>
          <p className="mt-2 text-gray-600">
            Manage donor journeys, track engagement, and automate personalized communications
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{sentCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{openRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{clickRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Journeys</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {journeys?.filter((j: any) => j.status === 'active').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Journeys List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Donor Journeys</h2>
            <CreateJourneyButton />
          </div>
          <div className="divide-y divide-gray-200">
            {journeys && journeys.length > 0 ? (
              journeys.map((journey: any) => (
                <Link
                  key={journey.id}
                  href={`/admin/outreach/${journey.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{journey.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${journey.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {journey.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{journey.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Trigger: {journey.trigger_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>
                          {Array.isArray(journey.journey_enrollments)
                            ? journey.journey_enrollments.length
                            : 0} enrolled
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No journeys</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first donor journey.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Outreach Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.slice(0, 10).map((task: any) => (
                <div key={task.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : task.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {task.status}
                        </span>
                        <span className="text-sm text-gray-900">
                          {task.task_type === 'send_email' ? 'Email' : task.task_type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Journey: {(task.journey_enrollments as any)?.journeys?.name || 'Unknown'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Scheduled: {new Date(task.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">No tasks yet. Create a journey to start automating outreach.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

.
'use client'

import { useState } from 'react'

export function CreateJourneyButton() {
    const [showModal, setShowModal] = useState(false)

    const handleClick = () => {
        // Always show modal for both demo and production
        setShowModal(true)
    }

    const isDemoMode = typeof window !== 'undefined' && document.cookie.includes('demo-mode=true')

    return (
        <>
            <button
                onClick={handleClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                + Create Journey
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        {isDemoMode ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="text-xl">⚠️</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Available in Real User Mode</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Journey creation is a premium feature available when you create a real account. The visual journey builder allows you to:
                                </p>
                                <ul className="space-y-2 mb-6 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Set up trigger conditions (donation amount, inactivity, etc.)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Design multi-step email sequences with delays</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Add personalization tokens and AI-generated content</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Track engagement and optimize performance</span>
                                    </li>
                                </ul>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Continue Exploring
                                    </button>
                                    <a
                                        href="/auth/signin"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Create Account
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold mb-4">Journey Builder Coming Soon</h3>
                                <p className="text-gray-600 mb-4">
                                    The visual journey builder is under development. In the meantime, journeys can be created via API or database.
                                </p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

.