# bloxtip

A small static Roblox-revival-inspired homepage for the `website-lowk` branch.

## Routes

- `/home` — featured games and the default `default rbxl places.zip` archive checker.
- `/creation` — client-side account creation page.

The account demo stores only a username and email in browser `localStorage`; it is not a production authentication system. The archive checker fetches `default rbxl places.zip`, opens it in the browser with JSZip, and reports how many `.rbxl`/`.rbxlx` files it contains.
