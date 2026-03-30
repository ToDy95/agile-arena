const JIRA_BROWSE_REGEX = /\/browse\/([A-Z][A-Z0-9]+-\d+)(?:[/?#]|$)/i;
const JIRA_KEY_REGEX = /\b([A-Z][A-Z0-9]+-\d+)\b/i;
const URL_REGEX = /https?:\/\/[^\s]+/gi;

export function extractJiraIssueKey(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const browseMatch = trimmed.match(JIRA_BROWSE_REGEX);

  if (browseMatch?.[1]) {
    return browseMatch[1].toUpperCase();
  }

  const plainMatch = trimmed.match(JIRA_KEY_REGEX);

  if (plainMatch?.[1]) {
    return plainMatch[1].toUpperCase();
  }

  return null;
}

function normalizeUrlCandidate(value: string): string {
  return value.replace(/[),.;]+$/g, "");
}

export function extractJiraIssueUrl(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const candidates = trimmed.match(URL_REGEX);

  if (!candidates) {
    return null;
  }

  for (const rawCandidate of candidates) {
    const candidate = normalizeUrlCandidate(rawCandidate);

    try {
      const parsed = new URL(candidate);
      const match = parsed.pathname.match(JIRA_BROWSE_REGEX);

      if (!match?.[1]) {
        continue;
      }

      return `${parsed.origin}/browse/${match[1].toUpperCase()}`;
    } catch {}
  }

  return null;
}
