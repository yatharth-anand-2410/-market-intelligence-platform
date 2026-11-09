import type { Activity, CrmRecord, LeadStatus } from "../types";

type StorageLike = Pick<Storage, "getItem" | "setItem">;
const KEY = "mip.crm.v1";

export function createCrmStore(storage: StorageLike | null) {
  let persistent = storage !== null;
  let records: Record<string, CrmRecord> = {};

  if (storage) {
    try {
      const raw = storage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) records = parsed;
    } catch {
      records = {};
    }
  }

  const save = () => {
    if (!storage) return;
    try {
      storage.setItem(KEY, JSON.stringify(records));
    } catch {
      persistent = false;
    }
  };
  const ensure = (leadId: string): CrmRecord =>
    (records[leadId] ??= { leadId, status: "New", activities: [] });

  return {
    get persistent() {
      return persistent;
    },
    get: (leadId: string): CrmRecord => records[leadId] ?? { leadId, status: "New", activities: [] },
    all: (): CrmRecord[] => Object.values(records),
    setStatus(leadId: string, status: LeadStatus) {
      ensure(leadId).status = status;
      save();
    },
    setFollowUp(leadId: string, date: string | undefined) {
      const r = ensure(leadId);
      if (date) r.followUpDate = date;
      else delete r.followUpDate;
      save();
    },
    addActivity(leadId: string, a: Omit<Activity, "id" | "at">, now: Date = new Date()) {
      ensure(leadId).activities.unshift({ ...a, id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`, at: now.toISOString() });
      save();
    },
  };
}
