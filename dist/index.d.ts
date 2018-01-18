/// <reference types="node" />
import { EventEmitter } from 'events';
import { StompConfig } from './stomp';
export declare enum StompServiceState {
    Close = 0,
    Connected = 1,
}
export declare let stompConfig: StompConfig;
export declare class StompService extends EventEmitter {
    private _stomp;
    private _state;
    private _config;
    constructor();
    configure(config: StompConfig): void;
    start: (isTest?: boolean) => Promise<boolean>;
    /**
     * Receive the message from broker, emit JSON data to the listener
     *
     *
     * @memberof StompService
     */
    onMessageHandler: (message: any) => void;
    /**
     * Handling the publish message, translate data to string file
     *
     *
     * @memberof StompService
     */
    onPublishHandler: (data: any) => void;
    /**
     * disconnect stomp service
     *
     *
     * @memberof StompService
     */
    disconnect: () => void;
    errorCollector: (data: any) => void;
    status: () => StompServiceState;
}
