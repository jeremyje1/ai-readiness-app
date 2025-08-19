# API Reference

This document describes the main API endpoints for the Organizational Realignment App (ORA).

---

## Authentication

All endpoints require authentication via Auth0 (SSO) unless otherwise noted.

---

## Endpoints

### `GET /api/organizations`
Returns a list of organizations.

**Response:**
```json
[
  {
    "id": "org_123",
    "name": "NorthPath University",
    "mission": "..."
  }
]
```

---

### `GET /api/units?organizationId=...`
Returns all units for a given organization.

---

### `POST /api/scenarios`
Create a new realignment scenario.

**Body:**
```json
{
  "organizationId": "org_123",
  "name": "Scenario A",
  "changes": [ ... ]
}
```

---

### `GET /api/results?scenarioId=...`
Get analytics and recommendations for a scenario.

---

### `GET /api/status`
Public endpoint. Returns app health and basic stats.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```
