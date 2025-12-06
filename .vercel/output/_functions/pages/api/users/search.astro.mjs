import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../../renderers.mjs";
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const GET = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    if (query.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Query too short" }),
        { status: 400 }
      );
    }
    const { data, error } = await supabase.from("applications").select("user_id, name, email").neq("user_id", user.id).or(`name.ilike.%${query}%,email.ilike.%${query}%`).limit(limit);
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        users: (data || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          email: u.email
        }))
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/users/search:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error"
      }),
      { status: 500 }
    );
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
