# DIBEA Agent Guidelines

## Commands

- `npm run dev` - Start both backend/frontend dev servers
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run test` - Run all tests
- `npm test -- path/to/file.test.ts` - Run single test file

## Code Style

- **TypeScript**: Strict mode, path aliases `@/*`, CommonJS (backend), ESNext (frontend)
- **Imports**: Absolute with `@/` aliases, external libs first, then internal
- **Naming**: camelCase (vars/functions), PascalCase (types), UPPER_SNAKE_CASE (constants)
- **Error Handling**: try-catch, `{success: false, message}` format, winston logging, Zod validation
- **React**: Functional components, hooks, Tailwind + cn() utility, Radix UI patterns
- **Backend**: Prisma ORM, REST API, env vars, auth middleware
