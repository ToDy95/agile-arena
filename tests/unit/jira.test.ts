import { describe, expect, it } from "vitest";

import { extractJiraIssueKey } from "@/lib/utils/jira";

describe("extractJiraIssueKey", () => {
  it("extracts an issue key from Jira browse URL", () => {
    expect(extractJiraIssueKey("https://company.atlassian.net/browse/BWR-352")).toBe("BWR-352");
  });

  it("extracts uppercase key from free text", () => {
    expect(extractJiraIssueKey("follow up with bwr-99 this sprint")).toBe("BWR-99");
  });

  it("returns null for invalid text", () => {
    expect(extractJiraIssueKey("no issue id here")).toBeNull();
  });
});
