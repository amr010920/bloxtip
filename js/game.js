if (url.pathname === "/js/game.js" || url.pathname === "/js/game.js/") {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Game - Bloxtip</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <script>
(function () {
    const SUPABASE_URL = "https://hdpxjesfeawnntjzttwj.supabase.co/";
    const SUPABASE_KEY = "sb_publishable_rP30CJxvlgsSxAX73v2DNg_Cn0klwkX";
    const DEFAULT_THUMBNAIL = "https://raw.githubusercontent.com/amr010920/bloxtip/refs/heads/images/more/defaultgamethumbnail.png";

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("id");

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderError(message) {
        document.body.innerHTML = \`
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 48px auto; padding: 24px; background: #ffffff; border: 1px solid #d5d7dc; border-radius: 4px;">
                <h2 style="margin: 0 0 10px; color: #191919;">Unable to load game</h2>
                <p style="margin: 0 0 16px; color: #555555;">\${escapeHtml(message)}</p>
                <a href="https://btip.cc.cd/home.html" style="color: #0074bd; text-decoration: none; font-weight: bold;">Back to Home</a>
            </div>
        \`;
    }

    function renderGame(game) {
        const title = game.title || \`Game \${game.id}\`;
        const creator = game.creator || game.creator_name || "Bloxtip";
        const thumb = game.thumbnail_url || DEFAULT_THUMBNAIL;
        const description = game.description || "No description provided.";
        const protocolUri = game.place_url || \`bloxtip:placeId=\${encodeURIComponent(game.id)}\`;

        document.title = \`\${title} - Bloxtip\`;

        document.body.innerHTML = \`
            <div style="font-family: Arial, sans-serif; max-width: 780px; margin: 36px auto; padding: 24px; background: #ffffff; border: 1px solid #d5d7dc; border-radius: 4px; color: #191919;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start;">
                    <img src="\${escapeHtml(thumb)}" alt="\${escapeHtml(title)}" style="width: 260px; height: 156px; object-fit: cover; border-radius: 4px; border: 1px solid #d5d7dc; background: #2b2e33;">
                    <div style="flex: 1; min-width: 220px;">
                        <h1 style="margin: 0 0 6px; font-size: 24px;">\${escapeHtml(title)}</h1>
                        <div style="font-size: 13px; color: #666666; margin-bottom: 14px;">By \${escapeHtml(creator)} · Place ID: \${escapeHtml(game.id)}</div>
                        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.5; color: #333333;">\${escapeHtml(description)}</p>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button type="button" id="nvx-launch-protocol-btn" style="padding: 9px 18px; background: #02b757; border: 1px solid #018a41; color: #ffffff; font-weight: bold; border-radius: 3px; cursor: pointer;">Play</button>
                            <a href="https://btip.cc.cd/home.html" style="padding: 9px 14px; background: #f3f4f6; border: 1px solid #d5d7dc; color: #191919; text-decoration: none; border-radius: 3px; font-size: 13px;">Back</a>
                        </div>
                        <div id="nvx-launch-status" style="margin-top: 10px; font-size: 12px; color: #555555;"></div>
                    </div>
                </div>
            </div>
        \`;

        const launchBtn = document.getElementById("nvx-launch-protocol-btn");
        const statusEl = document.getElementById("nvx-launch-status");

        function triggerProtocol() {
            if (statusEl) {
                statusEl.textContent = \`Launching \${protocolUri}...\`;
            }
            window.location.href = protocolUri;
        }

        if (launchBtn) {
            launchBtn.addEventListener("click", triggerProtocol);
        }
    }

    async function init() {
        if (!gameId) {
            renderError("Missing game id in URL query (?id=...).");
            return;
        }

        if (!window.supabase) {
            renderError("Supabase client library failed to load.");
            return;
        }

        const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await sb
            .from("games")
            .select("*")
            .eq("id", gameId)
            .single();

        if (error || !data) {
            renderError(\`Could not find game with id "\${gameId}".\`);
            return;
        }

        renderGame(data);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
