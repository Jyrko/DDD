const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const { receiveArgs } = require("../utils.js");

module.exports = (routing, port, console) => {
fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST"],
  });

  fastify.route({
    url: "/*",
    method: ["GET", "POST"],
    handler: async (req, res) => {
      const { url, socket } = req;
      const [name, method, id] = url.substring(1).split("/");
      const entity = routing[name];
      if (!entity) return void res.send("Not found");
      const handler = entity[method];
      if (!handler) return void res.send("Not found");
      const src = handler.toString();
      const signature = src.substring(0, src.indexOf(")"));
      const args = [];
      if (signature.includes("(id")) args.push(id);
      if (signature.includes("{")) args.push(await receiveArgs(req));
      console.log(`${socket.remoteAddress} ${method} ${url}`);
      const result = await handler(...args);
      res.send(result.rows);
    },
  });

  fastify.listen(port, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`API on port ${port}`);
  });
};
