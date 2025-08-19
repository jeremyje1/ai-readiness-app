# Security Considerations

* **Data Residency:** All PII stored in U.S. data centers (Neon primary region us‑east‑1).
* **Encryption:** TLS 1.3 for data in transit; AES‑256‑GCM at rest.
* **Audit Trail:** Immutable event log stored in Postgres `ora_audit` schema.
* **Least Privilege:** RBAC roles (`ADMIN`, `EDITOR`, `VIEWER`) enforced in JWT claims.
* **Pen‑Testing:** Annual external penetration test; automated dependency scanning via Snyk.

---

## Additional Security Recommendations

- **Incident Response:**
  - Document incident response plan and escalation contacts.
- **Secrets Management:**
  - Store all secrets in environment variables or a managed secrets vault (never in code).
- **Compliance:**
  - Review for FERPA and GDPR compliance as applicable.
- **Session Management:**
  - Set secure, httpOnly cookies for authentication tokens.
- **Monitoring:**
  - Enable alerting for suspicious logins and failed access attempts.
