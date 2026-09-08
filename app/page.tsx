"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, CircleDot, Clock3, Inbox, LayoutDashboard, Plus, Search, Sparkles, TicketCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoIssues, demoTickets, enrichDemoTicket, filterTickets, type KnownIssue, type SupportTicket } from "@/lib/supportsense";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const severityClass = (severity: string) => `severity-${["critical", "high", "medium", "low"].includes(severity) ? severity : "low"}`;

export default function Home() {
  const [tickets, setTickets] = useState<SupportTicket[]>(demoTickets);
  const [issues, setIssues] = useState<KnownIssue[]>(demoIssues);
  const [selectedId, setSelectedId] = useState<number>(demoTickets[0].id);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [source, setSource] = useState<"demo" | "api">("demo");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jiraTicketId, setJiraTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (!API_BASE) return;
    Promise.all([
      fetch(`${API_BASE}/api/v1/tickets`).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch(`${API_BASE}/api/v1/known_issues`).then((r) => r.ok ? r.json() : Promise.reject()),
    ]).then(([ticketPayload, issuePayload]) => {
      if (ticketPayload.length) { setTickets(ticketPayload); setSelectedId(ticketPayload[0].id); }
      if (issuePayload.length) setIssues(issuePayload);
      setSource("api");
    }).catch(() => setSource("demo"));
  }, []);

  const visible = useMemo(() => filterTickets(tickets, query, severity), [tickets, query, severity]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0];
  const issue = issues.find((item) => item.id === selected?.known_issue_id);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const draft = { subject: String(data.get("subject")), body: String(data.get("body")), customer_identifier: String(data.get("customer")), source_system: "zendesk", status: "open" };
    let created: SupportTicket;
    try {
      if (!API_BASE) throw new Error("Demo mode");
      const response = await fetch(`${API_BASE}/api/v1/tickets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticket: draft }) });
      if (!response.ok) throw new Error("Create failed");
      created = await response.json();
      setSource("api");
    } catch {
      created = enrichDemoTicket(draft, issues, tickets.length + 1);
      setSource("demo");
    }
    setTickets((current) => [created, ...current]);
    setSelectedId(created.id);
    setSubmitting(false);
    setDialogOpen(false);
  }

  const resolveTicket = () => setTickets((current) => current.map((ticket) => ticket.id === selectedId ? { ...ticket, status: "resolved" } : ticket));
  const openCount = tickets.filter((ticket) => ticket.status !== "resolved").length;
  const urgentCount = tickets.filter((ticket) => ["critical", "high"].includes(ticket.severity)).length;
  const matchedCount = tickets.filter((ticket) => ticket.known_issue_id).length;

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand-mark"><Sparkles size={19} /><span>SupportSense</span></div>
      <nav aria-label="Primary navigation">
        <a className="nav-item active" href="#workspace"><LayoutDashboard size={18} />Triage</a>
        <a className="nav-item" href="#known-issues"><AlertTriangle size={18} />Known issues</a>
        <a className="nav-item" href="#activity"><Activity size={18} />Activity</a>
      </nav>
      <div className="sidebar-foot"><div className="avatar">FB</div><div><strong>Fredrick Barrett</strong><span>Support operations</span></div></div>
    </aside>

    <section className="workspace" id="workspace">
      <header className="topbar">
        <div><p className="eyebrow">OPERATIONS / TRIAGE</p><h1>Support command center</h1></div>
        <div className="top-actions">
          <span className={`connection ${source}`}><CircleDot size={14} />{source === "api" ? "Live API" : "Reliable demo data"}</span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button className="new-ticket"><Plus size={17} />New ticket</Button></DialogTrigger>
            <DialogContent className="dialog-panel"><form onSubmit={createTicket}>
              <DialogHeader><DialogTitle>Ingest a support ticket</DialogTitle><DialogDescription>SupportSense will summarize and match it against active known issues.</DialogDescription></DialogHeader>
              <div className="form-stack"><label>Customer<input name="customer" required placeholder="Acme Logistics" /></label><label>Subject<input name="subject" required placeholder="Upload fails without UPC" /></label><label>Customer message<textarea name="body" required rows={5} placeholder="Paste the incoming support request…" /></label></div>
              <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Analyzing…" : "Analyze ticket"}</Button></DialogFooter>
            </form></DialogContent>
          </Dialog>
        </div>
      </header>

      <section className="metric-grid" aria-label="Ticket metrics">
        <article><span>Open queue</span><strong>{openCount}</strong><small><Clock3 size={14} /> 3 need review</small></article>
        <article><span>High priority</span><strong>{urgentCount}</strong><small className="warn"><AlertTriangle size={14} /> Act this hour</small></article>
        <article><span>Auto-matched</span><strong>{matchedCount}</strong><small><CheckCircle2 size={14} /> {Math.round((matchedCount / tickets.length) * 100)}% of queue</small></article>
        <article><span>Median triage</span><strong>42s</strong><small><ArrowUpRight size={14} /> 31% faster</small></article>
      </section>

      <section className="triage-grid">
        <div className="queue-panel">
          <div className="panel-heading"><div><h2>Incoming tickets</h2><span>{visible.length} shown</span></div><div className="filters"><label className="search"><Search size={16} /><input aria-label="Search tickets" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</label><select aria-label="Filter by severity" value={severity} onChange={(e) => setSeverity(e.target.value)}><option value="all">All severity</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div></div>
          <div className="ticket-list">{visible.map((ticket) => <button key={ticket.id} className={`ticket-row ${selectedId === ticket.id ? "selected" : ""}`} onClick={() => setSelectedId(ticket.id)}>
            <div className="ticket-row-top"><span className={`severity-dot ${severityClass(ticket.severity)}`} /><strong>{ticket.subject}</strong><time>{ticket.age}</time></div><p>{ticket.customer_identifier}</p><div><Badge variant="outline" className={severityClass(ticket.severity)}>{ticket.severity}</Badge>{ticket.known_issue_id && <span className="matched"><Sparkles size={13} />Known issue</span>}</div>
          </button>)}{!visible.length && <div className="empty-state"><Inbox size={28} /><strong>No tickets found</strong><span>Try a different search or severity.</span></div>}</div>
        </div>

        {selected && <article className="detail-panel">
          <div className="detail-heading"><div><span className={`severity-pill ${severityClass(selected.severity)}`}>{selected.severity}</span><span className="ticket-id">{selected.external_id}</span></div><h2>{selected.subject}</h2><p>{selected.customer_identifier} · via {selected.source_system}</p></div>
          <Tabs defaultValue="insight"><TabsList className="detail-tabs"><TabsTrigger value="insight">AI insight</TabsTrigger><TabsTrigger value="message">Original message</TabsTrigger></TabsList>
            <TabsContent value="insight" className="insight-stack"><section className="summary-card"><div className="section-label"><Sparkles size={15} />Summary</div><p>{selected.summary}</p></section>
              {issue ? <section className="match-card"><div className="match-header"><div><span className="match-confidence"><CheckCircle2 size={15} />{selected.match_confidence}% match</span><h3>{issue.title}</h3></div><Badge variant="outline">{issue.status.replaceAll("_", " ")}</Badge></div><div className="match-facts"><div><span>Root cause</span><p>{issue.root_cause}</p></div><div><span>Recommended response</span><p>{issue.workaround}</p></div></div></section> : <section className="no-match"><AlertTriangle size={18} /><div><strong>No known issue matched</strong><p>Review manually and promote a repeated pattern when confirmed.</p></div></section>}
              <section className="next-action"><span>Suggested next step</span><strong>{issue ? "Share the workaround, then link this occurrence." : "Assign for manual investigation."}</strong></section>
            </TabsContent><TabsContent value="message"><div className="message-card">{selected.body}</div></TabsContent></Tabs>
          <div className="detail-actions"><Button variant="outline" onClick={() => setJiraTicketId(selected.id)} disabled={jiraTicketId === selected.id}><TicketCheck size={16} />{jiraTicketId === selected.id ? "Jira task SS-104 created" : "Create Jira task"}</Button><Button onClick={resolveTicket} disabled={selected.status === "resolved"}><CheckCircle2 size={16} />{selected.status === "resolved" ? "Resolved" : "Resolve ticket"}</Button></div>
        </article>}
      </section>

      <section className="known-strip" id="known-issues"><div className="section-title"><div><p className="eyebrow">KNOWLEDGE SIGNALS</p><h2>Active known issues</h2></div><span>{issues.length} monitored patterns</span></div><div className="issue-grid">{issues.map((item) => <article key={item.id}><div><span className={`severity-dot ${severityClass(item.severity_level)}`} /><Badge variant="outline">{item.status.replaceAll("_", " ")}</Badge></div><h3>{item.title}</h3><p>{item.workaround}</p><footer><span>{item.occurrence_count} linked tickets</span><ArrowUpRight size={16} /></footer></article>)}</div></section>
    </section>
  </main>;
}
