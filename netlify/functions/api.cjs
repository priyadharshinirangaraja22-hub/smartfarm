const serverless = require("serverless-http");
const app = require("../../server/server.js");

const handler = serverless(app);

if (typeof module !== "undefined" && module.exports) {
  module.exports.handler = handler;
}
if (typeof exports !== "undefined") {
  exports.handler = handler;
}
