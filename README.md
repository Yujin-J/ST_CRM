# ST_CRM Project

A CRM application built with Refine, Ant Design, and React.

## Prerequisites

- Node.js (as specified in package.json)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd ST_CRM
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` by default.

## Authentication

The application includes authentication with:

- Email/Password login
- Google OAuth
- GitHub OAuth

Default demo credentials:

- Email: demo@refine.dev
- Password: demodemo

## Features

- Dashboard with analytics
- Post management (List, Edit, Show)
- Authentication and authorization
- Theming with Ant Design
- Responsive layout

## Tech Stack

- [Refine](https://refine.dev/) - React-based framework
- [Ant Design](https://ant.design/) - UI components
- [React Router](https://reactrouter.com/) - Routing
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool

## Project Structure

```
src/
├── App.tsx        # Main application component
├── pages/         # Page components
│   ├── dashboard/
│   └── posts/
└── index.tsx      # Application entry point
```

## API Configuration

The application uses a REST API at `https://api.fake-rest.refine.dev`. To change the API endpoint, update the `API_URL` constant in `src/App.tsx`.

## Git Branch Guidelines

### Branch Naming Convention

```
<type>/<ticket_id>(-optional-description)
```

### Types (Same as commit types)

- `feat`: Feature branches
- `fix`: Bug fix branches
- `docs`: Documentation changes
- `style`: Style/formatting changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks (can not have a ticket ID)
- `perf`: Performance improvements (can not have a ticket ID)

### Examples

```
feat/ERP-1
fix/ERP-2
docs/ERP-3
refactor/ERP-4
test/ERP-5
chore/update-dependencies
```

## Git Commit Guidelines

### Commit Message Format

```
<type>: [<user_story_id/task_id>] <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `perf`: A code change that improves performance

### Subject Rules

1. Use imperative, present tense: "change" not "changed" nor "changes"
2. Don't capitalize the first letter
3. No dot (.) at the end
4. Maximum 50 characters

### Examples

```
feat: [ERP-1] add search by email functionality
fix: [ERP-2] resolve Google OAuth redirect issue
docs: [ERP-3] update installation instructions
style: [ERP-4] format customer list component
refactor: [ERP-5] simplify error handling logic
test: [ERP-6] add unit tests for customer creation
chore: update React dependencies
perf: optimize customer search query
```

### Body Rules (Optional)

- Use imperative, present tense
- Include motivation for the change
- Contrast this with previous behavior
- Wrap at 72 characters

### Footer Rules (Optional)

- Reference issues and pull requests
- Note breaking changes
- Format for breaking changes: BREAKING CHANGE: <description>

### Examples with Body and Footer

```
feat: [ERP-1] implement customer deletion

- Add confirmation dialog before deletion
- Include cascade deletion of related records
- Add activity logging for deletion events

Closes #123
BREAKING CHANGE: Customer deletion now requires admin role
```

### Do's and Don'ts

✅ Do:

- Keep commits atomic (one logical change per commit)
- Write meaningful commit messages
- Use the type and scope consistently
- Reference issues in the footer

❌ Don't:

- Mix multiple unrelated changes in one commit
- Write vague messages like "fix stuff"
- Forget to specify the type
- Exceed character limits
