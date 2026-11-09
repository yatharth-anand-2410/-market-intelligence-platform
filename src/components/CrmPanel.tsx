"use client";
import { useState } from "react";
import { Card } from "./ui";
import { Badge } from "./Badge";
import { useCrm } from "@/lib/crm/useCrm";
import { STATUSES, type Activity, type LeadStatus } from "@/lib/types";

const input = "rounded border border-line bg-card px-2 py-1.5 text-sm";
const TYPES: Activity["type"][] = ["call", "meeting", "note", "quotation"];

export function CrmPanel({ leadId }: { leadId: string }) {
  const crm = useCrm();
  const rec = crm.get(leadId);
  const [type, setType] = useState<Activity["type"]>("call");
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const n = Number(amount);
    crm.addActivity(leadId, {
      type,
      text: text.trim(),
      amountInr: type === "quotation" && amount && Number.isFinite(n) ? n : undefined,
    });
    setText("");
    setAmount("");
  };

  return (
    <Card title="Sales CRM" right={<Badge kind="local" />}>
      <p className="mb-3 text-xs text-muted">Saved in this browser only. A shared database is planned for the next milestone.</p>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-muted">Status
          <select className={`${input} mt-1 block`} value={rec.status} onChange={(e) => crm.setStatus(leadId, e.target.value as LeadStatus)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted">Follow-up date
          <input type="date" className={`${input} mt-1 block`} value={rec.followUpDate ?? ""} onChange={(e) => crm.setFollowUp(leadId, e.target.value || undefined)} />
        </label>
      </div>

      <form onSubmit={add} className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          <select aria-label="Activity type" className={input} value={type} onChange={(e) => setType(e.target.value as Activity["type"])}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {type === "quotation" && (
            <input aria-label="Quotation amount in INR" className={`${input} w-40`} inputMode="numeric" placeholder="Amount (INR)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          )}
        </div>
        <textarea aria-label="Activity note" className={`${input} w-full`} rows={2} placeholder="What happened?" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white">Add to log</button>
      </form>

      <ul className="mt-4 divide-y divide-line text-sm">
        {rec.activities.length === 0 && <li className="py-2 text-muted">No activity logged yet.</li>}
        {rec.activities.map((a) => (
          <li key={a.id} className="py-2">
            <div className="flex justify-between gap-2 text-xs text-muted">
              <span className="font-medium capitalize text-foreground">{a.type}{a.amountInr ? ` · ₹${a.amountInr.toLocaleString("en-IN")}` : ""}</span>
              <span>{a.at.slice(0, 16).replace("T", " ")}</span>
            </div>
            <p className="mt-0.5">{a.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
