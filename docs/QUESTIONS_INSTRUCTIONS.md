# QUESTIONS_INSTRUCTIONS.md

## Purpose
This file defines the functional areas, question format, and implementa## AI Generation Prompt (Future Implementation)
For future AI report generation functionality:
```
You are NorthPath's organizational strategy assistant. Based on the assessment answers, generate:
- Executive summary of organizational strengths and challenges
- Functional area analysis across the 11 categories
- Priority recommendations for organizational improvement
- Risk assessment and mitigation strategies
- Implementation roadmap with quick wins and long-term goals
```uctions for GitHub Copilot to use when applying the Organizational Realignment Assessment questions in the NorthPath application codebase.

The questions guide college leaders through a 14-section diagnostic survey. The answers are used to generate AI-powered reports for structural redesign.

---

## Question Structure
Each question is an object with the following fields:

```ts
{
  id: string;                        // unique identifier (e.g., 'inst-1')
  text: string;                      // question prompt/text
  area: string;                      // functional category (e.g., 'Institutional Overview')
  type: "likert" | "select" | "multi-select" | "number" | "text";  // question input type
  options?: string[];                // optional: for select/multi-select questions
  conditional?: { dependsOn: string; value: string };  // optional: conditional logic
}
```

All questions are stored in a single array called `questions` in `app/data/questions.ts`. This array is imported by the frontend assessment wizard, backend scoring pipeline, and survey components.

---

## Functional Areas and Questions

The assessment covers 11 functional areas with a total of 39 questions:

### 1. Institutional Overview
- inst-1: What is your institution type? (select)
- inst-2: Number of physical campuses? (number)
- inst-3: Do campuses currently share centralized admin services? (select)
- inst-4: Annual operating budget (USD)? (number)
- inst-5: Current enterprise systems used: (multi-select)

### 2. Governance & Leadership
- gov-1: Is there a written decision-matrix delineating authority across divisions? (likert)
- gov-2: Frequency of cabinet-level strategic reviews per year? (number)
- gov-3: Overlap in reporting lines detected in org chart? (select)

### 3. Academic Affairs
- acad-1: Number of distinct academic divisions/colleges? (number)
- acad-2: Percentage of courses with fewer than 10 enrolled students? (number)
- acad-3: Does the institution share course shells across campuses? (select)
- acad-4: Average faculty course load variance across departments? (number)

### 4. Student Services & Success
- ss-1: Is advising decentralized by college? (select)
- ss-2: Student-to-advisor ratio? (number)
- ss-3: AI chatbots currently deployed for tier-1 FAQs? (select)

### 5. Enrollment Management & Admissions
- enroll-1: What is your annual enrollment target? (number)
- enroll-2: Is application processing centralized or decentralized? (select)
- enroll-3: Do you use AI tools for lead scoring or outreach? (select)

### 6. Finance & Budget
- fin-1: Are budget owners trained in zero-based budgeting? (select)
- fin-2: Procurement spend duplicated across independent cost centers? (select)
- fin-3: Does your institution participate in any shared services consortia for purchasing? (select)

### 7. Human Resources & Talent
- hr-1: Does your institution use a centralized applicant tracking system? (select)
- hr-2: Average time-to-fill for open staff roles (in days)? (number)
- hr-3: Percent of performance reviews completed on time? (number)

### 8. Information Technology & Digital Infrastructure
- it-1: Percent of key systems migrated to cloud/SaaS? (number)
- it-2: Average help-desk resolution time (in hours)? (number)
- it-3: Is RPA/AI used for transcript evaluation? (select)

### 9. Facilities & Operations
- fac-1: Total gross square footage managed by facilities staff? (number)
- fac-2: Do multiple campuses share maintenance or security contracts? (select)
- fac-3: Energy cost per square foot (annual average in USD)? (number)

### 10. Marketing, Communications & Advancement
- mkt-1: Number of full-time staff supporting marketing and communications? (number)
- mkt-2: Are advancement/alumni engagement tools integrated with CRM? (select)
- mkt-3: Percent of marketing budget allocated to digital advertising? (number)

### 11. Institutional Research & Data Analytics
- ir-1: Does your institution have a dedicated IR team? (select)
- ir-2: How frequently are key performance indicators (KPIs) reviewed by leadership? (select)
- ir-3: Is there a centralized data warehouse supporting cross-functional reporting? (select)

### 12. Compliance & Risk Management
- comp-1: How often is FERPA training completed by faculty/staff? (select)
- comp-2: Does the institution have a formal risk register? (select)
- comp-3: Have there been any recent data privacy incidents? (select)

---

## Usage Notes
- Frontend renders questions by functional area/section in the survey page (`/survey`)
- Questions are loaded via the `useQuestions` hook from static data in `app/data/questions.ts`
- Survey navigation is handled by the `useSurvey` hook with section-based grouping
- Backend accepts answers via the `/api/survey` endpoint
- Question types supported:
  - `likert`: 5-point scale using LikertInput component
  - `number`: Numeric input using NumericInput component
  - `select`: Single choice dropdown with predefined options
  - `multi-select`: Multiple choice selection (future implementation)
  - `text`: Free-form text input
- Answers are stored in Supabase via the `survey_responses` table

---

## AI Generation Prompt (System)
Used in `generateReport.ts`:
```
You are NorthPath’s organizational strategy assistant. Based on the assessment answers, generate:
- Executive summary
- Heatmap (1–5 scale)
- Top 5 risks
- Top 5 quick wins
- Bronze/Silver/Gold consulting recommendations
```

---

## Copilot Instructions
GitHub Copilot should:
1. Use this file to understand the question structure and functional areas
2. Ensure survey UI properly handles all question types (likert, number, select, multi-select, text)
3. Validate that select/multi-select questions include proper options arrays
4. Maintain consistency between question IDs and functional area groupings
5. Follow the TypeScript Question interface when working with question data
6. Use the `area` property for section-based navigation and filtering
7. Ensure proper data flow from `questions.ts` → `useQuestions` → `useSurvey` → Survey UI

## Implementation Status
- ✅ Question data structure defined in `app/data/questions.ts`
- ✅ Question type interface with proper TypeScript definitions
- ✅ Survey hooks (`useQuestions`, `useSurvey`) implemented and working
- ✅ Survey page with multi-type question support
- ✅ 39 questions across 11 functional areas
- 🔄 AI report generation (future enhancement)
- 🔄 Advanced scoring and analytics (future enhancement)