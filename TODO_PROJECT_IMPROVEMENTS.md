# TODO: Project Improvements Checklist

## 🔴 Immediate Actions (Do Now)

### 1. Clean Up Root Directory

- [ ] Run `./scripts/cleanup-project.sh` to archive clutter
- [ ] Delete unnecessary screenshots and reports after archiving
- [ ] Remove temp directories

### 2. Fix Git Issues

- [ ] Add all new configuration files
- [ ] Commit project structure improvements
- [ ] Consider using Git LFS for video files

### 3. Consolidate Scripts

**Keep these scripts only:**

- `database-verification-agents.js` (latest)
- `fix-remaining-database-issues.js` (latest)
- `import-grants.js`
- `setup-admin-users.js`
- `create-ukraine-civil-society-post.js`

**Archive/Delete the rest** (15+ duplicate logo scripts, multiple database cleanup versions)

## 🟡 Short-term Improvements (This Week)

### 1. Decide on Backend Architecture

**Current situation**: You have BOTH:

- Express server in `/server`
- Netlify Functions in `/client/netlify/functions`

**Recommendation**: Pick ONE

- If Netlify Functions → Delete `/server` directory
- If Express → Move out of Netlify, use proper hosting

### 2. Set Up Development Standards

- [ ] Install Prettier: `npm install --save-dev prettier`
- [ ] Install ESLint: `npm install --save-dev eslint`
- [ ] Run initial format: `npx prettier --write .`

### 3. Create Proper Test Structure

```bash
mkdir -p tests/unit tests/integration tests/e2e
# Move existing tests to appropriate folders
```

### 4. Documentation Updates

- [ ] Update README.md with new project structure
- [ ] Document all environment variables
- [ ] Create deployment checklist

## 🟢 Medium-term Improvements (Next Month)

### 1. Add TypeScript

- Start with type definitions
- Gradually migrate components
- Add proper interfaces for API responses

### 2. Implement CI/CD

- GitHub Actions are configured, need to fix tests
- Add Netlify preview deployments
- Add automated dependency updates

### 3. Performance Optimizations

- Lazy load grant cards
- Optimize bundle size
- Add service worker for offline support

### 4. Security Enhancements

- Move API keys to secure backend
- Add rate limiting
- Implement proper CORS

## 📊 Project Structure Goals

### From This (Current):

```
grants-website/
├── 50+ files in root (messy!)
├── client/ (React app)
├── server/ (Express - redundant?)
├── scripts/ (40+ scripts, many duplicates)
├── temp-*/ (temporary directories)
└── *.png, *.json (scattered files)
```

### To This (Target):

```
grants-website/
├── .github/ (CI/CD, templates)
├── client/ (React + Netlify Functions)
├── scripts/
│   ├── database/ (3-4 scripts)
│   ├── deployment/ (2-3 scripts)
│   └── README.md
├── docs/ (all documentation)
├── tests/ (organized tests)
└── archived/ (temporary storage)
```

## 🎯 Success Metrics

1. **Clean Structure**

   - Root directory has <10 files
   - Scripts reduced from 40+ to ~10
   - Clear separation of concerns

2. **Developer Experience**

   - New developer setup <10 minutes
   - All commands documented
   - Consistent code style

3. **Code Quality**

   - ESLint configured and passing
   - Prettier formatting applied
   - Tests running in CI

4. **Documentation**
   - README up to date
   - CONTRIBUTING.md helpful
   - All env vars documented

## 🚀 Quick Wins (Do These First!)

1. **Run cleanup script**: `./scripts/cleanup-project.sh`
2. **Delete `/server` directory** (if not using Express)
3. **Archive old reports**: `rm -rf archived/reports/*.json`
4. **Commit improvements**: All new config files
5. **Update README**: Reflect new structure

## ⚠️ Risks to Address

1. **Hardcoded API Keys**: Still in codebase!
2. **No backup strategy**: Database has no automated backups
3. **No monitoring**: No error tracking or analytics
4. **Mixed architectures**: Express + Netlify Functions confusion

---

**Next Step**: Start with the cleanup script and commit the improved structure!
