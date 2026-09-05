/* global URL, console, process */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const messages = {
  profile: 'Owner-approved profile content is required.',
  site: 'SITE_URL must be an owner-approved public HTTPS URL.',
  resume: 'An owner-provided public/resume.pdf is required.',
  invalidResume: 'public/resume.pdf must be a valid PDF.',
  encryptedResume: 'public/resume.pdf must not be password protected.',
};

export function assessPublicationReadiness({ profile, resume, siteUrl }) {
  const problems = [];

  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    problems.push(messages.profile);
  }

  try {
    const canonical = new URL(siteUrl);
    if (
      canonical.protocol !== 'https:' ||
      canonical.hostname === 'localhost' ||
      canonical.hostname === '127.0.0.1'
    ) {
      problems.push(messages.site);
    }
  } catch {
    problems.push(messages.site);
  }

  if (resume) {
    const source = resume.toString('latin1');
    if (!source.startsWith('%PDF-')) problems.push(messages.invalidResume);
    if (/\/Encrypt\b/.test(source)) problems.push(messages.encryptedResume);
  }

  return problems;
}

function readWorkspaceState(root) {
  const profile = JSON.parse(readFileSync(resolve(root, 'src/data/profile.json'), 'utf8'));
  const resumePath = resolve(root, 'public/resume.pdf');

  return {
    profile,
    resume: existsSync(resumePath) ? readFileSync(resumePath) : null,
    siteUrl: process.env.SITE_URL,
  };
}

function run() {
  const problems = assessPublicationReadiness(readWorkspaceState(process.cwd()));

  if (problems.length > 0) {
    console.error('Public deployment is blocked:');
    for (const problem of problems) console.error(`- ${problem}`);
    process.exitCode = 1;
    return;
  }

  console.log('Public deployment owner-content gate passed.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
