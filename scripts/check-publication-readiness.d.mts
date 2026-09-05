export interface PublicationReadinessInput {
  profile: unknown;
  resume: Buffer | null;
  siteUrl: string | undefined;
}

export function assessPublicationReadiness(input: PublicationReadinessInput): string[];
