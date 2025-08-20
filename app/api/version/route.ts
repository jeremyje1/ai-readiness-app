import { NextResponse } from 'next/server';
import pkg from '../../../package.json';

// Build/version introspection endpoint.
// Verify deployment by comparing commit SHA to latest in GitHub.
export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'unknown';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'unknown';
  const repo = process.env.VERCEL_GIT_REPO_SLUG || 'unknown';
  return NextResponse.json({
    service: 'ai-readiness-app',
    version: (pkg as any).version || '0.0.0',
    commit: sha,
    branch,
    repo,
    deployedAt: new Date().toISOString()
  });
}

export async function POST() { return GET(); }
