---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(gh run:*), Bash(sleep:*), Bash(npm test:*), Bash(npm run test:*), Read, Edit, Grep, Glob, AskUserQuestion
argument-hint: <commit message>
description: Stage, commit and push all changes to GitHub following CLAUDE.md rules
---

# Deploy to GitHub

## Current Status
- Branch: !`git branch --show-current`
- Status: !`git status --short`

## Task
Commit message: $ARGUMENTS

## Workflow (seguindo CLAUDE.md)

### Step 0: Verify
Verificar o trabalho antes de prosseguir:
1. Run `git diff` to see all changes made in this session
2. Read each modified file and review the changes
3. Check for:
   - **Code Quality**: Clean, readable code following project conventions
   - **Efficiency**: No unnecessary complexity or redundant code
   - **Security**: No vulnerabilities (XSS, injection, exposed secrets)
   - **Best Practices**: Proper error handling, type safety
4. Report any issues found with specific file:line references
5. If issues found, ask user: "Problemas encontrados. Deseja corrigir antes de continuar?"
6. Fix issues if user approves, then continue

### Step 1: Evaluate Tests
Avaliar necessidade de testes para as mudanças:
1. Analyze the changes from `git diff`
2. Check if changes affect:
   - **Frontend components** → Check if tests exist in `frontend/src/__tests__/`
   - **Backend endpoints** → Check if tests exist in `backend/tests/`
   - **New features** → Likely need new tests
   - **Bug fixes** → May need regression tests
3. Search for existing tests related to modified files
4. Report findings:
   - List files that may need new/updated tests
   - If tests needed, ask user: "Testes recomendados. Deseja criar/atualizar antes de continuar?"
5. If user approves, create/update tests
6. If tests exist, optionally run them with `npm test` (frontend) or `pytest` (backend)

### Step 2: Review Changes
1. Run `git status` to show all changes
2. Run `git diff` to show what changed

### Step 3: Update Version
1. Read `frontend/src/App.tsx` and find current version in footer (line ~698)
2. Increment version: patch (x.x.+1) for fix, minor (x.+1.0) for feat
3. Edit App.tsx to update the version

### Step 4: Ask User Approval for Commit
Use AskUserQuestion: "Aprovar commit com as mudanças acima?"

### Step 5: Commit (only if approved)
1. Stage all changes: `git add .`
2. Commit with format: "type: message (vX.X.X)"
3. Add Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

### Step 6: Ask User Approval for Push
Use AskUserQuestion: "Aprovar push para o remote?"

### Step 7: Push (only if approved)
1. Push to remote: `git push`
2. Show confirmation: `git log --oneline -3`

### Step 8: Verify CI/CD
1. Run `gh run list --repo EngenhariaBucarId/HTML-to-PDF-Antigravity --limit 2` to check build status
2. If status is "in_progress", wait 60 seconds and check again
3. Repeat until build completes (max 5 minutes)
4. Report final status:
   - If "success": Continue to Step 9
   - If "failure": Show error and ask user if they want to check logs with `gh run view`

### Step 9: Ask About Server Restart
Use AskUserQuestion: "Deseja reiniciar o servidor?"
