import * as Stomp from 'webstomp-client';
export declare class STOMP {
    state: STOMPState;
    messages: Stomp.Message;
    private _config;
    private _client;
    private _resolvePromise;
    private _connectCallBack;
    private _subscribeList;
    private _websocket;
    constructor();
    /** Set up configuration */
    configure(config?: StompConfig): void;
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
    try_connect(callback: (message: Stomp.Message) => void): Promise<{}>;
    /** Disconnect the STOMP client and clean up */
    disconnect(message?: string): Promise<void>;
    /** Send a message to all topics */
    publish(message: string, publish?: string[]): void;
    /** Subscribe to server message queues */
    subscribe(channel?: string): void;
    unsubscribe: (channel: string) => Boolean;
    /**
     * Callback Functions
     *
     * Note the method signature: () => preserves lexical scope
     * if we need to use this.x inside the function
     */
    debug(...args: any[]): void;
    on_connect: () => void;
    on_error: (error: any) => void;
}
/**
 * Represents a configuration object for the
 * STOMPService to connect to, pub, and sub.
 */
export interface StompConfig {
    host: string;
    port: number;
    ssl: boolean;
    user: string;
    pass: string;
    publish: string[];
    subscribe: string[];
    heartbeat_in?: number;
    heartbeat_out?: number;
    debug: boolean;
    src?: string;
    /**
     * @desc which place, default to /stomp/websocket
     */
    path: string;
}
/** possible states for the STOMP service */
export declare enum STOMPState {
    CLOSED = 0,
    TRYING = 1,
    CONNECTED = 2,
    SUBSCRIBED = 3,
    DISCONNECTING = 4,
}
/** look up states for the STOMP service */
export declare const StateLookup: string[];
