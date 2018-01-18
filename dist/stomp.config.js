"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOMP_CONFIG = {
    host: "0.0.0.0",
    port: 61614,
    ssl: false,
    user: "user",
    pass: "password",
    subscribe: ["/topic/app"],
    publish: ["/queue/app"],
    heartbeat_in: 0,
    heartbeat_out: 20000,
    debug: false,
    src: 'smc'
};
//# sourceMappingURL=stomp.config.js.map