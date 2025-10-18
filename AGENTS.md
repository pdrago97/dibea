# DIBEA Agent Guidelines

## Commands

- `npm run dev` - Start both backend/frontend dev servers
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run test` - Run all tests (Jest for unit, Playwright for e2e)
- `npm test -- path/to/file.test.ts` - Run single test file
- `npx playwright test tests/e2e/login.spec.ts` - Run single e2e test
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed database with demo data

## Code Style

- **TypeScript**: Strict mode, path aliases `@/*`, CommonJS (backend), ESNext (frontend)
- **Imports**: Absolute with `@/` aliases, external libs first, then internal
- **Naming**: camelCase (vars/functions), PascalCase (types), UPPER_SNAKE_CASE (constants)
- **Error Handling**: try-catch, `{success: false, message}` format, winston logging, Zod validation
- **React**: Functional components, hooks, Tailwind + cn() utility, Radix UI patterns
- **Backend**: Prisma ORM, REST API, env vars, auth middleware
- **Testing**: Jest for unit tests, Playwright for e2e, test files end with `.test.ts` or `.spec.ts`
