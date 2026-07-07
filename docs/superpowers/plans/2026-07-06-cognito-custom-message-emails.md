# Cognito CustomMessage Emails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Cognito `CustomMessage` Lambda that renders branded, Spanish auth emails (sign-up verification, resend code, password reset, admin invitation), reusing the existing `baseTemplate()` branding.

**Architecture:** Three pure template files added to the existing `src/modules/email/infrastructure/templates/` (single source of truth for branding), imported by a small Lambda handler in `lambdas/cognito-custom-message/`. The handler routes on `event.triggerSource` and sets `event.response.emailSubject`/`emailMessage`. Built with esbuild, deployed via a bash script matching the existing `infrastructure/scripts/*.sh` style.

**Tech Stack:** TypeScript, Node 22 (Lambda `nodejs22.x`), jest + ts-jest, esbuild, AWS CLI, Cognito CustomMessage Lambda trigger.

**Design spec:** [`docs/superpowers/specs/2026-07-06-cognito-custom-message-emails-design.md`](../specs/2026-07-06-cognito-custom-message-emails-design.md)

**Important context for the implementer:**
- The repo's jest config lives in `package.json` with `rootDir: "src"` and `testRegex: ".*\\.spec\\.ts$"`. Tests under `src/` are picked up by `pnpm test` automatically. The Lambda handler lives **outside** `src/` (`lambdas/`), so it gets its **own** jest config run via a separate script.
- Template files are **pure functions** (no NestJS). Cognito placeholders (`{####}` for the code/temp-password, `{username}` for the admin username) are embedded **literally** in the HTML; Cognito substitutes them after the Lambda returns. Templates must never require the real code value.
- Wiring the Lambda trigger is **independent of SES**: once wired, Cognito sends these Spanish emails immediately using its default sender (dev/sandbox limits apply). Pointing Cognito at SES (doc `14-email-ses-setup.md`) later only changes the transport, sender, and limits — not this code.

---

## Preamble: Create a working branch

- [ ] **Create the feature branch**

```bash
cd /Volumes/workspace/software-projects/personal/mekapal/mekapal-api
git checkout develop
git pull
git checkout -b feature/cognito-custom-message-emails
```

---

## Task 1: Tooling — esbuild, Lambda types, scripts, gitignore

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Modify: `.gitignore`

- [ ] **Step 1: Add dev dependencies**

Run:
```bash
pnpm add -D esbuild @types/aws-lambda
```

- [ ] **Step 2: Add build and test scripts to `package.json`**

In the `"scripts"` block, add these two entries (after `"test:e2e"`):

```json
"build:lambda:cognito": "esbuild lambdas/cognito-custom-message/handler.ts --bundle --platform=node --target=node22 --format=cjs --outfile=lambdas/cognito-custom-message/dist/index.js",
"test:lambda": "jest --config lambdas/cognito-custom-message/jest.config.js"
```

- [ ] **Step 3: Ignore the Lambda build output**

Append to `.gitignore`:

```
# Lambda build output
lambdas/*/dist/
```

- [ ] **Step 4: Verify tooling is installed**

Run: `pnpm exec esbuild --version`
Expected: prints a version number (e.g. `0.x.y`), exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "chore: add esbuild and aws-lambda tooling for cognito lambda"
```

---

## Task 2: Verification email template (sign-up + resend)

**Files:**
- Create: `src/modules/email/infrastructure/templates/cognito-verification.template.ts`
- Test: `src/modules/email/infrastructure/templates/cognito-verification.template.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/modules/email/infrastructure/templates/cognito-verification.template.spec.ts`:

```ts
import {
  cognitoVerificationSubject,
  cognitoVerificationTemplate,
} from './cognito-verification.template';

describe('cognitoVerificationTemplate', () => {
  it('returns the Spanish verification subject', () => {
    expect(cognitoVerificationSubject()).toBe('Verifica tu cuenta en Mekapal');
  });

  it('embeds the Cognito code placeholder and Mekapal branding', () => {
    const html = cognitoVerificationTemplate();
    expect(html).toContain('{####}');
    expect(html).toContain('Mekapal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/modules/email/infrastructure/templates/cognito-verification.template.spec.ts`
Expected: FAIL — cannot find module `./cognito-verification.template`.

- [ ] **Step 3: Write minimal implementation**

Create `src/modules/email/infrastructure/templates/cognito-verification.template.ts`:

```ts
import { baseTemplate } from './base.template';

export const cognitoVerificationSubject = (): string =>
  'Verifica tu cuenta en Mekapal';

export const cognitoVerificationTemplate = (): string => {
  const content = `
    <h2>Verifica tu cuenta</h2>
    <p>Usa este código para completar tu registro en Mekapal:</p>
    <div class="info-box" style="text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
      {####}
    </div>
    <p>El código vence en unos minutos. Si no creaste una cuenta, ignora este correo.</p>
  `;
  return baseTemplate(content);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/modules/email/infrastructure/templates/cognito-verification.template.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/email/infrastructure/templates/cognito-verification.template.ts src/modules/email/infrastructure/templates/cognito-verification.template.spec.ts
git commit -m "feat: add cognito verification email template"
```

---

## Task 3: Password reset email template

**Files:**
- Create: `src/modules/email/infrastructure/templates/cognito-password-reset.template.ts`
- Test: `src/modules/email/infrastructure/templates/cognito-password-reset.template.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/modules/email/infrastructure/templates/cognito-password-reset.template.spec.ts`:

```ts
import {
  cognitoPasswordResetSubject,
  cognitoPasswordResetTemplate,
} from './cognito-password-reset.template';

describe('cognitoPasswordResetTemplate', () => {
  it('returns the Spanish password reset subject', () => {
    expect(cognitoPasswordResetSubject()).toBe(
      'Restablece tu contraseña de Mekapal',
    );
  });

  it('embeds the Cognito code placeholder and Mekapal branding', () => {
    const html = cognitoPasswordResetTemplate();
    expect(html).toContain('{####}');
    expect(html).toContain('Mekapal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/modules/email/infrastructure/templates/cognito-password-reset.template.spec.ts`
Expected: FAIL — cannot find module `./cognito-password-reset.template`.

- [ ] **Step 3: Write minimal implementation**

Create `src/modules/email/infrastructure/templates/cognito-password-reset.template.ts`:

```ts
import { baseTemplate } from './base.template';

export const cognitoPasswordResetSubject = (): string =>
  'Restablece tu contraseña de Mekapal';

export const cognitoPasswordResetTemplate = (): string => {
  const content = `
    <h2>Restablece tu contraseña</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña. Usa este código:</p>
    <div class="info-box" style="text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
      {####}
    </div>
    <p>Si no solicitaste este cambio, ignora este correo; tu contraseña seguirá igual.</p>
  `;
  return baseTemplate(content);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/modules/email/infrastructure/templates/cognito-password-reset.template.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/email/infrastructure/templates/cognito-password-reset.template.ts src/modules/email/infrastructure/templates/cognito-password-reset.template.spec.ts
git commit -m "feat: add cognito password reset email template"
```

---

## Task 4: Admin invitation email template

**Files:**
- Create: `src/modules/email/infrastructure/templates/cognito-admin-invite.template.ts`
- Test: `src/modules/email/infrastructure/templates/cognito-admin-invite.template.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/modules/email/infrastructure/templates/cognito-admin-invite.template.spec.ts`:

```ts
import {
  cognitoAdminInviteSubject,
  cognitoAdminInviteTemplate,
} from './cognito-admin-invite.template';

describe('cognitoAdminInviteTemplate', () => {
  it('returns the Spanish admin invite subject', () => {
    expect(cognitoAdminInviteSubject()).toBe('Tu acceso al panel de Mekapal');
  });

  it('embeds the username and temporary password placeholders', () => {
    const html = cognitoAdminInviteTemplate();
    expect(html).toContain('{username}');
    expect(html).toContain('{####}');
    expect(html).toContain('Mekapal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/modules/email/infrastructure/templates/cognito-admin-invite.template.spec.ts`
Expected: FAIL — cannot find module `./cognito-admin-invite.template`.

- [ ] **Step 3: Write minimal implementation**

Create `src/modules/email/infrastructure/templates/cognito-admin-invite.template.ts`:

```ts
import { baseTemplate } from './base.template';

export const cognitoAdminInviteSubject = (): string =>
  'Tu acceso al panel de Mekapal';

export const cognitoAdminInviteTemplate = (): string => {
  const content = `
    <h2>Bienvenido a Mekapal</h2>
    <p>Se creó una cuenta para ti en el panel administrativo de Mekapal.</p>
    <div class="info-box">
      <p><strong>Usuario:</strong> {username}</p>
      <p><strong>Contraseña temporal:</strong> {####}</p>
    </div>
    <p>Inicia sesión y cambia tu contraseña en el primer acceso.</p>
  `;
  return baseTemplate(content);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/modules/email/infrastructure/templates/cognito-admin-invite.template.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/modules/email/infrastructure/templates/cognito-admin-invite.template.ts src/modules/email/infrastructure/templates/cognito-admin-invite.template.spec.ts
git commit -m "feat: add cognito admin invite email template"
```

---

## Task 5: Lambda handler + its jest config

**Files:**
- Create: `lambdas/cognito-custom-message/jest.config.js`
- Create: `lambdas/cognito-custom-message/handler.ts`
- Test: `lambdas/cognito-custom-message/handler.spec.ts`

- [ ] **Step 1: Create the Lambda jest config**

Create `lambdas/cognito-custom-message/jest.config.js` (reuses the root tsconfig so it can import template files from `src/`):

```js
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../../tsconfig.json' }],
  },
};
```

- [ ] **Step 2: Write the failing test**

Create `lambdas/cognito-custom-message/handler.spec.ts`:

```ts
import type { CustomMessageTriggerEvent } from 'aws-lambda';
import { handler } from './handler';

const buildEvent = (
  triggerSource: CustomMessageTriggerEvent['triggerSource'],
): CustomMessageTriggerEvent =>
  ({
    version: '1',
    region: 'us-east-1',
    userPoolId: 'us-east-1_test',
    userName: 'test-user',
    triggerSource,
    callerContext: { awsSdkVersion: '1', clientId: 'client' },
    request: {
      userAttributes: { email: 'test@example.com' },
      codeParameter: '{####}',
      usernameParameter: '{username}',
      linkParameter: '{##Click Here##}',
      clientMetadata: {},
    },
    response: { smsMessage: '', emailMessage: '', emailSubject: '' },
  }) as unknown as CustomMessageTriggerEvent;

describe('cognito custom message handler', () => {
  it('sets the Spanish verification email on sign-up', async () => {
    const result = await handler(buildEvent('CustomMessage_SignUp'));
    expect(result.response.emailSubject).toBe('Verifica tu cuenta en Mekapal');
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('reuses the verification email on resend', async () => {
    const result = await handler(buildEvent('CustomMessage_ResendCode'));
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('sets the password reset email on forgot password', async () => {
    const result = await handler(buildEvent('CustomMessage_ForgotPassword'));
    expect(result.response.emailSubject).toBe(
      'Restablece tu contraseña de Mekapal',
    );
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('sets the admin invite email with username and temp password', async () => {
    const result = await handler(buildEvent('CustomMessage_AdminCreateUser'));
    expect(result.response.emailMessage).toContain('{username}');
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('leaves the response untouched for unhandled triggers', async () => {
    const event = buildEvent('CustomMessage_Authentication');
    const result = await handler(event);
    expect(result.response.emailMessage).toBe('');
    expect(result.response.emailSubject).toBe('');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test:lambda`
Expected: FAIL — cannot find module `./handler`.

- [ ] **Step 4: Write minimal implementation**

Create `lambdas/cognito-custom-message/handler.ts`:

```ts
import type { CustomMessageTriggerEvent } from 'aws-lambda';
import {
  cognitoVerificationSubject,
  cognitoVerificationTemplate,
} from '../../src/modules/email/infrastructure/templates/cognito-verification.template';
import {
  cognitoPasswordResetSubject,
  cognitoPasswordResetTemplate,
} from '../../src/modules/email/infrastructure/templates/cognito-password-reset.template';
import {
  cognitoAdminInviteSubject,
  cognitoAdminInviteTemplate,
} from '../../src/modules/email/infrastructure/templates/cognito-admin-invite.template';

export const handler = async (
  event: CustomMessageTriggerEvent,
): Promise<CustomMessageTriggerEvent> => {
  switch (event.triggerSource) {
    case 'CustomMessage_SignUp':
    case 'CustomMessage_ResendCode':
      event.response.emailSubject = cognitoVerificationSubject();
      event.response.emailMessage = cognitoVerificationTemplate();
      break;
    case 'CustomMessage_ForgotPassword':
      event.response.emailSubject = cognitoPasswordResetSubject();
      event.response.emailMessage = cognitoPasswordResetTemplate();
      break;
    case 'CustomMessage_AdminCreateUser':
      event.response.emailSubject = cognitoAdminInviteSubject();
      event.response.emailMessage = cognitoAdminInviteTemplate();
      break;
    default:
      break;
  }
  return event;
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test:lambda`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add lambdas/cognito-custom-message/jest.config.js lambdas/cognito-custom-message/handler.ts lambdas/cognito-custom-message/handler.spec.ts
git commit -m "feat: add cognito custom message lambda handler"
```

---

## Task 6: Verify the esbuild bundle builds

**Files:** none created (build output is gitignored)

- [ ] **Step 1: Build the bundle**

Run: `pnpm build:lambda:cognito`
Expected: exit 0, creates `lambdas/cognito-custom-message/dist/index.js`.

- [ ] **Step 2: Verify the bundle exports a handler and inlines the templates**

Run:
```bash
node -e "const m = require('./lambdas/cognito-custom-message/dist/index.js'); if (typeof m.handler !== 'function') { throw new Error('handler not exported'); } console.log('handler OK');"
```
Expected: prints `handler OK`.

- [ ] **Step 3: Smoke-test the bundled handler end to end**

Run:
```bash
node -e "require('./lambdas/cognito-custom-message/dist/index.js').handler({ triggerSource: 'CustomMessage_SignUp', response: {} }).then(e => { if (!e.response.emailMessage.includes('{####}')) throw new Error('no code placeholder'); console.log('bundle smoke OK'); });"
```
Expected: prints `bundle smoke OK` (confirms templates were bundled in — no external imports at runtime).

- [ ] **Step 4: No commit**

Build output is gitignored; nothing to commit for this task.

---

## Task 7: Deployment script

> **Revised during execution:** the script was re-scoped to a **one-time bootstrap** (role + create-function + Cognito permission + trigger wiring), with an **environment-specific** function name (`mekapal-cognito-custom-message-<env>`). Recurring code deploys now run through **GitHub Actions** (reusable `_deploy-lambda.yml` invoked by path-filtered `deploy-lambda-dev.yml` / `deploy-lambda-prod.yml`), matching the app's deploy pattern instead of a manual script. See `docs/14-email-ses-setup.md` Step 5.

**Files:**
- Create: `infrastructure/scripts/07-cognito-lambda.sh`

- [ ] **Step 1: Create the deploy script**

Create `infrastructure/scripts/07-cognito-lambda.sh`:

```bash
#!/bin/bash

# =============================================================================
# Cognito CustomMessage Lambda — build, deploy, and wire the trigger
# =============================================================================
# Builds the esbuild bundle, creates/updates the Lambda, grants Cognito invoke
# permission, and attaches the CustomMessage trigger to the user pool.
#
# Requires USER_POOL_ID (exported, or produced by 05-cognito.sh into
# /tmp/cognito-<env>-config.txt).
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

FUNCTION_NAME="${APP_NAME}-cognito-custom-message"
ROLE_NAME="${FUNCTION_NAME}-role"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Resolve USER_POOL_ID
if [ -z "$USER_POOL_ID" ] && [ -f "/tmp/cognito-${ENVIRONMENT}-config.txt" ]; then
  source "/tmp/cognito-${ENVIRONMENT}-config.txt"
fi
if [ -z "$USER_POOL_ID" ]; then
  echo "❌ USER_POOL_ID not set. Export it or run 05-cognito.sh first."
  exit 1
fi

echo "🔨 Building Lambda bundle..."
( cd "$ROOT_DIR" && pnpm build:lambda:cognito )

DIST_DIR="$ROOT_DIR/lambdas/cognito-custom-message/dist"
( cd "$DIST_DIR" && rm -f function.zip && zip -j -q function.zip index.js )

# Ensure execution role
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "👤 Creating execution role $ROLE_NAME..."
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": { "Service": "lambda.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }]
    }' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "⏳ Waiting for role to propagate..."
  sleep 10
fi
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Create or update the function
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  echo "♻️  Updating function code..."
  aws lambda update-function-code --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$DIST_DIR/function.zip" --region "$AWS_REGION" >/dev/null
else
  echo "🆕 Creating function..."
  aws lambda create-function --function-name "$FUNCTION_NAME" \
    --runtime nodejs22.x --handler index.handler \
    --role "$ROLE_ARN" \
    --zip-file "fileb://$DIST_DIR/function.zip" \
    --region "$AWS_REGION" >/dev/null
fi

LAMBDA_ARN="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

# Grant Cognito permission to invoke (idempotent)
aws lambda add-permission --function-name "$FUNCTION_NAME" \
  --statement-id CognitoInvoke \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn "arn:aws:cognito-idp:${AWS_REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID}" \
  --region "$AWS_REGION" >/dev/null 2>&1 \
  && echo "🔓 Granted Cognito invoke permission." \
  || echo "🔓 Invoke permission already present, skipping."

# Wire the trigger.
# ⚠️ update-user-pool REPLACES the whole config — every parameter below must be
# re-passed or it reverts to defaults. When SES email is wired later
# (docs/14-email-ses-setup.md step 3), that update MUST also include this
# --lambda-config, and this call MUST include --email-configuration, or one
# will clobber the other.
echo "🔗 Attaching CustomMessage trigger to user pool $USER_POOL_ID..."
aws cognito-idp update-user-pool --user-pool-id "$USER_POOL_ID" --region "$AWS_REGION" \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true,"TemporaryPasswordValidityDays":7}}' \
  --auto-verified-attributes email \
  --account-recovery-setting '{"RecoveryMechanisms":[{"Priority":1,"Name":"verified_email"}]}' \
  --admin-create-user-config '{"AllowAdminCreateUserOnly":false}' \
  --lambda-config "{\"CustomMessage\":\"${LAMBDA_ARN}\"}"

echo ""
echo "✅ Done. Lambda ARN: $LAMBDA_ARN"
echo "   The pool now renders Spanish auth emails."
echo "   (Delivery still uses Cognito's default sender until SES is wired — see docs/14.)"
```

- [ ] **Step 2: Make it executable and lint-check syntax**

Run:
```bash
chmod +x infrastructure/scripts/07-cognito-lambda.sh
bash -n infrastructure/scripts/07-cognito-lambda.sh && echo "syntax OK"
```
Expected: prints `syntax OK` (no execution, just a syntax check — actual run is deferred; see note below).

- [ ] **Step 3: Commit**

```bash
git add infrastructure/scripts/07-cognito-lambda.sh
git commit -m "feat: add cognito custom message lambda deploy script"
```

> **Do not run the deploy script as part of this plan.** Running it mutates the live user pool (`update-user-pool`) and requires AWS credentials. It is run manually by the operator when ready. It does **not** depend on SES/DNS — once run, Spanish emails work immediately via Cognito's default sender.

---

## Task 8: Update the email/SES doc progress tracker

**Files:**
- Modify: `docs/14-email-ses-setup.md`

- [ ] **Step 1: Mark step 5 as built in the Progress Tracker**

In `docs/14-email-ses-setup.md`, under `## Progress Tracker`, replace the line:

```
- [ ] **5.** `CustomMessage` Lambda deployed + wired (branded Spanish emails)
```

with:

```
- [x] **5a.** `CustomMessage` Lambda built + unit-tested (`lambdas/cognito-custom-message/`, deploy via `infrastructure/scripts/07-cognito-lambda.sh`)
- [ ] **5b.** `CustomMessage` Lambda deployed + wired to the pool (run `07-cognito-lambda.sh`)
```

- [ ] **Step 2: Commit**

```bash
git add docs/14-email-ses-setup.md
git commit -m "docs: track cognito custom message lambda build in email setup"
```

---

## Final verification

- [ ] **Run the full test suite**

Run: `pnpm test`
Expected: PASS, including the 6 new template tests.

- [ ] **Run the Lambda test suite**

Run: `pnpm test:lambda`
Expected: PASS (5 tests).

- [ ] **Lint**

Run: `pnpm lint:check`
Expected: no errors in the new files.

---

## Self-review notes (author)

- **Spec coverage:** verification (Task 2), reset (Task 3), admin invite (Task 4), handler routing + safe fallback (Task 5), esbuild build (Tasks 1, 6), deploy/wiring incl. update-user-pool gotcha (Task 7), doc tracker (Task 8). MFA/attribute triggers intentionally fall through (covered by Task 5's fallback test).
- **Placeholders:** none — all code and commands are literal.
- **Type consistency:** template function names (`cognitoVerificationSubject/Template`, `cognitoPasswordResetSubject/Template`, `cognitoAdminInviteSubject/Template`) and `handler` signature are identical across the tests, the handler imports, and the build smoke-test.
