import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email-link verification route. Supabase email links (signup confirmation,
// and later magic links / password recovery) carry token_hash + type, which
// MUST be verified via verifyOtp() — not exchangeCodeForSession(). That
// method is only for OAuth code params, which /auth/callback handles.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/account";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/confirm] verifyOtp failed:", error.message);
  }

  const errorUrl = new URL("/", origin);
  errorUrl.searchParams.set("auth_error", "1");
  return NextResponse.redirect(errorUrl);
}
