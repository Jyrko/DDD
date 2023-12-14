'use strict';

module.exports = {
    api: {
        port: 8001,
        path: './api',
        transport: 'ws', // http or ws
    },
    static: {
        port: 8000,
        path: './static',
    },
    db: {
        host: '127.0.0.1',
        port: 5432,
        database: 'example',
        user: 'marcus',
        password: 'marcus',
    },
    load: { 
        timeout: 5000,
        displayErrors: false 
    },
    logger: {
        colors: {
            info: '\x1b[1;37m',
            debug: '\x1b[1;33m',
            error: '\x1b[0;31m',
            system: '\x1b[1;34m',
            access: '\x1b[1;38m',
        }
    },
}