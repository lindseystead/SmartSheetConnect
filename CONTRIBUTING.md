# Contributing to Lifesaver Technology Services

First off, thank you for considering contributing to this project! While this is primarily a portfolio project, contributions that improve code quality, documentation, or add valuable features are welcome.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and constructive environment.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** - Describe the issue concisely
- **Steps to reproduce** - Detailed steps to recreate the problem
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Environment** - OS, Node version, browser, etc.
- **Screenshots** - If applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear title** - Describe the enhancement
- **Provide detailed description** - Explain why this would be useful
- **Include examples** - Show how it would work
- **Consider alternatives** - What other solutions have you considered?

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/lindseystead/lifesaver-tech-intake.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add JSDoc comments to new functions
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run build   # Verify TypeScript compiles
   npm run dev     # Test in development
   ```

5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
   
   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe what your PR does
   - Reference any related issues
   - Explain why the change is valuable

## Development Guidelines

### Code Style

- **TypeScript** - Use TypeScript for all new code
- **Strict mode** - All code must pass TypeScript strict checks
- **ESLint** - Follow existing linting rules
- **Formatting** - Code should be clean and readable
- **Comments** - Use JSDoc for functions, inline comments for complex logic

### Architecture Principles

- **Separation of concerns** - Keep frontend, backend, and shared code separate
- **Type safety** - Use Zod schemas and TypeScript interfaces
- **Error handling** - Always handle errors gracefully
- **Security** - Never commit secrets, validate all inputs
- **Documentation** - Document complex logic and API endpoints

### File Organization

- **Client code** → `client/src/`
- **Server code** → `server/`
- **Shared types** → `shared/`
- **UI components** → `client/src/components/`
- **Utilities** → `client/src/lib/`

### Testing

While this project doesn't currently have automated tests, when contributing:

- Manually test all changes
- Verify TypeScript compilation (`npm run build`)
- Test in development mode (`npm run dev`)
- Check responsive design on mobile/tablet/desktop
- Verify error handling works correctly

## Project-Specific Guidelines

### Adding New API Endpoints

1. Define Zod schema in `shared/schema.ts`
2. Add endpoint handler in `server/routes.ts`
3. Implement business logic in `server/storage.ts`
4. Add JSDoc documentation
5. Update API documentation in README

### Adding New UI Components

1. Create component in `client/src/components/`
2. Use shadcn/ui base components when possible
3. Follow existing component patterns
4. Add proper TypeScript types
5. Ensure responsive design
6. Add `data-testid` attributes for testing

### Modifying Integrations

When changing Google Sheets, Email, or Slack integrations:

- Maintain backward compatibility
- Update environment variable documentation
- Test with and without credentials
- Ensure graceful fallbacks
- Update error messages

## Questions?

If you have questions or need clarification:

- Open an issue for discussion
- Email: info@lifesavertech.ca

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🙏
