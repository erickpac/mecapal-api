Create a pull request for the current branch targeting develop.

## Steps

1. **Analyze branch changes** — Run the following to understand all changes:
   ```
   git log develop..HEAD --oneline
   git diff develop...HEAD --stat
   git diff develop...HEAD
   ```
   Understand every change that will be included in the PR.

2. **Push branch to remote** — Push the current branch:
   ```
   git push -u origin <current-branch-name>
   ```

3. **Create the PR** — Use `gh pr create` targeting `develop` with the project's PR template format:

   ```
   gh pr create --base develop --title "<title under 70 chars>" --body "$(cat <<'EOF'
   ## Description

   - **What is the purpose of this pull request?** <summary>
   - **What changes have been made?** <list of changes>
   - **What issue does this fix?** <link or N/A>

   ## Type of Changes

   - [ ] Bug fix (non-breaking change which fixes an issue)
   - [ ] New feature (non-breaking change which adds functionality)
   - [ ] Breaking change (fix or feature that would cause existing functionality to change)
   - [ ] Code refactor or improvement
   - [ ] Test enhancement
   - [ ] Documentation update

   ## Checklist

   - [x] Code compiles and runs correctly
   - [x] Linting and formatting rules have been followed
   - [ ] Corresponding tests have been added and/or updated
   - [ ] Documentation has been updated (if applicable)
   - [x] The PR title is clear and uses proper formatting
   - [x] Commits are clean, with descriptive messages

   ## How Has This Been Tested?

   <describe testing approach>

   ## Further Comments

   <any additional context>
   EOF
   )"
   ```

4. **Return the PR URL** — Display the URL of the created PR.

## Important

- PR title must be under 70 characters.
- Check the appropriate "Type of Changes" boxes based on actual changes.
- Fill in the checklist honestly based on what was actually done.
- Mark test checkboxes only if tests were actually added/updated.
- Describe testing approach clearly.
