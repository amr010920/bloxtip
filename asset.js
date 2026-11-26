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

function extractAssetId(searchParams) {
  const rawId = searchParams.get("id") || searchParams.get("ID");
  const match = String(rawId || "").trim().match(/(\d+)/);
  return match ? match[1] : null;
}

function detectImageType(bytes, fallbackHeader) {
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "image/gif";
  }
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return "image/bmp";
  }
  if (fallbackHeader && fallbackHeader.toLowerCase().startsWith("image/")) {
    return fallbackHeader;
  }
  return "image/jpeg";
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cleanPath = (url.pathname.replace(/\/+$/, "") || "/").toLowerCase();

    if (cleanPath === "/asset" || cleanPath === "/api/asset") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        });
      }

      const assetId = extractAssetId(url.searchParams);
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
        const firstRow = Array.isArray(rows) ? rows[0] : null;
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

        const arrayBuf = await imgRes.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        const contentType = detectImageType(bytes, imgRes.headers.get("content-type"));

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
