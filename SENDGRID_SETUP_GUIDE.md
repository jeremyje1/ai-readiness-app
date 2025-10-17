# SendGrid Setup Guide for Lead Generation Page

## Current Status

✅ **Contact form API endpoint already exists**: `/app/api/contact/route.ts`
✅ **Uses existing email service**: Currently configured for Postmark
✅ **Lead generation page created**: `lead-generation-page.html`
❌ **SendGrid not yet configured** (optional alternative to Postmark)

## Option A: Use Existing Postmark Integration (Recommended)

**The contact form will work immediately with your existing setup!**

Your `/app/api/contact/route.ts` endpoint already:
- Accepts contact form submissions
- Validates inputs and rate limits
- Persists to `contact_messages` table
- Sends emails via `emailService` (currently Postmark)
- Has spam detection and honeypot fields

### No Action Needed If:
- ✅ You already have Postmark configured (`POSTMARK_API_KEY` in .env)
- ✅ Your `emailService.sendContactEmail()` is working
- ✅ You want to receive leads at info@northpathstrategies.org

### Update lead-generation-page.html:
The form already points to `/api/contact` - just ensure these field name mappings:

**Current API expects:**
```json
{
  "name": "Jeremy Estrella",
  "email": "user@example.com", 
  "organization": "Example University",
  "message": "Interested in AI readiness assessment"
}
```

**Your form currently sends:**
```json
{
  "firstName": "Jeremy",
  "lastName": "Estrella",
  "email": "user@example.com",
  "institution": "Example University",
  "role": "CIO",
  "institutionType": "4-year-public",
  "interest": "AI Readiness Assessment",
  "message": "...",
  "timeline": "1-3-months"
}
```

**We need to transform the form data to match the API.**

---

## Option B: Add SendGrid as Alternative/Replacement

If you want to use SendGrid instead of or alongside Postmark:

### Step 1: Get SendGrid API Key

1. **Sign up/Log in to SendGrid**
   - Visit: https://signup.sendgrid.com/
   - Free tier: 100 emails/day

2. **Create API Key**
   - Navigate to: Settings → API Keys
   - Click "Create API Key"
   - Name: `AI_Blueprint_Lead_Generation`
   - Permissions: Select "Full Access" or minimum "Mail Send"
   - Copy the API key (only shown once!)

3. **Verify Sender Email**
   - Navigate to: Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Add: `noreply@educationaiblueprint.com` or your domain email
   - Complete verification process (check your email inbox)
   - **Important**: SendGrid requires sender verification to prevent spam

### Step 2: Add Environment Variables

Add to your `.env.local` file:

```bash
# SendGrid Configuration (for lead generation page)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@educationaiblueprint.com
SENDGRID_TO_EMAIL=info@northpathstrategies.org
```

### Step 3: Update Email Service (Optional)

If you want to use SendGrid for contact form emails:

**Create `lib/email-service-sendgrid.ts`:**

```typescript
interface SendGridContactEmailParams {
  name: string
  email: string
  organization?: string
  message: string
}

export async function sendContactEmailViaSendGrid(params: SendGridContactEmailParams): Promise<boolean> {
  const { name, email, organization, message } = params
  
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@educationaiblueprint.com"
  const SENDGRID_TO_EMAIL = process.env.SENDGRID_TO_EMAIL || "info@northpathstrategies.org"

  if (!SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY not configured")
    return false
  }

  const emailSubject = `New Lead: ${organization || "Contact Form"}`
  const emailHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Organization:</strong> ${organization || "Not provided"}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
  `

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: SENDGRID_TO_EMAIL }], subject: emailSubject }],
        from: { email: SENDGRID_FROM_EMAIL, name: "AI Blueprint Lead System" },
        reply_to: { email, name },
        content: [{ type: "text/html", value: emailHtml }]
      })
    })

    return response.ok
  } catch (error) {
    console.error("SendGrid send error:", error)
    return false
  }
}
```

**Update `lib/email-service.ts`:**

```typescript
import { sendContactEmailViaSendGrid } from './email-service-sendgrid'

// Add toggle to choose provider
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'postmark' // or 'sendgrid'

export const emailService = {
  sendContactEmail: async (params: ContactEmailParams) => {
    if (EMAIL_PROVIDER === 'sendgrid') {
      return await sendContactEmailViaSendGrid(params)
    }
    // Existing Postmark logic...
  }
}
```

---

## Step 4: Update lead-generation-page.html Form Handler

The form needs to transform its detailed fields into the API's expected format:

**Find this section in `lead-generation-page.html`:**

```javascript
// Transform form data to match API expectations
const apiPayload = {
    name: `${formData.firstName} ${formData.lastName}`,
    email: formData.email,
    organization: formData.institution,
    message: `
Role: ${formData.role}
Institution Type: ${formData.institutionType}
Primary Interest: ${formData.interest}
Timeline: ${formData.timeline || "Not specified"}

Message:
${formData.message}
    `.trim()
};

// Send to existing API
const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiPayload)
});
```

---

## Step 5: Testing Checklist

### Local Testing (Development)

1. **Start dev server**: `npm run dev`
2. **Open form**: Navigate to http://localhost:3001/lead-generation-page.html (or host it separately)
3. **Fill form with test data**:
   - Name: Test User
   - Email: your-test-email@example.com
   - Institution: Test University
   - Complete all fields
4. **Submit form**
5. **Verify**:
   - ✅ Success message appears
   - ✅ Email received at info@northpathstrategies.org
   - ✅ Entry saved to `contact_messages` table in Supabase
   - ✅ No console errors in browser DevTools

### Production Testing (After WordPress Deployment)

1. **Deploy to WordPress**: Upload `lead-generation-page.html`
2. **Update FORM_ENDPOINT**: Change to `https://your-domain.com/api/contact`
3. **Test with real data**
4. **Monitor SendGrid dashboard**: Check "Activity" for delivery status

---

## Step 6: WordPress Deployment

### Option A: Direct HTML Upload
1. Create new page in WordPress
2. Switch to "Code Editor" or "Text" mode
3. Paste entire `lead-generation-page.html` content
4. Publish

### Option B: Custom HTML Block
1. Create new page in WordPress (Gutenberg editor)
2. Add "Custom HTML" block
3. Paste `lead-generation-page.html` content
4. Publish

### Option C: Child Theme Template
1. Access WordPress theme files (via FTP or cPanel)
2. Create child theme if not exists
3. Add `page-lead-generation.php` template
4. Copy HTML content
5. Create new page and select "Lead Generation" template

### Update Form Endpoint After Deployment

In `lead-generation-page.html`, update line ~870:

```javascript
// Change from:
const FORM_ENDPOINT = '/api/contact';

// To your production API URL:
const FORM_ENDPOINT = 'https://educationaiblueprint.com/api/contact';
```

---

## Current Form Field Mapping

| Lead Gen Form Field | API Field | Transformation |
|---------------------|-----------|----------------|
| `firstName` + `lastName` | `name` | Concatenated |
| `email` | `email` | Direct |
| `institution` | `organization` | Direct |
| `role` | — | Embedded in `message` |
| `institutionType` | — | Embedded in `message` |
| `interest` | — | Embedded in `message` |
| `message` | `message` | Combined with metadata |
| `timeline` | — | Embedded in `message` |

---

## Monitoring & Analytics

### Check Email Delivery

**Postmark Dashboard:**
- https://account.postmarkapp.com/servers
- View: Message Streams → Activity

**SendGrid Dashboard:**
- https://app.sendgrid.com/email_activity
- Filter by date, status, recipient

### Check Database Logs

```sql
-- View recent contact submissions
SELECT 
  created_at,
  name,
  email,
  organization,
  substring(message, 1, 100) as message_preview,
  spam_score,
  honeypot_tripped
FROM contact_messages
ORDER BY created_at DESC
LIMIT 20;
```

### Check for Spam

```sql
-- High spam score submissions
SELECT * FROM contact_messages 
WHERE spam_score >= 10 
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Form Submission Fails (400 Bad Request)

**Cause**: Missing required fields or incorrect field names

**Fix**: Ensure transformation code maps:
- `firstName` + `lastName` → `name`
- `institution` → `organization`
- All fields are present

### Email Not Received

**Check 1**: Verify environment variables
```bash
echo $SENDGRID_API_KEY
echo $SENDGRID_FROM_EMAIL
echo $SENDGRID_TO_EMAIL
```

**Check 2**: Check SendGrid activity logs for errors

**Check 3**: Verify sender email is verified in SendGrid

**Check 4**: Check spam folder at info@northpathstrategies.org

### Rate Limiting (429 Too Many Requests)

**Cause**: More than 3 submissions per minute from same IP

**Solution**: Wait 1 minute or adjust rate limit in `/app/api/contact/route.ts`

### CORS Errors (WordPress Deployment)

**Cause**: API endpoint blocking cross-origin requests

**Fix**: Add CORS headers to `/app/api/contact/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ /* ... */ })
  
  // Add CORS headers for WordPress domain
  response.headers.set('Access-Control-Allow-Origin', 'https://your-wordpress-site.com')
  response.headers.set('Access-Control-Allow-Methods', 'POST')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://your-wordpress-site.com',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
```

---

## Security Considerations

✅ **Already Implemented:**
- Rate limiting (3 requests/minute per IP)
- Spam scoring heuristics
- Honeypot field detection
- Input validation and sanitization
- Message length limits (5000 chars)
- Email format validation

🔒 **Additional Recommendations:**
- Enable reCAPTCHA (v3) for invisible bot protection
- Monitor `contact_messages` table for spam patterns
- Set up alerts for high-volume submissions
- Implement IP-based blocking for repeat offenders

---

## Next Steps

1. ✅ **Choose email provider**: Postmark (current) or SendGrid (new)
2. ⏳ **Update form handler**: Modify `lead-generation-page.html` to transform fields
3. ⏳ **Test locally**: Submit test form and verify email delivery
4. ⏳ **Deploy to WordPress**: Upload HTML page
5. ⏳ **Update FORM_ENDPOINT**: Point to production API
6. ⏳ **Test in production**: Submit real form from WordPress
7. ⏳ **Monitor**: Check emails arriving at info@northpathstrategies.org

---

## Quick Start Commands

```bash
# Check if Postmark is configured
grep POSTMARK_API_KEY .env.local

# If using SendGrid, add keys
echo "SENDGRID_API_KEY=your-key-here" >> .env.local
echo "SENDGRID_FROM_EMAIL=noreply@educationaiblueprint.com" >> .env.local
echo "SENDGRID_TO_EMAIL=info@northpathstrategies.org" >> .env.local

# Start dev server
npm run dev

# Open browser to test form
open http://localhost:3001/lead-generation-page.html
```

---

## Resources

- **SendGrid Docs**: https://docs.sendgrid.com/
- **Postmark Docs**: https://postmarkapp.com/developer
- **Contact API**: `/app/api/contact/route.ts`
- **Email Service**: `/lib/email-service.ts`
- **Lead Page**: `/lead-generation-page.html`

---

**Ready to proceed?** Let me know:
1. Do you want to use Postmark (current) or SendGrid (new)?
2. Should I update the form handler to match the existing API?
3. Ready to deploy to WordPress?
