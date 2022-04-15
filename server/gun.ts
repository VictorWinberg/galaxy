const http = require("http");
const Gun = require("gun");

const server = http.createServer();

const gun = Gun({ web: server });

const PORT = process.env.GUN_PORT || 8080;

server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
