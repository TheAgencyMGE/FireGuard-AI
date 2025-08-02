# Contributing to FireGuard AI

Thank you for your interest in contributing to FireGuard AI! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- Basic knowledge of TypeScript/React
- Understanding of wildfire monitoring concepts (helpful but not required)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/wildfire-sentinel.git
   cd wildfire-sentinel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Contribution Types

### 🐛 Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide browser/OS information
- Include relevant console errors

### ✨ Feature Requests
- Describe the problem you're solving
- Explain your proposed solution
- Consider backward compatibility
- Include mockups or examples if applicable

### 🔧 Code Contributions
- Follow the coding standards below
- Write tests for new functionality
- Update documentation as needed
- Ensure all checks pass

## 💻 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Follow the component structure:
  ```tsx
  // Imports
  import React from 'react';
  
  // Types/Interfaces
  interface ComponentProps {
    // ...
  }
  
  // Component
  export const Component: React.FC<ComponentProps> = ({ prop }) => {
    // Hooks
    // Event handlers
    // Render
  };
  ```

### File Organization
- Group related files in appropriate directories
- Use PascalCase for component files
- Use camelCase for utility files
- Keep files focused and single-purpose

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Ensure responsive design
- Test accessibility features

## 🧪 Testing

### Before Submitting
- Test your changes in multiple browsers
- Verify responsive design on different screen sizes
- Check that data fetching works correctly
- Ensure ML training functionality operates as expected

### Running Tests
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build production version
npm run build
```

## 📦 Pull Request Process

1. **Ensure your fork is up to date**
   ```bash
   git remote add upstream https://github.com/TheAgencyMGE/wildfire-sentinel.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a focused pull request**
   - One feature/fix per PR
   - Clear, descriptive title
   - Detailed description of changes
   - Reference related issues

3. **PR Requirements**
   - All checks must pass
   - Code review approval required
   - Documentation updated if needed
   - No merge conflicts

## 🎯 Areas for Contribution

### High Priority
- **Data Source Integration**: Adding new fire/weather APIs
- **ML Model Improvements**: Better prediction algorithms
- **Performance Optimization**: Faster data processing
- **Mobile Experience**: Enhanced mobile interface

### Medium Priority
- **Visualization Enhancements**: Better charts and maps
- **Alert System**: More notification options
- **Accessibility**: Screen reader support, keyboard navigation
- **Internationalization**: Multi-language support

### Good First Issues
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage improvements

## 🔍 Code Review Guidelines

### For Contributors
- Keep PRs small and focused
- Respond promptly to feedback
- Be open to suggestions and changes
- Test thoroughly before requesting review

### For Reviewers
- Be constructive and respectful
- Explain the reasoning behind feedback
- Approve when code meets standards
- Consider the contributor's learning experience

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Wildfire Data Sources
- [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/)
- [CAL FIRE](https://www.fire.ca.gov/)
- [InciWeb](https://inciweb.nwcg.gov/)
- [NOAA Fire Weather](https://www.spc.noaa.gov/products/fire_wx/)

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/TheAgencyMGE/wildfire-sentinel/discussions)
- Create an [Issue](https://github.com/TheAgencyMGE/wildfire-sentinel/issues) for bugs
- Email: support@theagencymge.com

## 🏆 Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes for significant contributions
- GitHub contributor statistics

Thank you for helping make wildfire monitoring more accessible and effective! 🔥🚁
