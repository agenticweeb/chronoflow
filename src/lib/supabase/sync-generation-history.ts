"use client";

import { createClient } from "@/lib/supabase/client";
import type { GeneratedFranchise } from "@/lib/discover/taste-graph";

/**
 * Syncs a generation to the logged-in user's Supabase history.
 * Fire-and-forget: failures never touch the local (anonymous) path, and this
 * is a no-op when not authenticated. Mirrors recordGeneration's local cap of 5.
 */
export async function syncGenerationToServer(entry: GeneratedFranchise): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // anonymous — localStorage path already handled it

    const { data, error: readError } = await supabase
      .from("user_progress")
      .select("generation_history")
      .eq("id", user.id)
      .single();

    if (readError && readError.code !== "PGRST116") {
      console.warn("[syncGeneration] read failed:", readError.message);
      return;
    }

    // Same dedupe + prepend + cap-5 semantics as the localStorage path
    const history: GeneratedFranchise[] = Array.isArray(data?.generation_history)
      ? data.generation_history
      : [];
    const filtered = history.filter((f) => f.anilistId !== entry.anilistId);
    const updated = [entry, ...filtered].slice(0, 5);

    const { error: writeError } = await supabase
      .from("user_progress")
      .update({ generation_history: updated })
      .eq("id", user.id);

    if (writeError) console.warn("[syncGeneration] write failed:", writeError.message);
  } catch {
    /* never break generation over analytics */
  }
}
