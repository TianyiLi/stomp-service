"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const stomp_config_1 = require("./stomp.config");
const events_1 = require("events");
const stomp_1 = require("./stomp");
var StompServiceState;
(function (StompServiceState) {
    StompServiceState[StompServiceState["Close"] = 0] = "Close";
    StompServiceState[StompServiceState["Connected"] = 1] = "Connected";
})(StompServiceState = exports.StompServiceState || (exports.StompServiceState = {}));
exports.stompConfig = stomp_config_1.STOMP_CONFIG;
class StompService extends events_1.EventEmitter {
    constructor() {
        super();
        this._stomp = new stomp_1.STOMP();
        this._state = StompServiceState.Close;
        this._config = stomp_config_1.STOMP_CONFIG;
        this.start = (isTest = false) => __awaiter(this, void 0, void 0, function* () {
            // config
            let config = this._config;
            // when test
            if (isTest) {
                config.debug = true;
            }
            this._stomp.configure(config);
            let process = yield this._stomp.try_connect(this.onMessageHandler)
                .then(() => {
                /**
                 * When STOMP service already connect
                 */
                this._state = StompServiceState.Connected;
                setInterval(() => {
                    this._stomp.publish('{}', ['/topic/heartbeat']);
                }, config.heartbeat_out);
                return true;
            });
            this.on('publish', this.onPublishHandler);
            this.on('error', this.errorCollector);
            return process;
        });
        /**
         * Receive the message from broker, emit JSON data to the listener
         *
         *
         * @memberof StompService
         */
        this.onMessageHandler = (message) => {
            if (!message.body)
                console.log("Empty message receive");
            else {
                let data = JSON.parse(message.body);
                this.emit('message', data);
            }
        };
        /**
         * Handling the publish message, translate data to string file
         *
         *
         * @memberof StompService
         */
        this.onPublishHandler = (data) => {
            let d = data instanceof Object ? data : JSON.parse(data);
            let publish_channel = stomp_config_1.STOMP_CONFIG.publish;
            d.src = 'node-payment';
            this._stomp.publish(d, publish_channel);
        };
        /**
         * disconnect stomp service
         *
         *
         * @memberof StompService
         */
        this.disconnect = () => {
            this._stomp.disconnect('Stomp Service end');
            this._state = StompServiceState.Close;
        };
        this.errorCollector = (data) => {
            console.log(data);
        };
        this.status = () => {
            return this._state;
        };
    }
    configure(config) {
        this._config = Object.assign({}, config, this._config);
    }
}
exports.StompService = StompService;
//# sourceMappingURL=index.js.map