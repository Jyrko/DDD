const fastify = require("fastify")({ logger: true });

module.exports = (routing, port, console) => {
  fastify.register(require("@fastify/websocket"), {
    options: {
      maxPayload: 1048576,
      method: ["GET"],
    },
  });

  fastify.register(async function (fastify) {
    fastify.get("/*", { websocket: true }, async (connection, req) => {
        const ip = req.socket.remoteAddress;
        connection.socket.on("message", async (message) => {
            const obj = JSON.parse(message);
            const { name, method, args = [] } = obj;
            const entity = routing[name];
            if (!entity) {
                connection.socket.send('"Not found"', { binary: false });
                return;
            }
            const handler = entity[method];
            if (!handler) {
                connection.socket.send('"Not found"', { binary: false });
                return;
            }
            const json = JSON.stringify(args);
            const parameters = json.substring(1, json.length - 1);
            console.log(`${ip} ${name}.${method}(${parameters})`);
            try {
                const result = await handler(...args);
                connection.socket.send(JSON.stringify(result.rows), { binary: false });
            } catch (err) {
                console.error(err);
                connection.socket.send('"Server error"', { binary: false });
            }
        });
    
      });
  })

  fastify.listen(port, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`API on port ${port}`);
  });
};
