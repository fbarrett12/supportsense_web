import test from "node:test";
import assert from "node:assert/strict";
import { demoIssues, demoTickets, enrichDemoTicket, filterTickets } from "../lib/supportsense.js";

test("filters the queue by search text and severity", () => {
  assert.deepEqual(filterTickets(demoTickets, "home depot", "high").map(({ id }) => id), [1]);
  assert.equal(filterTickets(demoTickets, "", "critical").length, 1);
});

test("enriches an upload failure with the matching known issue", () => {
  const ticket = enrichDemoTicket({ subject: "PLM upload fails", body: "UPC column is missing", customer_identifier: "Acme" }, demoIssues, 22);
  assert.equal(ticket.known_issue_id, 1);
  assert.equal(ticket.severity, "high");
  assert.ok(ticket.match_confidence >= 90);
  assert.match(ticket.summary, /Acme/);
});

test("preserves ambiguity when no known issue has a signal", () => {
  const ticket = enrichDemoTicket({ subject: "Rename account", body: "How do I change a name?", customer_identifier: "Acme" }, demoIssues, 23);
  assert.equal(ticket.known_issue_id, null);
  assert.equal(ticket.match_confidence, null);
});
