# Email & SES Setup (Cognito auth + transactional)

How Mekapal sends email, and everything required to make auth-flow emails **custom (branded, Spanish)** delivered through **Amazon SES**.

> **Environment note:** We currently run a single shared **dev/staging** environment — there is no production yet. This document doubles as the **production readiness checklist**: every row in the [Dev vs Production](#dev-vs-production-checklist) table is a thing that must be revisited before go-live so nothing is missed.

## Overview

There are **two independent consumers** of email, both sending from `noreply@mekapal.com` via **the same SES domain identity**:

| Consumer | What it sends | How it sends |
|---|---|---|
| **Cognito** (auth) | Sign-up verification code, password reset code, resend code, admin invitation, MFA | Cognito `EmailConfiguration` in `DEVELOPER` mode → SES. Content customized by a `CustomMessage` Lambda trigger. |
| **Backend** (business) | Validation approve/reject, account deletion, notifications, future flows (orders, bids, settlements, incidents) | `ses-email.service.ts` using the SES SDK directly. |

**Why SES (not third-party SMTP like Purelymail):** Cognito can only deliver email through its own default sender or **Amazon SES** — it cannot use an arbitrary SMTP server. SES is the only path that keeps Cognito's native flows and gives us branded, unlimited email. (Purelymail can still be kept as a *receiving* mailbox for `noreply@` / `soporte@` — SES only sends.)

## Current State (as of 2026-07-06, dev)

- ✅ SES domain identity **created**: `mekapal.com` in `us-east-1`
  - ARN: `arn:aws:ses:us-east-1:946839355377:identity/mekapal.com`
  - Easy DKIM enabled (RSA 2048), status `NOT_STARTED` until DNS records are added.
- ⏳ **DKIM DNS records pending** — sent to the domain administrator (see [DNS Records](#dns-records)). Domain is **not verified** until these propagate.
- 🔴 SES account is in **SANDBOX** (`ProductionAccessEnabled: false`): max **200 emails/day**, **1/sec**, and can only send to **verified** recipients.
- ❌ Cognito is **not** yet wired to SES — auth emails still use Cognito's default sender (English, generic from).
- ✅ `CustomMessage` Lambda **built + unit-tested** (`lambdas/cognito-custom-message/`); recurring deploy wired via GitHub Actions. Not yet bootstrapped onto the pool (run `07-cognito-lambda.sh` once), so auth emails still use Cognito's English default until then.
- ⚠️ `ses-email.service.ts` (business emails) already uses the SES SDK, but **was not actually delivering** because no identity was verified. It starts working once the domain is verified + out of sandbox.

## DNS Records

Added on `mekapal.com` at the registrar/DNS provider (the domain is **not** in this account's Route 53). These verify the domain and enable DKIM signing.

| Type  | Host                                                       | Value                                                 | Required |
|-------|------------------------------------------------------------|-------------------------------------------------------|----------|
| CNAME | `uirdud5ld2seqg7vuyn2n566yhehuqyk._domainkey.mekapal.com` | `uirdud5ld2seqg7vuyn2n566yhehuqyk.dkim.amazonses.com` | ✅ |
| CNAME | `n4mtn5uejeamowr2w22y6sinsfsdmcdp._domainkey.mekapal.com` | `n4mtn5uejeamowr2w22y6sinsfsdmcdp.dkim.amazonses.com` | ✅ |
| CNAME | `54le5xfprbidwmzyujvdoxzhnls5brsb._domainkey.mekapal.com` | `54le5xfprbidwmzyujvdoxzhnls5brsb.dkim.amazonses.com` | ✅ |
| TXT   | `_dmarc.mekapal.com`                                        | `v=DMARC1; p=none; rua=mailto:dmarc@mekapal.com`      | Recommended |

> CNAMEs must **not** be proxied (Cloudflare "DNS only"). If also sending from Purelymail human mailboxes, add an SPF TXT that includes both senders — not needed for SES-only sending, since DKIM alignment passes DMARC.

## Setup Steps

### Step 1 — SES domain identity + DKIM ✅ (records pending)

```bash
aws sesv2 create-email-identity --email-identity mekapal.com --region us-east-1
aws sesv2 get-email-identity   --email-identity mekapal.com --region us-east-1   # DKIM tokens
```

Verify status after DNS propagates:

```bash
aws sesv2 get-email-identity --email-identity mekapal.com --region us-east-1 \
  --query '{Verified:VerifiedForSendingStatus, Dkim:DkimAttributes.Status}'
# Goal: Verified: true, Dkim: SUCCESS
```

### Step 2 — Authorize Cognito to send from the SES identity

Cognito (`DEVELOPER` mode) needs a sending-authorization policy on the SES identity. Scope it to our account + user pool.

```bash
aws ses put-identity-policy \
  --identity mekapal.com \
  --policy-name CognitoAuthSend \
  --policy '{
    "Version": "2008-10-17",
    "Statement": [{
      "Sid": "AllowCognitoSend",
      "Effect": "Allow",
      "Principal": { "Service": "cognito-idp.amazonaws.com" },
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "arn:aws:ses:us-east-1:946839355377:identity/mekapal.com",
      "Condition": {
        "StringEquals": { "aws:SourceAccount": "946839355377" },
        "ArnLike": { "aws:SourceArn": "arn:aws:cognito-idp:us-east-1:946839355377:userpool/<USER_POOL_ID>" }
      }
    }]
  }' \
  --region us-east-1
```

### Step 3 — Point Cognito at SES (`EmailConfiguration`)

```json
"EmailConfiguration": {
  "EmailSendingAccount": "DEVELOPER",
  "SourceArn": "arn:aws:ses:us-east-1:946839355377:identity/mekapal.com",
  "From": "Mekapal <noreply@mekapal.com>",
  "ReplyToEmailAddress": "soporte@mekapal.com"
}
```

> ⚠️ **`update-user-pool` gotcha:** it **replaces the entire pool configuration**. Any parameter you don't re-pass (password policy, `auto-verified-attributes`, `account-recovery-setting`, `admin-create-user-config`, schema) reverts to defaults. Always re-send the full config from `infrastructure/scripts/05-cognito.sh` plus the new `--email-configuration`.

### Step 4 — Request SES production access (exit sandbox)

Sandbox blocks sending to real users. Request production via console (**SES → Account dashboard → Request production access**) or CLI:

```bash
aws sesv2 put-account-details \
  --production-access-enabled \
  --mail-type TRANSACTIONAL \
  --website-url https://mekapal.com \
  --use-case-description "Transactional auth emails (verification, password reset) and business notifications for a logistics marketplace. Recipients are registered users only." \
  --contact-language ES \
  --region us-east-1
```

Approval takes ~24–48h. Sandbox status is **account + region scoped** — see production checklist for the multi-account implication.

### Step 5 — `CustomMessage` Lambda (branded Spanish auth emails) — BUILT

Makes the auth emails custom. The Lambda intercepts each auth event and returns Spanish HTML reusing the backend's `base.template.ts` branding.

- **Code:** `lambdas/cognito-custom-message/handler.ts` + pure templates `src/modules/email/infrastructure/templates/cognito-*.template.ts`. Bundled with esbuild (`pnpm build:lambda:cognito`), unit-tested via `pnpm test:lambda`.
- **Triggers handled:** `CustomMessage_SignUp`, `CustomMessage_ResendCode`, `CustomMessage_ForgotPassword`, `CustomMessage_AdminCreateUser`. Any other trigger (MFA, attribute verification) is a **safe pass-through** — the handler leaves the response untouched and Cognito uses its default message.
- **Contract:** sets `response.emailSubject` / `response.emailMessage`; the body embeds the literal `{####}` (code / temp password) and `{username}` (admin invite) placeholders, which Cognito substitutes after the Lambda returns.

**Provisioning (one-time per environment):** run `infrastructure/scripts/07-cognito-lambda.sh`. It creates the execution role, creates the function `mekapal-cognito-custom-message-<env>`, grants Cognito invoke permission, and wires the `CustomMessage` trigger onto the pool (re-passing the full config — update-user-pool gotcha).

**Recurring deploys:** automatic via GitHub Actions — `deploy-lambda-dev.yml` (push to `develop`) and `deploy-lambda-prod.yml` (push to `main`), path-filtered on the handler + Cognito templates + `base.template.ts`, calling the reusable `_deploy-lambda.yml` (build → `update-function-code`). No manual step for template changes.

> `update-function-code` (CI) requires the function to already exist, so the bootstrap script must run once per environment **before** CI can deploy to it.

> Wiring the Lambda is independent of SES: once bootstrapped, Spanish emails work immediately via Cognito's default sender (dev/sandbox limits). SES wiring (Steps 1–4) only changes transport/sender/limits.

> Quick alternative (no Lambda): set `VerificationMessageTemplate` (Spanish subject/body). Limitation — sign-up and password-reset share the **same** template; you can't differentiate their text. Fine as an interim step.

### Step 6 — Bounce/complaint handling (recommended before prod)

An SES **configuration set** + SNS topic to capture bounces/complaints, so reputation is monitored and hard bounces are suppressed. Not required in dev; AWS looks for it when approving production access.

## Environment Variables

```
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@mekapal.com
```

Backend AWS credentials come from the **ECS task role** (not access keys) — the role already has `ses:SendEmail` / `ses:SendRawEmail` (see `infrastructure/policies/app-policy.json`).

## Dev vs Production Checklist

Everything to revisit before going live. Assumes a **separate production AWS account** may be created; if prod stays in the same account, the "shared" items only need doing once.

| Item | Dev / staging (now) | Production | Scope note |
|---|---|---|---|
| SES domain identity | `mekapal.com` verified via DKIM | **Re-verify** if prod is a separate AWS account (identities don't cross accounts) | Per account+region |
| Sandbox → production access | Requesting now | Must be granted **again** in a separate prod account/region | Per account+region |
| Cognito user pool | `mekapal-dev-pool` | `mekapal-prod-pool` — repeat Steps 2, 3, 5 with the prod pool ID | Per pool |
| SES→Cognito authorization policy | Scoped to dev pool ARN | Re-create scoped to prod pool ARN | Per pool |
| `CustomMessage` Lambda | Built; bootstrap via `07-cognito-lambda.sh`, code deploys via CI (`deploy-lambda-dev.yml`) | Bootstrap once against prod pool (`mekapal-cognito-custom-message-prod`); CI via `deploy-lambda-prod.yml` on `main` | Per pool |
| DMARC policy | `p=none` (monitor) | Harden to `p=quarantine` then `p=reject` after confirming DKIM aligns | Per domain |
| MAIL FROM domain | Default (`amazonses.com`) | Consider custom `mail.mekapal.com` (MX + SPF) for alignment/branding | Per domain |
| Bounce/complaint config set | Optional | **Required** — SNS topic + suppression + CloudWatch alarms on bounce/complaint rate | Per account+region |
| Sending identity / IAM | Operating as **root** (temporary) | Never use root; scoped IAM user/role for setup, task role for the app | Account |
| Dedicated IP | No (shared) | Only if volume justifies warm-up; shared IP fine at current scale | Account |
| Reply-To / support inbox | `soporte@mekapal.com` (verify it receives) | Same, monitored | Per domain |
| From display name | `Mekapal <noreply@mekapal.com>` | Same | Per pool |
| Rate limits | 200/day sandbox | Request quota increase sized to real volume | Per account+region |
| Templates language | Spanish (`es-GT`) | Same; consider per-locale if the app adds languages | Per Lambda |

## Progress Tracker

- [x] **1.** SES domain identity created (`mekapal.com`, us-east-1)
- [x] **1b.** DKIM DNS records added by admin → **domain VERIFIED** (DkimStatus SUCCESS)
- [x] **2.** SES→Cognito authorization policy applied (`CognitoAuthSend` on the identity, scoped to dev pool)
- [ ] **3.** Cognito `EmailConfiguration` → SES (DEVELOPER mode) — **deferred until SES production**; wiring in sandbox would restrict dev auth emails to verified recipients only
- [ ] **4.** SES production access — **requested, PENDING** (support case `178338553700534`, awaiting our reply)
- [x] **5a.** `CustomMessage` Lambda built + unit-tested (`lambdas/cognito-custom-message/`)
- [x] **5b.** Recurring deploy wired via GitHub Actions (`deploy-lambda-dev.yml` / `-prod.yml` → `_deploy-lambda.yml`)
- [x] **5c.** Bootstrap run on **dev** → function `mekapal-cognito-custom-message-dev` created, deployed, trigger attached to pool `us-east-1_UAqdypRST`, validated (all 3 flows render Spanish). Prod bootstrap pending.
- [ ] **6.** Bounce/complaint configuration set (before prod)

> ⚠️ Pending externally: **DMARC cleanup** — `_dmarc.mekapal.com` has conflicting records; admin to keep only `v=DMARC1; p=none; rua=mailto:dmarc@mekapal.com`.

## References

- Cognito setup: [`05-cognito-setup.md`](./05-cognito-setup.md)
- IAM / app policy: [`01-iam-setup.md`](./01-iam-setup.md)
- Backend email service: `src/modules/email/infrastructure/services/ses-email.service.ts`
- Email templates: `src/modules/email/infrastructure/templates/`
