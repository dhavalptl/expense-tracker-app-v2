---
name: security-review
description: Start security review (authz, XSS, secrets). Use when touching auth, server fns, or input.
---

# Security review

Threat-model the slice in five minutes: trust boundaries, assets, STRIDE, one abuse case per use case.

## Always

- Validate/parse at server functions and API routes. UI checks are UX only.
- Encode output; React text children are safe. Sanitize if HTML is required.
- Secrets from env, never committed. No tokens in `localStorage` if cookies/session exist.
- Authz on the **server** for every mutation and privileged read (IDOR: object-level checks).
- `httpOnly` + `secure` + `sameSite` cookies for sessions.
- Dependency audit on the lockfile before release (`pnpm audit` / `npm audit`).

## Never (guardrails)

Commit secrets. Log passwords/tokens. `dangerouslySetInnerHTML` / `eval` with user data. Wildcard CORS with credentials. Disable CSRF-relevant cookie flags "to make it work".

## Start-specific

- Client bundles must not import server secret modules.
- Server fn errors: generic client message, detailed server log.
- File uploads: size/type allowlist, stored outside web root, authz on read.
- Redirects: allowlist internal paths; block open redirects.
- Rate-limit auth and expensive mutations when the platform supports it.

## Headers

Prefer the hosting defaults + a CSP that matches how Vite/Start emit scripts. Tighten incrementally; do not copy a CSP that breaks the app.

## Report

```markdown
## Security
- Boundary:
- Abuse cases tested:
- Findings: Critical/High/Medium/Low — file — fix
```

Only confirmed issues. If clean, say so.

## Exit

- [ ] Authz on server mutations
- [ ] Input parsed
- [ ] No secrets in diff (`git diff` + grep for keys)
