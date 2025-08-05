# Power BI Embedded Integration

This implementation provides a complete Power BI Embedded solution for the organizational realignment application.

## 📁 Files Created

### Core Library (`lib/powerbi.ts`)

- **`getPowerBIAccessToken()`** - Acquires access tokens using Azure MSAL
- **`getEmbedToken()`** - Generates embed tokens for specific reports
- **`getReportDetails()`** - Fetches report metadata
- **`getEmbedConfig()`** - Complete embed configuration generator
- **`validatePowerBIConfig()`** - Environment validation utility
- **`getWorkspaceReports()`** - Lists all reports in a workspace

### API Routes (`app/api/powerbi/embed-token/route.ts`)

- **GET** `/api/powerbi/embed-token?reportId=xxx&workspaceId=xxx&datasetId=xxx`
- **POST** `/api/powerbi/embed-token` - For complex configurations
- Returns embed configuration ready for frontend consumption

### React Components (`components/PowerBIEmbed.tsx`)

- **`PowerBIEmbed`** - Reusable React component for embedding reports
- **`PowerBIDashboard`** - Example usage component
- Handles loading states, error handling, and Power BI SDK integration

### Configuration (`.env.powerbi.example`)

- Complete setup instructions for Azure AD app registration
- Environment variable templates
- Power BI service principal configuration guide

### Testing (`lib/test-powerbi.ts`)

- **`testPowerBISetup()`** - Validates entire setup
- Tests authentication, API connectivity, and permissions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @azure/msal-node --legacy-peer-deps
```

### 2. Configure Environment Variables

```bash
cp .env.powerbi.example .env.local
# Edit .env.local with your Azure AD app credentials
```

### 3. Set Up Azure AD App

Follow the detailed instructions in `.env.powerbi.example`

### 4. Test Setup

```bash
npx tsx lib/test-powerbi.ts
```

### 5. Use in Components

```tsx
import PowerBIEmbed from "@/components/PowerBIEmbed";

<PowerBIEmbed
  reportId="your-report-id"
  workspaceId="your-workspace-id"
  className="h-[600px]"
/>;
```

## 🔧 API Usage

### Frontend JavaScript

```javascript
// Get embed configuration
const response = await fetch("/api/powerbi/embed-token?reportId=xxx");
const { embedConfig } = await response.json();

// Use with Power BI JavaScript SDK
powerbi.embed(container, embedConfig);
```

### Direct Library Usage

```typescript
import { getEmbedConfig } from "@/lib/powerbi";

const config = await getEmbedConfig("report-id", "workspace-id");
```

## 🔒 Security Features

- **Service Principal Authentication** - Uses client credentials flow
- **Token Expiration** - Embed tokens automatically expire
- **Environment Validation** - Prevents runtime errors
- **Error Handling** - Comprehensive error messages and logging

## 📊 Supported Features

- ✅ Report embedding with full interactivity
- ✅ Custom embed settings (filters, navigation, etc.)
- ✅ Multiple workspace support
- ✅ Dataset-specific token generation
- ✅ Real-time error handling
- ✅ Loading states and user feedback
- ✅ TypeScript support with full type definitions

## 🛠 Advanced Configuration

### Custom Embed Settings

```typescript
const config = await getEmbedConfig(reportId);
config.settings = {
  panes: {
    filters: { visible: false },
    pageNavigation: { visible: true },
  },
  background: 1, // Transparent background
};
```

### Error Handling

```typescript
try {
  const token = await getEmbedToken(reportId);
} catch (error) {
  if (error.message.includes("401")) {
    // Handle authentication error
  } else if (error.message.includes("403")) {
    // Handle permission error
  }
}
```

This implementation provides enterprise-grade Power BI embedding with full TypeScript support, comprehensive error handling, and production-ready security practices.
