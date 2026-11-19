export default async function handler(req, res) {
  const SUPABASE_URL = 'https://hdpxjesfeawnntjzttwj.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_rP30CJxvlgsSxAX73v2DNg_Cn0klwkX';
  const ASSET_ENDPOINT = 'https://hdpxjesfeawnntjzttwj.supabase.co/functions/v1/asset';

  let rows = [];
  let errorMsg = '';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/toolbox?select=id,name,creator&order=id.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      errorMsg = `Supabase HTTP ${response.status}`;
    } else {
      rows = await response.json();
    }
  } catch (err) {
    errorMsg = err.message || 'Network error loading toolbox';
  }

  const escapeHtml = (str = '') =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const itemsHtml = errorMsg
    ? `<div class="status">Failed to load items: ${escapeHtml(errorMsg)}</div>`
    : rows.length === 0
    ? `<div class="status">No models in the toolbox yet.</div>`
    : `<div class="list">${rows
        .map((item) => {
          const safeId = encodeURIComponent(item.id);
          const safeName = escapeHtml(item.name || `Model #${item.id}`);
          const safeCreator = escapeHtml(item.creator || 'Unknown');
          return `
            <div class="item">
              <div class="item-info">
                <div class="item-name">${safeName}</div>
                <div class="item-meta">By ${safeCreator} · #${escapeHtml(item.id)}</div>
              </div>
              <button class="insert-btn" onclick="insertAsset('${safeId}')">Insert</button>
            </div>
          `;
        })
        .join('')}</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Toolbox - Bloxtip</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f0f0; color: #191919; padding: 10px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; background: #0074BD; color: #fff; padding: 8px 10px; border-radius: 3px; margin-bottom: 10px; font-weight: bold; }
    .refresh-btn { background: #fff; color: #0074BD; border: none; padding: 4px 8px; border-radius: 2px; font-size: 11px; font-weight: bold; cursor: pointer; }
    .status { background: #fff; border: 1px solid #ccc; padding: 10px; border-radius: 3px; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .item { background: #fff; border: 1px solid #ccc; border-radius: 3px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .item-info { overflow: hidden; }
    .item-name { font-weight: bold; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-meta { color: #666; font-size: 11px; margin-top: 2px; }
    .insert-btn { background: #02b757; color: #fff; border: none; padding: 6px 10px; border-radius: 2px; font-weight: bold; font-size: 11px; cursor: pointer; flex-shrink: 0; }
    .insert-btn:hover { background: #00cc61; }
  </style>
</head>
<body>
  <div class="header">
    <span>Bloxtip Toolbox</span>
    <button class="refresh-btn" onclick="location.reload()">Refresh</button>
  </div>
  ${itemsHtml}
  <script>
    function insertAsset(id) {
      const assetUrl = "${ASSET_ENDPOINT}?id=" + id;
      if (window.external && typeof window.external.Insert === "function") {
        window.external.Insert(assetUrl);
      } else {
        window.open(assetUrl, "_blank");
      }
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(html);
}
