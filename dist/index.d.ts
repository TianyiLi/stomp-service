/// <reference types="node" />
import { EventEmitter } from 'events';
import { StompConfig } from './stomp';
import { Message } from 'webstomp-client';
export declare enum StompServiceState {
    Close = 0,
    Connected = 1,
}
export declare let stompConfig: StompConfig;
export declare class StompService extends EventEmitter implements ServiceEvent {
    private _stomp;
    private _state;
    private _config;
    private _intervalTimer;
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
export interface ServiceEvent {
    on(state: 'connected', fn: () => void): any;
    on(state: 'error', fn: () => void): any;
    on(state: 'message', fn: (message: Message) => void): any;
    once(state: 'connected', fn: () => void): any;
    once(state: 'error', fn: () => void): any;
    once(state: 'message', fn: (message: Message) => void): any;
    emit(state: 'publish', data: any): any;
}
