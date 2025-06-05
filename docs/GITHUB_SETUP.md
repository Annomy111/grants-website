# GitHub Repository Setup Guide

Follow these steps to push your code to GitHub and enable automatic deployment.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Configure your repository:
   - **Repository name**: `grants-website`
   - **Description**: "Civil Society Grants Database - Multilingual grant discovery platform"
   - **Public** or **Private**: Your choice
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Users/winzendwyers/grants website"

# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/grants-website.git

# Verify the remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

If you get an authentication error, you may need to:
1. Create a Personal Access Token: https://github.com/settings/tokens
2. Use the token as your password when prompted

## Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files including:
   - `/client` - React application
   - `/docs` - Documentation
   - `/scripts` - Utility scripts
   - `/supabase` - Database migrations
   - `README.md` - Project documentation

## Step 4: Enable GitHub Actions (Optional)

For automated testing and deployment checks:

1. Go to repository **Settings** > **Actions** > **General**
2. Select **Allow all actions and reusable workflows**
3. Click **Save**

## Step 5: Set Up Branch Protection (Recommended)

To prevent accidental pushes to main:

1. Go to **Settings** > **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Check:
   - Require pull request reviews before merging
   - Dismiss stale pull request approvals
   - Require status checks to pass
5. Click **Create**

## Next Steps

Once your code is on GitHub:

1. **Connect to Netlify**: Follow the deployment guide in `/docs/DEPLOYMENT.md`
2. **Set up Supabase**: Configure your database
3. **Configure secrets**: Never commit sensitive data

## Troubleshooting

### Authentication Issues

If you can't push to GitHub:

```bash
# Set up credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# For HTTPS (recommended)
# Create a Personal Access Token at https://github.com/settings/tokens
# Use it as your password when prompted

# For SSH (alternative)
# Follow: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### Large File Issues

If you get errors about large files:

```bash
# Check for large files
find . -type f -size +100M

# Remove them from git history if needed
git filter-branch --tree-filter 'rm -f path/to/large/file' HEAD
```

### Permission Denied

If you get permission denied:

```bash
# Check your remote URL
git remote -v

# Update to use HTTPS if using SSH without keys
git remote set-url origin https://github.com/YOUR_USERNAME/grants-website.git
```

## Security Reminders

- Never commit `.env` files with real credentials
- Use `.gitignore` to exclude sensitive files
- Store secrets in Netlify/Supabase dashboards
- Review commits before pushing

---

After completing these steps, your code will be on GitHub and ready for automated deployment!