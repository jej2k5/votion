# Contributing to Votion

Thank you for considering contributing to Votion!

## How to Contribute

### Reporting Bugs
- Use GitHub issues
- Include detailed steps to reproduce
- Provide environment details

### Suggesting Features
- Use GitHub issues with "enhancement" label
- Describe the use case
- Explain why it would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write/update tests
5. Ensure tests pass: `npm run test`
6. Commit: `git commit -m "feat: add amazing feature"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

### Commit Messages

Follow Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Write meaningful variable names
- Use async/await over promises

### Testing

- Write tests for new features
- Ensure >70% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/votion.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development
docker-compose up -d postgres redis
cd backend && npm run dev
```

## Questions?

Open an issue with "question" label.
