# Design — Cognito CustomMessage Lambda (branded Spanish auth emails)

**Date:** 2026-07-06
**Status:** Approved design, pending implementation plan
**Related:** [`docs/14-email-ses-setup.md`](../../14-email-ses-setup.md)

## Problem

Cognito auth emails (sign-up verification, password reset, admin invitation) currently use Cognito's **default template in English** with a generic sender. We want them **branded and in Spanish**, consistent with the existing SES business emails, and delivered through SES.

A `CustomMessage` Lambda trigger is the mechanism: it intercepts each auth email event and returns custom subject + HTML body. Cognito still performs the actual send (via SES, wired separately — see `14-email-ses-setup.md`).

## Goals

- Branded, Spanish emails for the auth flows below, reusing the existing `baseTemplate()` branding (single source of truth).
- Per-flow content (sign-up ≠ reset ≠ invite), which Cognito's built-in template cannot do.
- Pure, unit-testable template + routing logic.
- Deployment that fits the existing `infrastructure/scripts/*.sh` style.

## Scope

**In scope** (4 trigger sources):

| Flow | Trigger source | Notes |
|---|---|---|
| Sign-up verification | `CustomMessage_SignUp` | 6-digit code (`{####}`) |
| Resend verification code | `CustomMessage_ResendCode` | Same template as sign-up |
| Password reset | `CustomMessage_ForgotPassword` | 6-digit code (`{####}`) |
| Admin user invitation | `CustomMessage_AdminCreateUser` | Username (`{username}`) + temporary password (`{####}`) |

**Out of scope:**
- MFA (`CustomMessage_Authentication`) — no MFA in dev today. Handler falls through safely; a template can be added later.
- Email verification for attribute updates (`CustomMessage_VerifyUserAttribute`, `CustomMessage_UpdateUserAttribute`) — not used yet; safe fallback.
- Wiring Cognito → SES and DNS/DKIM verification — tracked in `14-email-ses-setup.md`, prerequisite for delivery but independent of this build.
- Verification by **link** — we use **code** (mobile app enters the code; matches the pool's current default).

## Architecture

Delivery style: **code-based** (`{####}`), not link.

### Components

**1. Pure auth templates** — `src/modules/email/infrastructure/templates/`

Three new files, same shape as the existing pure templates (`xxxTemplate(data)` + `xxxSubject()`), each wrapping content in `baseTemplate()`:

- `cognito-verification.template.ts` — sign-up + resend
- `cognito-password-reset.template.ts` — password reset
- `cognito-admin-invite.template.ts` — admin invitation

The Cognito placeholders (`{####}`, `{username}`) are embedded **literally** in the returned HTML; Cognito substitutes them after the Lambda returns. Templates may accept optional data (e.g., a display name from `userAttributes`) but must not require the code value.

Example interface:
```ts
export const cognitoVerificationSubject = (): string => 'Verifica tu cuenta en Mekapal';
export const cognitoVerificationTemplate = (data?: { name?: string }): string =>
  baseTemplate(/* content incl. the literal {####} */);
```

**2. Lambda handler** — `mekapal-api/lambdas/cognito-custom-message/handler.ts`

```ts
export const handler = async (
  event: CustomMessageTriggerEvent,
): Promise<CustomMessageTriggerEvent> => { ... }
```

- Routes on `event.triggerSource` to the matching template.
- Sets `event.response.emailSubject` and `event.response.emailMessage`.
- Ensures the required placeholder is present in `emailMessage` (`{####}` for all; also `{username}` for admin invite).
- **Unknown / out-of-scope trigger → returns `event` unchanged** (Cognito falls back to its default message). Never throws on an unrecognized trigger.

**3. Build** — esbuild

- Bundles handler + imported pure templates into `lambdas/cognito-custom-message/dist/index.js`.
- `--platform=node --target=node20 --format=cjs --bundle`. No external runtime deps (aws-lambda types are dev-only).
- `@types/aws-lambda` and `esbuild` added as devDependencies. A `build:lambda:cognito` script in `package.json`.

**4. Deploy** — `infrastructure/scripts/07-cognito-lambda.sh`

- Build → zip `dist/index.js`.
- `create-function` (first run) or `update-function-code` (subsequent). Runtime `nodejs20.x`, handler `index.handler`, an execution role with `AWSLambdaBasicExecutionRole` (CloudWatch Logs).
- `lambda add-permission` granting `cognito-idp.amazonaws.com` invoke rights, scoped to the user pool ARN.
- `update-user-pool` adding `--lambda-config '{"CustomMessage": "<lambda-arn>"}'` — **re-passing the full pool config** (password policy, auto-verified-attributes, account-recovery, admin-create-user-config, schema) to avoid the `update-user-pool` full-replace gotcha.

### Data flow

```
Cognito auth event
  → invokes Lambda with { triggerSource, request: { codeParameter: "{####}",
                          usernameParameter: "{username}", userAttributes } }
  → handler routes on triggerSource → template returns subject + HTML (with literal placeholders)
  → handler sets event.response.emailSubject / emailMessage → returns event
  → Cognito substitutes {####}/{username} and sends via SES
```

## Error handling

- Handler never throws on an unknown `triggerSource` — returns the event untouched (safe default message). Throwing would block the auth flow (user can't sign up / reset).
- Placeholder safety: each in-scope branch guarantees the required placeholder is in the body (enforced by unit tests). A missing `{####}` would make Cognito reject the message and break the flow.
- Templates are pure and total (no I/O, no async, no external calls), so there is no runtime failure surface beyond routing.

## Testing (TDD)

Unit tests (jest, `pnpm test`):

- **Templates:** each `xxxTemplate()` returns HTML containing the required literal placeholder(s) and the Mekapal branding markers (via `baseTemplate`); each `xxxSubject()` returns the expected Spanish subject.
- **Handler routing:** for each in-scope `triggerSource`, given an event, the handler sets the correct subject and an `emailMessage` containing `{####}` (and `{username}` for admin invite).
- **Fallback:** an unknown `triggerSource` returns the event with `response` untouched and does not throw.

No integration test against live Cognito in this scope; delivery is validated manually after SES wiring (per `14-email-ses-setup.md`).

## Dependencies & prerequisites

- **Blocking delivery (not this build):** DKIM DNS records verified → SES domain verified → Cognito `EmailConfiguration` pointed at SES → SES production access. All tracked in `14-email-ses-setup.md`. This Lambda can be **built, unit-tested, and deployed** independently; it only produces visible emails once SES delivery is wired.
- **Lambda execution role** with `AWSLambdaBasicExecutionRole` (create if absent).
- Node 20 Lambda runtime.

## Out-of-scope / future

- MFA and attribute-verification templates (drop-in later; handler already falls through).
- Per-locale switching (single language — Spanish — for now).
- CI deploy of the Lambda via GitHub Actions (initial deploy is the script; a workflow job can follow the pattern later).
