const JIRA_BROWSE_REGEX = /\/browse\/([A-Z][A-Z0-9]+-\d+)(?:[/?#]|$)/i;
const JIRA_KEY_REGEX = /\b([A-Z][A-Z0-9]+-\d+)\b/i;

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
