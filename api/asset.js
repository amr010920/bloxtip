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
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const assetId = extractAssetId(req.query?.id);
  if (!assetId) {
    return res.status(400).send("Missing or invalid ?id= parameter");
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
      return res.status(502).send(`Supabase query failed (${dbRes.status})`);
    }

    const rows = await dbRes.json();
    const imageUrl = rows?.[0]?.image_url ? toHttpsUrl(rows[0].image_url) : "";

    if (!imageUrl) {
      return res.status(404).send(`Asset ${assetId} not found`);
    }

    if (!SERVE_BYTES_DIRECTLY) {
      return res.redirect(302, imageUrl);
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return res.status(502).send(`Failed to fetch image from bucket (${imgRes.status})`);
    }

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const arrayBuf = await imgRes.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).send(Buffer.from(arrayBuf));
  } catch (err) {
    return res.status(500).send(`Server error: ${err.message || err}`);
  }
}
