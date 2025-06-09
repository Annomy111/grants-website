# Project Improvement Plan - Ukraine Civil Society Grants Platform

## Executive Summary

This document outlines a comprehensive plan to improve the project structure, development workflow, and maintainability of the grants website.

## Current State Assessment

### ✅ Strengths

- Clear separation between frontend (React/Netlify) and backend (Supabase)
- Well-documented README and project instructions
- Good component organization
- Functional deployment pipeline

### ❌ Issues to Address

1. **Root directory clutter**: 53+ temporary files
2. **Redundant scripts**: 40+ scripts with duplicates
3. **No CI/CD pipeline**: Missing automated testing and checks
4. **No code standards**: Missing linting, formatting configs
5. **Mixed backend concerns**: Both Express server and Netlify Functions
6. **No proper testing structure**: Tests scattered across project

## Phase 1: Immediate Cleanup (Week 1)

### 1.1 Directory Cleanup

```bash
# Create archive structure
mkdir -p archived/screenshots archived/reports archived/legacy-scripts

# Move temporary files
mv *.png *.jpg archived/screenshots/
mv *-report*.json *-log*.json archived/reports/
mv temp-* archived/

# Remove duplicate scripts
# Keep only the latest versions of:
# - database-verification-agents.js
# - fix-remaining-database-issues.js
```

### 1.2 Scripts Reorganization

```
scripts/
├── README.md              # Document all scripts
├── database/
│   ├── verify.js         # Consolidated verification
│   ├── migrate.js        # Migration runner
│   └── seed.js           # Seed data
├── deployment/
│   ├── pre-deploy.js     # Pre-deployment checks
│   └── post-deploy.js    # Post-deployment tasks
└── maintenance/
    ├── cleanup.js        # Cleanup tasks
    └── backup.js         # Backup procedures
```

### 1.3 Git Cleanup

```bash
# Add to .gitignore
echo "archived/" >> .gitignore
echo "*.log" >> .gitignore
echo "temp-*/" >> .gitignore
echo "*-report-*.json" >> .gitignore

# Create .gitattributes for large files
echo "*.mp4 filter=lfs diff=lfs merge=lfs -text" > .gitattributes
echo "*.png filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
```

## Phase 2: Development Workflow (Week 2)

### 2.1 Add Code Quality Tools

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

```json
// .eslintrc.json
{
  "extends": ["react-app", "prettier"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

### 2.2 Pre-commit Hooks

```json
// package.json additions
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 2.3 GitHub Workflows

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run build
```

## Phase 3: Architecture Improvements (Week 3-4)

### 3.1 Choose Single Backend Strategy

**Recommendation**: Fully migrate to Netlify Functions

- Remove `server/` directory
- Consolidate all API logic in `client/netlify/functions/`
- Update documentation

### 3.2 Add TypeScript

```bash
# Progressive migration
npm install --save-dev typescript @types/react @types/node
npx tsc --init

# Start with type definitions
types/
├── api.ts          # API response types
├── database.ts     # Database schema types
└── components.ts   # Component prop types
```

### 3.3 Testing Structure

```
tests/
├── unit/
│   ├── components/   # Component tests
│   └── utils/        # Utility tests
├── integration/
│   └── api/          # API integration tests
└── e2e/
    └── flows/        # End-to-end user flows
```

## Phase 4: Documentation & Processes (Week 5)

### 4.1 Enhanced Documentation

```
docs/
├── CONTRIBUTING.md       # Contribution guidelines
├── CHANGELOG.md          # Version history
├── SECURITY.md           # Security policies
├── architecture/
│   ├── decisions/        # ADRs
│   └── diagrams/         # System diagrams
└── guides/
    ├── deployment.md     # Deployment guide
    └── development.md    # Dev setup guide
```

### 4.2 GitHub Templates

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── config.yml
├── PULL_REQUEST_TEMPLATE.md
└── workflows/
    ├── ci.yml
    ├── deploy.yml
    └── security.yml
```

## Phase 5: Performance & Monitoring (Week 6)

### 5.1 Performance Optimization

- Implement lazy loading for grant cards
- Add service worker for offline support
- Optimize bundle size with code splitting
- Add performance budgets

### 5.2 Monitoring Setup

- Add Sentry for error tracking
- Implement Google Analytics 4
- Add performance monitoring
- Create health check endpoints

## Branch Strategy Recommendation

### GitFlow Lite

```
main (production)
├── develop (staging)
├── feature/* (new features)
├── hotfix/* (urgent fixes)
└── release/* (release prep)
```

### Branch Protection Rules

- Require PR reviews for main
- Require status checks to pass
- Require branches to be up to date
- Include administrators in restrictions

## Success Metrics

1. **Code Quality**

   - 0 ESLint errors
   - 100% Prettier formatted
   - TypeScript coverage > 50%

2. **Performance**

   - Lighthouse score > 90
   - Bundle size < 500KB
   - First contentful paint < 2s

3. **Developer Experience**

   - Setup time < 10 minutes
   - Build time < 2 minutes
   - Clear documentation

4. **Maintenance**
   - Automated dependency updates
   - Regular security audits
   - Documented procedures

## Timeline

- **Week 1**: Complete Phase 1 (Cleanup)
- **Week 2**: Complete Phase 2 (Workflow)
- **Week 3-4**: Complete Phase 3 (Architecture)
- **Week 5**: Complete Phase 4 (Documentation)
- **Week 6**: Complete Phase 5 (Performance)
- **Ongoing**: Maintain and iterate

## Next Steps

1. Review and approve this plan
2. Create tracking issues for each phase
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

---

Last Updated: 2025-06-09
Status: DRAFT - Awaiting Approval
