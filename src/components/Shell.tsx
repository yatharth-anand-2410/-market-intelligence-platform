import { Suspense } from "react";
import { NavLinks } from "./NavLinks";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-card md:min-h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <div className="text-sm font-semibold tracking-tight">Market Intelligence</div>
          <div className="text-xs text-muted">B2B research and sales</div>
        </div>
        <Suspense fallback={null}><NavLinks /></Suspense>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b border-line bg-amber-50 px-4 py-2 text-xs text-amber-900">
          Internal research tool. Nothing here sends email, WhatsApp or any message. Records marked “Demo data” are invented for demonstration.
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
