# SupportSense Web

TypeScript and React dashboard for the SupportSense ticket-triage API. The app uses realistic deterministic demo data when `NEXT_PUBLIC_API_BASE_URL` is unavailable, so presentations remain interactive and reliable.

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to the Rails API origin. Search, severity filtering, ticket ingestion, known-issue matching, Jira-task simulation, and resolution work in demo mode.

## Test

```bash
npm test
```

The test command builds the production application and verifies filtering, deterministic enrichment, known-issue matching, and no-match behavior.

## Stack

React 19, TypeScript, Vinext/Next-compatible routing, Tailwind CSS, Radix UI primitives, and Lucide icons.
