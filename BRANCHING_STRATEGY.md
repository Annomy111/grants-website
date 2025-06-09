# Branching Strategy for Ukraine Civil Society Grants Platform

## Branch Structure

### 🔒 `main` (Protected)
- **Purpose**: Production-ready code
- **Deploys to**: Netlify production (civil-society-grants-database.netlify.app)
- **Merge via**: Pull requests only
- **Requirements**: 
  - All CI checks must pass
  - Code review required
  - No direct commits

### 🚀 `develop` (Integration)
- **Purpose**: Integration branch for features
- **Deploys to**: Netlify preview (auto-deployed on PRs)
- **Merge via**: Pull requests from feature branches
- **Used for**: Testing feature integration before production

### 🌟 Feature Branches
- **Naming**: `feature/description-of-feature`
- **Created from**: `develop`
- **Merged to**: `develop`
- **Examples**:
  - `feature/add-grant-filtering`
  - `feature/improve-search`
  - `feature/ukrainian-translations`

### 🐛 Bugfix Branches
- **Naming**: `bugfix/description-of-bug`
- **Created from**: `develop` (or `main` for hotfixes)
- **Merged to**: `develop` (or `main` for hotfixes)
- **Examples**:
  - `bugfix/fix-login-error`
  - `bugfix/grant-display-issue`

### 🚨 Hotfix Branches
- **Naming**: `hotfix/description-of-fix`
- **Created from**: `main`
- **Merged to**: Both `main` AND `develop`
- **Used for**: Critical production bugs only

## Workflow

### 1. Regular Feature Development
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature

# Work on feature
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/my-new-feature
# Create PR on GitHub: feature/my-new-feature → develop
```

### 2. Release to Production
```bash
# When develop is ready for production
git checkout develop
git pull origin develop

# Create PR from develop to main
# On GitHub: Create PR develop → main
# After review and approval, merge
```

### 3. Emergency Hotfix
```bash
# Start from main
git checkout main
git pull origin main

# Create hotfix
git checkout -b hotfix/critical-bug

# Fix the bug
git add .
git commit -m "fix: resolve critical bug"

# Push and create PRs
git push -u origin hotfix/critical-bug
# Create 2 PRs: hotfix → main AND hotfix → develop
```

## GitHub Settings to Configure

### 1. Branch Protection Rules for `main`
- ✅ Require pull request reviews before merging
- ✅ Dismiss stale pull request approvals
- ✅ Require status checks to pass (CI)
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict who can push to matching branches

### 2. Branch Protection Rules for `develop`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass (CI)
- ⬜ Allow force pushes (optional, for rebasing)

### 3. Netlify Deploy Contexts
Configure in Netlify dashboard:
- **Production branch**: `main`
- **Branch deploys**: `develop`
- **Deploy previews**: All pull requests

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

Examples:
```
feat: add grant deadline notifications
fix: resolve login timeout issue
docs: update API documentation
chore: update dependencies
```

## Pull Request Template

Already configured in `.github/PULL_REQUEST_TEMPLATE.md`

## Benefits

1. **Clear Separation**: Production (`main`) vs Development (`develop`)
2. **Safe Deployments**: All changes tested in `develop` first
3. **Feature Isolation**: Each feature in its own branch
4. **Emergency Path**: Hotfixes can bypass `develop` when needed
5. **Automatic Previews**: Netlify deploys previews for all PRs

## Current Status

✅ Branches created:
- `main` (existing)
- `develop` (newly created)

⚠️ Next steps:
1. Configure branch protection rules on GitHub
2. Update Netlify deploy settings
3. Team training on new workflow

---

This strategy balances safety with development speed, perfect for a small team!