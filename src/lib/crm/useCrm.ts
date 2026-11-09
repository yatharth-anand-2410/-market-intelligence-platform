"use client";
import { useEffect, useMemo, useState } from "react";
import { createCrmStore } from "./store";
import type { Activity, CrmRecord, LeadStatus } from "../types";

/** Browser-local CRM. Re-renders on every change; `ready` is false until mounted. */
export function useCrm() {
  const [, bump] = useState(0);
  const [ready, setReady] = useState(false);
  const store = useMemo(() => {
    let storage: Storage | null = null;
    try {
      storage = typeof window !== "undefined" ? window.localStorage : null;
    } catch {
      storage = null;
    }
    return createCrmStore(storage);
  }, []);
  useEffect(() => setReady(true), []);
  const rerender = () => bump((n) => n + 1);

  return {
    ready,
    persistent: store.persistent,
    get: (id: string): CrmRecord => store.get(id),
    all: (): CrmRecord[] => store.all(),
    setStatus: (id: string, s: LeadStatus) => { store.setStatus(id, s); rerender(); },
    setFollowUp: (id: string, d: string | undefined) => { store.setFollowUp(id, d); rerender(); },
    addActivity: (id: string, a: Omit<Activity, "id" | "at">) => { store.addActivity(id, a); rerender(); },
  };
}
