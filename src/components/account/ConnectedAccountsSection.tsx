"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link2, Link2Off } from "lucide-react";
import type { UserIdentity } from "@supabase/supabase-js";

export function ConnectedAccountsSection() {
  const [identities, setIdentities] = useState<UserIdentity[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUserIdentities().then(({ data }) => {
      setIdentities(data?.identities ?? []);
    });
  }, []);

  const handleDisconnect = async (identity: UserIdentity) => {
    setBusy(identity.identity_id);
    const supabase = createClient();
    const { error } = await supabase.auth.unlinkIdentity(identity);
    setBusy(null);
    if (!error) {
      // Supabase blocks unlinking your LAST identity — the length guard in
      // the render hides the button for that case, but re-sync from source
      const { data } = await supabase.auth.getUserIdentities();
      setIdentities(data?.identities ?? []);
    }
  };

  const providerLabel: Record<string, string> = {
    google: "Google",
    discord: "Discord",
    email: "Email & Password",
  };

  return (
    <section className="glass-card rounded-2xl border border-chrono-border/30 p-6">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
        <Link2 className="w-4 h-4 text-chrono-primary" /> Sign-In Methods
      </h2>

      {identities === null ? (
        <div className="space-y-2">
          <div className="skeleton h-10 rounded-xl" />
          <div className="skeleton h-10 rounded-xl" />
        </div>
      ) : (
        <ul className="space-y-2">
          {identities.map((identity) => (
            <li
              key={identity.identity_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-chrono-border/20 bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-chrono-primary/15 flex items-center justify-center text-[11px] font-black text-chrono-primary shrink-0">
                  {providerLabel[identity.provider]?.charAt(0).toUpperCase() ?? "?"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {providerLabel[identity.provider] ?? identity.provider}
                  </p>
                  <p className="text-[11px] text-chrono-text-dim truncate">
                    {identity.identity_data?.email ?? identity.identity_data?.name ?? ""}
                  </p>
                </div>
              </div>
              {identities.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDisconnect(identity)}
                  disabled={busy === identity.identity_id}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Link2Off className="w-3.5 h-3.5" />
                  {busy === identity.identity_id ? "Removing…" : "Disconnect"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-chrono-text-dim mt-3">
        The last remaining sign-in method cannot be disconnected.
      </p>
    </section>
  );
}
