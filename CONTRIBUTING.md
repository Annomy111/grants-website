# Contributing to Ukraine Civil Society Grants Platform

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Annomy111/grants-website/issues)
2. If not, create a new issue using the bug report template
3. Include as much detail as possible

### Suggesting Features

1. Check existing issues and discussions
2. Create a feature request using the template
3. Explain the use case and benefits

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up your development environment**

   ```bash
   npm install
   cd client && npm install
   cp .env.example .env
   ```

4. **Make your changes**

   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

5. **Test your changes**

   ```bash
   npm test
   cd client && npm test
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):

   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance tasks

7. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Use the PR template
   - Link related issues
   - Ensure CI checks pass

## Development Guidelines

### Code Style

- Use Prettier for formatting (config provided)
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types or TypeScript interfaces
- Extract reusable logic into custom hooks

### Database Changes

- Create migrations for schema changes
- Test migrations up and down
- Document any new tables or columns

### API Development

- Follow RESTful principles
- Add proper error handling
- Validate input data
- Document endpoints

## Testing

- Write unit tests for utilities
- Add integration tests for API endpoints
- Test React components with React Testing Library
- Aim for >70% code coverage

## Documentation

- Update README.md for significant changes
- Document new environment variables
- Add JSDoc comments for functions
- Update API documentation

## Accessibility Checklist

When contributing to this project, please ensure your changes meet these accessibility standards:

### General Requirements
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible and clear
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient color contrast (WCAG AA standard)
- [ ] Page is usable when zoomed to 200%

### HTML & ARIA
- [ ] Semantic HTML elements used appropriately
- [ ] Form inputs have associated labels
- [ ] Images have descriptive alt text
- [ ] ARIA labels added where needed
- [ ] ARIA roles used correctly
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)

### Interactive Elements
- [ ] Buttons have descriptive text or aria-label
- [ ] Links have meaningful text (avoid "click here")
- [ ] Form errors are announced to screen readers
- [ ] Loading states are communicated
- [ ] Modal dialogs trap focus appropriately
- [ ] Skip navigation links available

### Testing
- [ ] Test with keyboard navigation only
- [ ] Test with screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] Test with browser zoom at 200%
- [ ] Run automated accessibility tests (axe DevTools)
- [ ] Check color contrast ratios
- [ ] Test with prefers-reduced-motion enabled

### Component-Specific Guidelines

#### For Grant Cards
- Use `<article>` element with descriptive aria-label
- Ensure expand/collapse buttons have aria-expanded
- Add aria-live regions for dynamic content

#### For Forms
- Group related fields with fieldset/legend
- Provide clear error messages
- Mark required fields appropriately
- Ensure tab order is logical

#### For Modals
- Use AccessibleModal component
- Ensure ESC key closes modal
- Return focus to trigger element on close
- Add appropriate ARIA attributes

### Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)

## Review Process

1. All PRs require at least one review
2. CI checks must pass
3. No merge conflicts
4. Documentation updated
5. Tests included
6. Accessibility checklist completed

## Release Process

1. Merge to `develop` branch first
2. Test on staging environment
3. Create release PR to `main`
4. Tag release with semantic version

## Getting Help

- Join discussions in GitHub Issues
- Check existing documentation
- Ask questions in PR comments

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to make grants more accessible to Ukrainian civil society! 🇺🇦
