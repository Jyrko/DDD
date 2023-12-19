'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const load = require('./load.js');
const db = require('./db.js');
const hash = require('./hash.js');
const config = require('./config/config.js');
const server = require(`./transport/${config.api.framework}/${config.api.transport}.js`);
const staticServer = require('./static.js');

let logger;
if (config.api.logger === "custom") {
  logger = require("./logger.js");
} else {
  logger = require("pino")();
  logger.log = logger.info;
}

const apiPath = path.join(process.cwd(), config.api.path);
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith('.js')) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, '.js');
    routing[serviceName] = await require(filePath);
  }

  staticServer(config.static.path, config.static.port);
  server(routing, config.api.port, logger);
})();
