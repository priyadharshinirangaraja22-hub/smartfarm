const serverless = require("serverless-http");
const app = require("../../server/server.js");

exports.handler = serverless(app);
