const http = require("http");
const dgram = require("dgram");

const HTTP_PORT = Number(process.env.PORT || 3000);
const UDP_PORT = Number(process.env.RELAY_PORT || 53641);
const TIMEOUT_MS = 45000;

const rooms = new Map();

const udp = dgram.createSocket("udp4");

udp.on("message", (msg, rinfo) => {
  const now = Date.now();
  const senderKey = `${rinfo.address}:${rinfo.port}`;

  if (msg.length >= 8 && msg.subarray(0, 8).toString("ascii") === "BLTREL1|") {
    const parts = msg.toString("ascii").split("|");
    if (parts.length >= 3) {
      const role = parts[1];
      const roomCode = parts[2].trim();
      if (roomCode.length > 0) {
        let room = rooms.get(roomCode);
        if (!room) {
          room = { host: null, hostSeen: 0, clients: new Map() };
          rooms.set(roomCode, room);
        }
        if (role === "host") {
          room.host = { address: rinfo.address, port: rinfo.port, key: senderKey };
          room.hostSeen = now;
        } else if (role === "client") {
          room.clients.set(senderKey, { address: rinfo.address, port: rinfo.port, seen: now });
        }
      }
    }
    return;
  }

  for (const [roomCode, room] of rooms.entries()) {
    if (now - room.hostSeen > TIMEOUT_MS && room.clients.size === 0) {
      rooms.delete(roomCode);
      continue;
    }

    if (room.host && room.host.key === senderKey) {
      room.hostSeen = now;
      for (const [clientKey, client] of room.clients.entries()) {
        if (now - client.seen > TIMEOUT_MS) {
          room.clients.delete(clientKey);
        } else {
          udp.send(msg, client.port, client.address);
        }
      }
    } else if (room.clients.has(senderKey)) {
      const client = room.clients.get(senderKey);
      client.seen = now;
      if (room.host) {
        udp.send(msg, room.host.port, room.host.address);
      }
    }
  }
});

udp.on("error", (err) => {
  console.error("UDP relay error:", err.message);
});

udp.bind(UDP_PORT, "0.0.0.0", () => {
  console.log(`UDP relay listening on 0.0.0.0:${UDP_PORT}`);
});

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, activeRooms: rooms.size, udpPort: UDP_PORT }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Relay server running");
});

server.listen(HTTP_PORT, () => {
  console.log(`HTTP server listening on port ${HTTP_PORT}`);
});
