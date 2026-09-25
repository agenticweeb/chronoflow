"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Settings, Loader2, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsData {
  theme: "system" | "dark";
  email_notifications: boolean;
}

const DEFAULT_SETTINGS: SettingsData = { theme: "system", email_notifications: true };

const THEME_OPTIONS: { value: SettingsData["theme"]; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function SettingsSection({ initialSettings }: { initialSettings: SettingsData | null }) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings ?? DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteStage, setDeleteStage] = useState<"idle" | "confirm" | "deleting" | "error">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const persist = async (next: SettingsData) => {
    setSettings(next);
    setSaving(true);
    setSaved(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("user_progress")
        .update({ settings: next })
        .eq("id", user.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Revert on failure so UI reflects reality
      setSettings(initialSettings ?? DEFAULT_SETTINGS);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteStage("deleting");
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Deletion failed");
      }
      window.location.href = "/?account_deleted=1";
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Deletion failed");
      setDeleteStage("error");
    }
  };

  return (
    <section className="glass-card rounded-2xl border border-chrono-border/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-chrono-primary" /> Settings
        </h2>
        {saving && <Loader2 className="w-4 h-4 text-chrono-primary animate-spin" />}
        {saved && !saving && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Theme preference */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Theme</p>
            <p className="text-[11px] text-chrono-text-dim mt-0.5">Interface appearance preference</p>
          </div>
          <div className="flex rounded-xl bg-chrono-surface border border-chrono-border p-1">
            {THEME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => persist({ ...settings, theme: value })}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer",
                  settings.theme === value
                    ? "bg-chrono-primary/20 text-chrono-primary"
                    : "text-chrono-text-dim hover:text-chrono-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Email notifications</p>
            <p className="text-[11px] text-chrono-text-dim mt-0.5">
              Currently only transactional emails (confirmation, password reset) exist — this prepares the toggle for future features.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.email_notifications}
            onClick={() => persist({ ...settings, email_notifications: !settings.email_notifications })}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer",
              settings.email_notifications ? "bg-chrono-primary" : "bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                settings.email_notifications ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-6 pt-6 border-t border-chrono-border/20 space-y-3">
        {deleteStage !== "confirm" && deleteStage !== "deleting" ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-300">Delete account</p>
              <p className="text-[11px] text-chrono-text-dim mt-0.5">
                Permanently removes your account, watch progress, and history. Cannot be undone.
              </p>
              {deleteStage === "error" && deleteError && (
                <p className="text-[11px] text-rose-400 mt-1">{deleteError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDeleteStage("confirm")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/10 rounded-xl px-3.5 py-2 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-white">
              Are you sure? This permanently deletes:
            </p>
            <ul className="text-[11px] text-chrono-text-muted space-y-1 list-disc list-inside">
              <li>Your account (email/OAuth link)</li>
              <li>All synced watch progress</li>
              <li>Generation history</li>
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteStage === "deleting"}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl px-4 py-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleteStage === "deleting" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleteStage === "deleting" ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={() => { setDeleteStage("idle"); setDeleteError(null); }}
                disabled={deleteStage === "deleting"}
                className="text-xs font-bold text-chrono-text-dim hover:text-white rounded-xl px-4 py-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
