"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stomp = require("webstomp-client");
const WebSocket = require("ws");
class STOMP {
    constructor() {
        this._subscribeList = [];
        this._websocket = undefined;
        this.unsubscribe = (channel) => {
            let element = this._subscribeList.find(ele => ele.content === channel);
            if (!~this._subscribeList.indexOf(element)) {
                this._client.unsubscribe(element.id);
                this._subscribeList.splice(this._subscribeList.indexOf(element), 1);
                return true;
            }
            else
                return false;
        };
        // Callback run on successfully connecting to server
        this.on_connect = () => {
            // Indicate our connected state to observers
            this.state = STOMPState.CONNECTED;
            // Subscribe to message queues
            this.subscribe();
            // Resolve our Promise to the caller
            this._resolvePromise();
            // Clear callback
            this._resolvePromise = null;
        };
        // Handle errors from stomp.js
        this.on_error = (error) => {
            // Check for dropped connection and try reconnecting
            if (error) {
                // Reset state indicator
                this.state = STOMPState.CLOSED;
                // Attempt reconnection
                console.log('Reconnecting in 0.5 seconds...');
                setTimeout(() => {
                    this.configure();
                    this.try_connect(this._connectCallBack);
                }, 500);
            }
        };
        this.state = STOMPState.CLOSED;
    }
    /** Set up configuration */
    configure(config) {
        // Check for errors:
        if (this.state !== STOMPState.CLOSED) {
            throw Error('Already running!');
        }
        if (config === null && this._config === null) {
            throw Error('No configuration provided!');
        }
        // Set our configuration
        if (config != null) {
            this._config = config;
        }
        // Connecting via SSL Websocket?
        let scheme = 'ws';
        if (this._config.ssl) {
            scheme = 'wss';
        }
        // Attempt connection, passing in a callback
        this._websocket = new WebSocket(`${scheme}://${this._config.host}:${this._config.port}${this._config.path}`);
        this._client = Stomp.over(this._websocket, {
            heartbeat: { outgoing: this._config.heartbeat_out, incoming: this._config.heartbeat_in },
            debug: this._config.debug,
            binary: false,
            protocols: [this._config.port.toString()]
        });
    }
    /**
     * Perform connection to STOMP broker, returning a Promise
     * which is resolved when connected.
     *
     * The CallBack function is used when the subscribed channel
     *  send data that the fn should do.
     *
     * @param {(message: Stomp.Message) => any} callback
     * @returns {Promise<{}>}
     *
     * @memberOf STOMPService
     */
    try_connect(callback) {
        if (this.state !== STOMPState.CLOSED) {
            throw Error('Can\'t try_connect if not CLOSED!');
        }
        if (this._client === null) {
            throw Error('Client not configured!');
        }
        this._connectCallBack = callback;
        // Attempt connection, passing in a callback
        this._client.connect(this._config.user, this._config.pass, this.on_connect, this.on_error);
        this.state = STOMPState.TRYING;
        return new Promise((resolve, reject) => this._resolvePromise = resolve);
    }
    /** Disconnect the STOMP client and clean up */
    disconnect(message) {
        // Notify observers that we are disconnecting!
        this.state = STOMPState.DISCONNECTING;
        // Disconnect. Callback will set CLOSED state
        if (this._client) {
            return new Promise((resolve, reject) => {
                this._client.disconnect(() => {
                    this.state = STOMPState.CLOSED;
                    this._websocket.close();
                    resolve();
                });
            });
        }
        else {
            return Promise.reject('No connection');
        }
    }
    /** Send a message to all topics */
    publish(message, publish = this._config.publish) {
        for (let t of publish) {
            this._client.send(t, JSON.stringify(message));
        }
    }
    /** Subscribe to server message queues */
    subscribe(channel) {
        if (channel && !this._subscribeList.find(ele => ele.content === channel)) {
            let subscribeId = this._client.subscribe(channel, this._connectCallBack, { ack: 'auto' });
            this._subscribeList.push({ id: subscribeId, content: channel });
            return;
        }
        // Subscribe to our configured queues
        for (let t of this._config.subscribe) {
            let subscribeId = this._client.subscribe(t, this._connectCallBack, { ack: 'auto' });
            this._subscribeList.push({ id: subscribeId, content: t });
        }
        // Update the state
        if (this._config.subscribe.length > 0) {
            this.state = STOMPState.SUBSCRIBED;
        }
    }
    /**
     * Callback Functions
     *
     * Note the method signature: () => preserves lexical scope
     * if we need to use this.x inside the function
     */
    debug(...args) {
        // Push arguments to this function into console.log
        if (console.log && console.log.apply) {
            console.log.apply(console, args);
        }
    }
}
exports.STOMP = STOMP;
;
/** possible states for the STOMP service */
var STOMPState;
(function (STOMPState) {
    STOMPState[STOMPState["CLOSED"] = 0] = "CLOSED";
    STOMPState[STOMPState["TRYING"] = 1] = "TRYING";
    STOMPState[STOMPState["CONNECTED"] = 2] = "CONNECTED";
    STOMPState[STOMPState["SUBSCRIBED"] = 3] = "SUBSCRIBED";
    STOMPState[STOMPState["DISCONNECTING"] = 4] = "DISCONNECTING";
})(STOMPState = exports.STOMPState || (exports.STOMPState = {}));
;
/** look up states for the STOMP service */
exports.StateLookup = [
    'CLOSED',
    'TRYING',
    'CONNECTED',
    'SUBSCRIBED',
    'DISCONNECTING'
];
//# sourceMappingURL=stomp.js.map