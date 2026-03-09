Start a new feature branch for: $ARGUMENTS

## Steps

1. **Verify clean state** — Run `git status` to ensure the working tree is clean. If there are uncommitted changes, warn and stop — do not proceed until changes are committed or stashed.

2. **Switch to develop** — Checkout the `develop` branch and pull latest:
   ```
   git checkout develop
   git pull origin develop
   ```

3. **Create feature branch** — Create and switch to the new branch:
   ```
   git checkout -b feature/$ARGUMENTS
   ```

4. **Confirm** — Display the current branch name and confirm the branch was created successfully.

5. **Wait** — Do NOT start coding. Wait for instructions on what to implement.

## Important

- Branch name format: `feature/<name>` where `<name>` comes from the argument.
- If `<name>` contains spaces, convert to kebab-case (e.g., "order tracking" → "order-tracking").
- Always branch from `develop`, never from `main` or another feature branch.
- If develop has unpulled changes, pull them first.
