export interface KnownIssue { id: number; title: string; severity_level: string; status: string; occurrence_count: number; root_cause: string; workaround: string; tags: string[] }
export interface SupportTicket { id: number; external_id: string; source_system: string; subject: string; body: string; summary: string; status: string; severity: string; customer_identifier: string; known_issue_id: number | null; match_confidence: number | null; tags: string[]; age: string }
export const demoIssues: KnownIssue[];
export const demoTickets: SupportTicket[];
export function filterTickets(tickets: SupportTicket[], query: string, severity: string): SupportTicket[];
export function enrichDemoTicket(draft: { subject: string; body: string; customer_identifier?: string; source_system?: string; status?: string }, issues?: KnownIssue[], sequence?: number): SupportTicket;
