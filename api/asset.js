const SUPABASE_PROJECT_ID = "hdpxjesfeawnntjzttwj";
const SUPABASE_ANON_KEY = "sb_publishable_rP30CJxvlgsSxAX73v2DNg_Cn0klwkX";
const SERVE_BYTES_DIRECTLY = true;

function toHttpsUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return "https:" + trimmed;
  if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, "https://");
  return trimmed;
}

function extractAssetId(rawId) {
  const match = String(rawId || "").trim().match(/(\d+)/);
  return match ? match.at(1) : null;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cleanPath = url.pathname.replace(/\/+$/, "") || "/";

    if (cleanPath === "/asset" || cleanPath === "/api/asset") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        });
      }

      const assetId = extractAssetId(url.searchParams.get("id"));
      if (!assetId) {
        return new Response("Missing or invalid ?id= parameter", {
          status: 400,
          headers: CORS_HEADERS,
        });
      }

      try {
        const endpoint =
          `https://${SUPABASE_PROJECT_ID}.supabase.co/rest/v1/images` +
          `?select=image_url&asset_id=eq.${encodeURIComponent(assetId)}&limit=1`;

        const dbRes = await fetch(endpoint, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Accept: "application/json",
          },
        });

        if (!dbRes.ok) {
          return new Response(`Supabase query failed (${dbRes.status})`, {
            status: 502,
            headers: CORS_HEADERS,
          });
        }

        const rows = await dbRes.json();
        const firstRow = Array.isArray(rows) ? rows.at(0) : null;
        const imageUrl = firstRow?.image_url ? toHttpsUrl(firstRow.image_url) : "";

        if (!imageUrl) {
          return new Response(`Asset ${assetId} not found`, {
            status: 404,
            headers: CORS_HEADERS,
          });
        }

        if (!SERVE_BYTES_DIRECTLY) {
          return new Response(null, {
            status: 302,
            headers: {
              ...CORS_HEADERS,
              Location: imageUrl,
            },
          });
        }

        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) {
          return new Response(`Failed to fetch image from bucket (${imgRes.status})`, {
            status: 502,
            headers: CORS_HEADERS,
          });
        }

        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        const arrayBuf = await imgRes.arrayBuffer();

        return new Response(arrayBuf, {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": contentType,
            "Content-Length": String(arrayBuf.byteLength),
            "Cache-Control": "public, max-age=300",
          },
        });
      } catch (err) {
        return new Response(`Server error: ${err.message || err}`, {
          status: 500,
          headers: CORS_HEADERS,
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
