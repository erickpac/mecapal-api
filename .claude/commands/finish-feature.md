Finish the current feature branch and squash merge it into develop.

## Steps

1. **Check git status and diff** — Run `git status` and `git diff` to identify any pending uncommitted changes.

2. **Commit uncommitted changes** — If there are uncommitted changes, stage and commit them following project conventions:
   - Commit message format: `type: description` (e.g., `feat: add order tracking endpoint`)
   - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
   - Do NOT add `Co-Authored-By` lines

3. **Review branch changes vs develop** — Run `git diff develop...HEAD` to review all changes introduced by this branch. Check if any of the following warrant documentation updates:
   - New modules or architectural changes → update CLAUDE.md file structure section
   - New dependencies added → update CLAUDE.md tech stack
   - New commands or workflow changes → update CLAUDE.md commands section
   - New API endpoints or features → update README.md if significant
   - Apply documentation updates if needed.

4. **Squash merge to develop** — Execute:
   ```
   git checkout develop
   git merge --squash <current-branch-name>
   git commit -m "type: description of the feature"
   ```
   Use a commit message that summarizes all the work done in the branch.

5. **Do NOT push** — Do not push to remote or delete the feature branch unless explicitly asked.

## Important

- Identify the current branch name before starting (store it for the merge step).
- If the working tree is dirty, commit changes before switching branches.
- The squash commit message should be concise but descriptive of the entire feature.
- Follow the project's commit message format: `type: description`.
