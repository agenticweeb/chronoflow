import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 1. Delete the progress row (RLS must allow the user to delete their own row)
    const { error: progressError } = await supabase
      .from("user_progress")
      .delete()
      .eq("id", user.id);

    if (progressError) {
      console.error("[account/delete] progress row:", progressError.message);
      // Continue anyway — the auth user deletion is the source of truth
    }

    // 2. Delete the auth user. This requires the service-role key — the
    // browser client's anon key cannot delete auth.users rows (by design).
    const admin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    const { error: authError } = await admin.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error("[account/delete] auth user:", authError.message);
      return NextResponse.json(
        { error: "Account deletion failed — please try again or contact support via Feedback." },
        { status: 500 }
      );
    }

    // 3. Clear the session cookies
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[account/delete]", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
