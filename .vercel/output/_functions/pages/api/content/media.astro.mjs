import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../../renderers.mjs";
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseServiceKey = "***REMOVED***";
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const GET = async ({ request, url }) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const fileType = url.searchParams.get("type");
    const folder = url.searchParams.get("folder");
    const search = url.searchParams.get("search");
    const tags = url.searchParams.get("tags")?.split(",");
    const page2 = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page2 - 1) * limit;
    let query = supabase.from("media_library").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (fileType) {
      query = query.eq("file_type", fileType);
    }
    if (folder) {
      query = query.eq("folder", folder);
    }
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,caption.ilike.%${search}%,alt_text.ilike.%${search}%`);
    }
    if (tags && tags.length > 0) {
      query = query.contains("tags", tags);
    }
    const { data: media, error, count } = await query;
    if (error) {
      return new Response(JSON.stringify({
        error: "Failed to fetch media: " + error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      media,
      pagination: {
        page: page2,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get media error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const {
      fileName,
      filePath,
      fileType,
      mimeType,
      fileSizeBytes,
      folder = "/",
      tags = [],
      altText,
      caption
    } = body;
    if (!fileName || !filePath || !fileType || !mimeType || !fileSizeBytes) {
      return new Response(JSON.stringify({
        error: "Missing required fields: fileName, filePath, fileType, mimeType, fileSizeBytes"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: media, error: mediaError } = await supabase.from("media_library").insert({
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes,
      folder,
      tags,
      alt_text: altText,
      caption,
      uploaded_by: user.id,
      is_in_use: false
    }).select().single();
    if (mediaError) {
      return new Response(JSON.stringify({
        error: "Failed to register media: " + mediaError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      media
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Register media error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PUT = async ({ request, url }) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { mediaId, ...updates } = body;
    if (!mediaId) {
      return new Response(JSON.stringify({
        error: "Missing required field: mediaId"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: media, error: fetchError } = await supabase.from("media_library").select("uploaded_by").eq("id", mediaId).single();
    if (fetchError || !media) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (media.uploaded_by !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const allowedFields = ["folder", "tags", "alt_text", "caption", "file_name"];
    const updateData = {};
    for (const field of allowedFields) {
      if (updates[field] !== void 0) {
        updateData[field] = updates[field];
      }
    }
    const { data: updatedMedia, error: updateError } = await supabase.from("media_library").update(updateData).eq("id", mediaId).select().single();
    if (updateError) {
      return new Response(JSON.stringify({
        error: "Failed to update media: " + updateError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      media: updatedMedia
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Update media error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request, url }) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const mediaId = url.searchParams.get("id");
    if (!mediaId) {
      return new Response(JSON.stringify({
        error: "Missing required parameter: id"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: media, error: fetchError } = await supabase.from("media_library").select("*").eq("id", mediaId).single();
    if (fetchError || !media) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (media.uploaded_by !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (media.is_in_use) {
      return new Response(JSON.stringify({
        error: "Cannot delete media that is currently in use"
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { error: storageError } = await supabase.storage.from("media").remove([media.file_path]);
    if (storageError) {
      console.error("Failed to delete from storage:", storageError);
    }
    const { error: deleteError } = await supabase.from("media_library").delete().eq("id", mediaId);
    if (deleteError) {
      return new Response(JSON.stringify({
        error: "Failed to delete media: " + deleteError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Media deleted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  PUT
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
