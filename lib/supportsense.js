export const demoIssues = [
  { id: 1, title: "PLM upload fails when UPC column is missing", severity_level: "high", status: "monitoring", occurrence_count: 12, root_cause: "The import validator expects a UPC column and throws a null-reference error when the column is absent.", workaround: "Add a UPC column to the template, even when values are blank, then retry the upload.", tags: ["upload", "upc", "plm"] },
  { id: 2, title: "Invoice exports remain in processing", severity_level: "critical", status: "investigating", occurrence_count: 7, root_cause: "Large export batches are exceeding the worker timeout during peak processing windows.", workaround: "Split the date range into weekly exports while Engineering drains the delayed queue.", tags: ["invoice", "export", "processing"] },
  { id: 3, title: "SSO redirect loop after domain update", severity_level: "medium", status: "fix_scheduled", occurrence_count: 5, root_cause: "The identity provider is redirecting to a stale callback domain cached in the tenant configuration.", workaround: "Re-save the SSO configuration and ask the user to begin a new private browsing session.", tags: ["sso", "login", "redirect"] },
];

export const demoTickets = [
  { id: 1, external_id: "ZEN-4821", source_system: "zendesk", subject: "Home Depot catalog upload returns generic error", body: "Our merchandising team cannot upload today's PLM file. The file does not include UPC because these are pre-release items. The page only says something went wrong.", summary: "A Home Depot PLM import without a UPC column fails with a generic validation error, blocking today's catalog update.", status: "open", severity: "high", customer_identifier: "Home Depot", known_issue_id: 1, match_confidence: 96, tags: ["upload", "plm"], age: "4m" },
  { id: 2, external_id: "ZEN-4818", source_system: "zendesk", subject: "Month-end invoices stuck processing", body: "The finance export has shown processing for 45 minutes. We need the files for month-end close today.", summary: "Month-end invoice export remains in processing for 45 minutes and is blocking the customer's close workflow.", status: "open", severity: "critical", customer_identifier: "Northstar Freight", known_issue_id: 2, match_confidence: 93, tags: ["invoice", "export"], age: "18m" },
  { id: 3, external_id: "INT-1094", source_system: "intercom", subject: "Users sent back to login after SSO", body: "Since updating our company domain, everyone gets sent to the sign-in page after authenticating successfully.", summary: "Users enter a redirect loop after successful SSO authentication following a company domain change.", status: "open", severity: "medium", customer_identifier: "Atlas Supply", known_issue_id: 3, match_confidence: 89, tags: ["sso", "login"], age: "31m" },
  { id: 4, external_id: "ZEN-4807", source_system: "zendesk", subject: "Can we rename a saved report?", body: "I created a report with the wrong name. Is there a way to change it without rebuilding it?", summary: "Customer wants to rename an existing saved report without recreating it.", status: "pending", severity: "low", customer_identifier: "Marlow Retail", known_issue_id: null, match_confidence: null, tags: ["reports"], age: "1h" },
];

export function filterTickets(tickets, query, severity) {
  const normalized = query.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const matchesQuery = !normalized || `${ticket.subject} ${ticket.customer_identifier} ${ticket.external_id}`.toLowerCase().includes(normalized);
    return matchesQuery && (severity === "all" || ticket.severity === severity);
  });
}

export function enrichDemoTicket(draft, issues = demoIssues, sequence = Date.now()) {
  const text = `${draft.subject} ${draft.body}`.toLowerCase();
  const scored = issues.map((issue) => ({ issue, score: issue.tags.filter((tag) => text.includes(tag)).length })).sort((a, b) => b.score - a.score)[0];
  const match = scored?.score > 0 ? scored.issue : null;
  const urgent = /blocked|urgent|outage|cannot|fails|stuck/.test(text);
  return { id: sequence, external_id: `DEMO-${String(sequence).padStart(4, "0")}`, source_system: draft.source_system || "manual", subject: draft.subject, body: draft.body, summary: `${draft.customer_identifier || "Customer"} reports ${draft.subject.toLowerCase()}. ${urgent ? "The issue is blocking an active workflow." : "Manual follow-up may be required."}`, status: draft.status || "open", severity: urgent ? "high" : "medium", customer_identifier: draft.customer_identifier || "Unknown customer", known_issue_id: match?.id ?? null, match_confidence: match ? Math.min(97, 82 + scored.score * 5) : null, tags: match?.tags ?? [], age: "now" };
}
