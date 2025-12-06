import { renderers } from "../../renderers.mjs";
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");
    const webhookSecret = void 0;
    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const payload = await request.json();
    const { type, table, record, old_record } = payload;
    if (table !== "applications" || type !== "UPDATE") {
      return new Response(
        JSON.stringify({ message: "Event ignored" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (record.status === "approved" && old_record.status !== "approved") {
      console.log(`Application approved for ${record.email}`);
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
