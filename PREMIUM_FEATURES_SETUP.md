# Premium Features Setup Guide

## Overview

This guide explains how to set up the premium features backend systems that replace the mock data in the AI Readiness Dashboard.

## Database Setup

### 1. Apply Premium Features Migration

Navigate to the Supabase Dashboard SQL editor and run the contents of:
- `database/migrations/premium_features.sql`

This creates the following tables:
- `team_members` - Team member profiles and permissions
- `team_activity` - Activity log for team actions
- `implementation_phases` - Project implementation phases
- `implementation_tasks` - Tasks within each phase
- `roi_metrics` - ROI tracking data
- `calendar_events` - Calendar events and meetings
- `event_rsvps` - Event attendance tracking

### 2. Seed Test Data (Optional)

To populate with test data, run:
- `database/seed-premium-data.sql`

This will create sample data for testing the premium features.

## API Endpoints

The following API endpoints have been created:

### Team Management
- `GET /api/team` - Fetch team members and recent activity
- `POST /api/team` - Add new team members

### Task Tracking
- `GET /api/tasks` - Get implementation phases and tasks
- `POST /api/tasks` - Create new tasks
- `PATCH /api/tasks` - Update task status

### ROI Metrics
- `GET /api/roi` - Fetch ROI metrics with aggregations
  - Query params: `period` (30d, 90d, 1y)
- `POST /api/roi` - Add new ROI metrics

### Calendar Integration
- `GET /api/calendar` - Fetch calendar events
  - Query params: `start`, `end`, `type`
- `POST /api/calendar` - Create new events
- `PATCH /api/calendar` - RSVP to events

## Frontend Integration

The premium dashboard currently shows mock data. To integrate with real data:

1. Update the premium dashboard components to fetch from the new APIs
2. Replace mock data displays with real API calls
3. Add loading states and error handling

## Features Implemented

### 1. Team Management System
- Team member profiles with roles and permissions
- Department organization
- Activity tracking and audit logs
- Permission-based access control

### 2. Task Tracking System
- Multi-phase project management
- Task prioritization and status tracking
- Progress calculation
- Time tracking (estimated vs actual hours)

### 3. ROI Calculation Engine
- Cost savings tracking
- Revenue increase metrics
- Productivity gains measurement
- Automatic ROI percentage calculation
- Annual projections and payback period

### 4. Calendar Integration
- Event creation and management
- RSVP functionality
- Event categorization (meeting, training, workshop, etc.)
- Team member invitations

## Security

All endpoints implement:
- Authentication via Supabase Auth
- Row Level Security (RLS) policies
- Institution-based data isolation
- Permission checking for sensitive operations

## Next Steps

1. Update frontend components to use real APIs
2. Add real-time updates for team activity
3. Implement recurring events for calendar
4. Add data visualization for ROI metrics
5. Create notification system for task assignments

## Testing

After setup, test the APIs:

```bash
# Test team endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.vercel.app/api/team

# Test with specific period for ROI
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-app.vercel.app/api/roi?period=90d"
```

Replace `YOUR_TOKEN` with a valid Supabase auth token.