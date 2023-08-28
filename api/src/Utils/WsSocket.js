const WebSocket = require("ws");

const wss = new WebSocket.Server({ port:8080 });

module.exports = wss