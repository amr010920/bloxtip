<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Toolbox - Bloxtip</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background: #f0f0f0;
      color: #191919;
      padding: 10px;
      font-size: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0074BD;
      color: #fff;
      padding: 8px 10px;
      border-radius: 3px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .refresh-btn {
      background: #fff;
      color: #0074BD;
      border: none;
      padding: 4px 8px;
      border-radius: 2px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
    }
    .status {
      background: #fff;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 3px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item {
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .item-info {
      overflow: hidden;
    }
    .item-name {
      font-weight: bold;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-meta {
      color: #666;
      font-size: 11px;
      margin-top: 2px;
    }
    .insert-btn {
      background: #02b757;
      color: #fff;
      border: none;
      padding: 6px 10px;
      border-radius: 2px;
      font-weight: bold;
      font-size: 11px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .insert-btn:hover {
      background: #00cc61;
    }
  </style>
</head>
<body>
  <div class="header">
    <span>Bloxtip Toolbox</span>
    <button class="refresh-btn" onclick="loadToolbox()">Refresh</button>
  </div>

  <div id="status" class="status">Loading toolbox items...</div>
  <div id="item-list" class="list" style="display: none;"></div>

  <script>
    const SUPABASE_URL = 'https://hdpxjesfeawnntjzttwj.supabase.co/';
    const SUPABASE_ANON_KEY = 'sb_publishable_rP30CJxvlgsSxAX73v2DNg_Cn0klwkX';
    // Point this to your dynamic endpoint/Edge Function that returns toolbox.xml for ?id=...
    const ASSET_ENDPOINT = 'https://hdpxjesfeawnntjzttwj.supabase.co/functions/v1/asset';

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    async function loadToolbox() {
      const statusEl = document.getElementById('status');
      const listEl = document.getElementById('item-list');

      statusEl.style.display = 'block';
      statusEl.textContent = 'Loading toolbox items...';
      listEl.style.display = 'none';
      listEl.innerHTML = '';

      const { data, error } = await supabaseClient
        .from('toolbox')
        .select('id, name, creator')
        .order('id', { ascending: false });

      if (error) {
        statusEl.textContent = 'Failed to load items: ' + error.message;
        return;
      }

      if (!data || data.length === 0) {
        statusEl.textContent = 'No models in the toolbox yet.';
        return;
      }

      statusEl.style.display = 'none';
      listEl.style.display = 'flex';

      data.forEach(item => {
        const row = document.createElement('div');
        row.className = 'item';

        const info = document.createElement('div');
        info.className = 'item-info';

        const title = document.createElement('div');
        title.className = 'item-name';
        title.textContent = item.name || ('Model #' + item.id);

        const meta = document.createElement('div');
        meta.className = 'item-meta';
        meta.textContent = 'By ' + (item.creator || 'Unknown') + ' · #' + item.id;

        const btn = document.createElement('button');
        btn.className = 'insert-btn';
        btn.textContent = 'Insert';
        btn.onclick = () => insertModel(item);

        info.appendChild(title);
        info.appendChild(meta);
        row.appendChild(info);
        row.appendChild(btn);
        listEl.appendChild(row);
      });
    }

    async function insertModel(item) {
      const assetUrl = `${ASSET_ENDPOINT}?id=${encodeURIComponent(item.id)}`;

      if (window.external && typeof window.external.Insert === 'function') {
        window.external.Insert(assetUrl);
        return;
      }

      // Fallback when testing in a regular browser outside Studio's embedded window
      const { data, error } = await supabaseClient
        .from('toolbox')
        .select('xml, name')
        .eq('id', item.id)
        .single();

      if (error || !data || !data.xml) {
        alert('Could not fetch XML: ' + (error ? error.message : 'Empty xml column'));
        return;
      }

      const blob = new Blob([data.xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(data.name || 'model_' + item.id).replace(/[^a-z0-9_-]/gi, '_')}.rbxmx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    loadToolbox();
  </script>
</body>
</html>
