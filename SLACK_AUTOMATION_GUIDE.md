# 🤖 Slack Community Automation Setup Guide

## Overview

This comprehensive Slack automation system provides:
- **Automated Discussion Prompts** - Weekly conversation starters
- **Community Celebrations** - Assessment completion announcements  
- **Policy Alerts** - Framework update notifications
- **Educational Content** - Tips, blog posts, and resources
- **Admin Dashboard** - Full management interface

## 🔧 Setup Instructions

### 1. Create Slack App & Webhook

1. **Go to**: https://api.slack.com/apps
2. **Click**: "Create New App" → "From scratch"
3. **Enter**: 
   - App Name: "AI Readiness Community Bot"
   - Workspace: Select your workspace
4. **Navigate to**: "Incoming Webhooks" in sidebar
5. **Enable**: "Activate Incoming Webhooks" toggle
6. **Click**: "Add New Webhook to Workspace"
7. **Select**: Target channel (e.g., #ai-readiness-community)
8. **Copy**: Webhook URL (starts with https://hooks.slack.com...)

### 2. Configure Environment Variables

Add these to your `.env.local` and Vercel environment:

```bash
# Slack Integration
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/your/webhook/url"
POLICY_UPDATE_SLACK_ENABLED="true"
POLICY_UPDATE_SLACK_CHANNEL="#ai-readiness-community"

# Automation Security
CRON_SECRET="your-super-secure-cron-secret-here"

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### 3. GitHub Actions Setup (Automated Posting)

1. **Go to**: Your GitHub repository → Settings → Secrets and variables → Actions
2. **Add Repository Secrets**:
   ```
   CRON_SECRET: your-super-secure-cron-secret-here
   APP_BASE_URL: https://your-domain.com
   ```

### 4. Test the Integration

#### Manual Test via API:
```bash
# Send a test tip
curl -X POST https://your-domain.com/api/slack-automation \
  -H "Content-Type: application/json" \
  -d '{"action": "manual_post", "type": "tip"}'

# Send test discussion prompt
curl -X POST https://your-domain.com/api/slack-automation \
  -H "Content-Type: application/json" \
  -d '{"action": "manual_post", "type": "discussion", "category": "k12"}'
```

#### Test Assessment Celebration:
```bash
curl -X POST https://your-domain.com/api/slack-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "assessment_celebration",
    "data": {
      "institutionName": "Test School District",
      "score": 0.85
    }
  }'
```

## 📅 Automated Posting Schedule

| Content Type | Frequency | Time (EST) | Day |
|-------------|-----------|------------|-----|
| Weekly Tips | Weekly | 9:00 AM | Monday |
| K-12 Discussion | Weekly | 10:00 AM | Tuesday |
| Blog/Resource Share | Weekly | 11:00 AM | Wednesday |
| Higher Ed Discussion | Weekly | 10:00 AM | Thursday |
| Policy Focus | Weekly | 2:00 PM | Friday |

## 🎯 Content Examples

### Discussion Prompts

**K-12 Focus:**
- AI tool implementation experiences
- Student-facing applications
- Teacher productivity tools
- Administrative automation challenges

**Higher Education Focus:**
- Research applications of AI
- Academic integrity policies  
- Faculty guidelines
- Student use policies

**Policy Focus:**
- Framework implementations (NIST, ISO)
- Governance best practices
- Compliance challenges
- Resource sharing

### Weekly Tips
- Data governance practices
- Risk assessment strategies
- Vendor management
- Policy communication
- Training approaches

### Celebrations
- Assessment completions
- Policy implementation milestones
- Community achievements
- Success story highlights

## 🛠️ Admin Management

### Access Admin Dashboard
Navigate to: `/admin/slack-automation`

### Available Controls:
- **Manual Post Triggers** - Send immediate content
- **Schedule Management** - Enable/disable automated posts
- **Assessment Celebrations** - Trigger completion announcements
- **Policy Alerts** - Send framework update notifications
- **Community Highlights** - Feature member achievements

### Manual Triggers:
```javascript
// Weekly tip
POST /api/slack-automation
{
  "action": "manual_post",
  "type": "tip"
}

// Discussion prompt
POST /api/slack-automation
{
  "action": "manual_post", 
  "type": "discussion",
  "category": "k12" // or "higher_ed", "general"
}

// Blog share
POST /api/slack-automation
{
  "action": "manual_post",
  "type": "blog"
}
```

## 🔄 Automatic Triggers

### Assessment Completions
- **Trigger**: When user completes AI readiness assessment
- **Content**: Celebration with institution name and score
- **Timing**: Immediate upon completion

### Policy Updates  
- **Trigger**: Framework changes detected by policy monitoring
- **Content**: Alert with severity level and key changes
- **Timing**: Within 1 hour of detection

### Community Milestones
- **Trigger**: Manual admin trigger
- **Content**: Member highlights and achievements
- **Timing**: As needed

## 📊 Analytics & Monitoring

### GitHub Actions Logs
Check workflow execution at: Repository → Actions → "Slack Community Automation"

### API Logs
Monitor endpoint responses:
- `GET /api/slack-automation?action=schedule_status` - View current schedules
- `GET /api/cron/slack` - Trigger scheduled posts manually

### Slack Webhook Status
Test webhook health in Slack App dashboard under "Incoming Webhooks"

## 🎨 Customization

### Modify Content
Edit these files:
- **Discussion Prompts**: `lib/services/slack-automation.ts` → `getWeeklyPrompts()`
- **Tips**: `lib/services/slack-automation.ts` → `sendWeeklyTip()`
- **Blog Content**: `lib/services/slack-automation.ts` → `getCuratedContent()`

### Adjust Schedule
Modify: `.github/workflows/slack-automation.yml`
Update cron expressions for different timing

### Change Posting Frequency
Edit: `lib/services/slack-scheduler.ts` → `getDefaultSchedules()`

## 🚨 Troubleshooting

### Common Issues:

**Posts Not Sending:**
1. Check `SLACK_WEBHOOK_URL` is correctly set
2. Verify `POLICY_UPDATE_SLACK_ENABLED=true`
3. Test webhook URL manually in Slack app

**GitHub Actions Failing:**
1. Verify `CRON_SECRET` matches in code and secrets
2. Check `APP_BASE_URL` is accessible
3. Review action logs for specific errors

**Assessment Celebrations Not Working:**
1. Confirm Slack environment variables are set
2. Check that assessments are completing successfully
3. Verify API endpoint is accessible

### Debug Mode:
Set environment variable for detailed logging:
```bash
LOG_LEVEL="debug"
```

## 🔐 Security Considerations

- **Webhook URLs**: Keep private, rotate if compromised
- **Cron Secret**: Use strong, unique secret for automation
- **Rate Limiting**: Built-in to prevent spam
- **Error Handling**: Graceful failures won't break core functionality

## 📈 Success Metrics

Track engagement through:
- Message reaction counts
- Thread discussion activity  
- Assessment completion rates
- Community growth metrics
- Policy implementation feedback

---

## 🚀 Getting Started Checklist

- [ ] Create Slack app and webhook
- [ ] Add environment variables to Vercel
- [ ] Configure GitHub Actions secrets
- [ ] Test manual post triggers
- [ ] Verify automated schedule
- [ ] Complete assessment to test celebration
- [ ] Review admin dashboard functionality
- [ ] Customize content for your community

Your AI Readiness Slack community automation is now ready! 🎉
