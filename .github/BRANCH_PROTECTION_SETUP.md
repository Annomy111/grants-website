# GitHub Branch Protection Setup Guide

## How to Configure Branch Protection

### 1. Navigate to Settings

Go to: https://github.com/Annomy111/grants-website/settings/branches

### 2. Add Rule for `main` Branch

Click "Add rule" and configure:

#### Branch name pattern: `main`

#### ✅ Protect matching branches

- [x] **Require a pull request before merging**

  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from CODEOWNERS
  - [x] Restrict who can dismiss pull request reviews

- [x] **Require status checks to pass before merging**

  - [x] Require branches to be up to date before merging
  - Status checks:
    - [x] lint-and-test (18.x)
    - [x] lint-and-test (20.x)
    - [x] code-quality

- [x] **Require conversation resolution before merging**

- [ ] **Require signed commits** (optional)

- [ ] **Require linear history** (optional)

- [x] **Include administrators**

- [ ] **Restrict who can push to matching branches** (optional)

  - If enabled, add yourself as allowed

- [x] **Allow force pushes** → Select "Specify who can force push" → Nobody

- [x] **Allow deletions** → Disabled

### 3. Add Rule for `develop` Branch

Click "Add rule" again:

#### Branch name pattern: `develop`

#### ✅ Protect matching branches

- [x] **Require a pull request before merging**

  - [x] Require approvals: 1
  - [ ] Dismiss stale pull request approvals
  - [ ] Require review from CODEOWNERS

- [x] **Require status checks to pass before merging**

  - [ ] Require branches to be up to date before merging
  - Status checks:
    - [x] lint-and-test (18.x)
    - [x] lint-and-test (20.x)

- [ ] **Require conversation resolution before merging**

- [ ] **Include administrators**

- [ ] **Allow force pushes** (keep flexibility for rebasing)

### 4. Configure Netlify Auto-Deploy

In Netlify Dashboard (app.netlify.com):

1. Go to Site settings → Build & deploy → Continuous Deployment
2. Configure:
   - **Production branch**: main
   - **Branch deploys**: develop
   - **Deploy Previews**: Automatically build deploy previews for all pull requests

### 5. Update Default Branch (Optional)

If you want `develop` as default for new PRs:

1. Settings → General → Default branch
2. Change from `main` to `develop`
3. Update

## Verification Checklist

After setup, verify:

- [ ] Cannot push directly to `main`
- [ ] Cannot push directly to `develop`
- [ ] PRs to `main` require approval
- [ ] PRs to `develop` require approval
- [ ] CI checks run on all PRs
- [ ] Netlify creates preview for PRs
- [ ] `develop` branch deploys to preview URL
- [ ] `main` branch deploys to production

## Team Communication

Announce to team:

```
🎉 New Branching Strategy Active!

- All features now go through develop branch
- Create features with: npm run branch:feature my-feature
- PRs require review before merging
- main branch is now protected (production only)

See BRANCHING_STRATEGY.md for details.
```

---

These settings ensure code quality while maintaining development velocity!
