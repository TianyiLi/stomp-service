/// <reference types="node" />
import { EventEmitter } from 'events';
import { StompConfig } from './stomp';
import { Message } from 'webstomp-client';
export declare enum StompServiceState {
    Close = 0,
    Connected = 1,
}
export declare let stompConfig: StompConfig;
export declare class StompService extends EventEmitter implements IServiceEvent {
    private _stomp;
    private _state;
    private _config;
    private _intervalTimer;
    constructor();
    publishChannels: string[];
    /**
     * Set configuration
     *
     * @param config
     */
    configure(config: StompConfig): void;
    /**
     * Start the service
     * @event StompService#connected
     */
    start: (isTest?: boolean) => Promise<boolean>;
    /**
     * Receive the message from broker, emit JSON data to the listener
     *
     * @fires StompService#message
     * @memberof StompService
     */
    onMessageHandler: (message: Message) => void;
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
    readonly unsubscribe: (channel: string) => Boolean;
    subscribe(channel: string): void;
    errorCollector: (data: any) => void;
    status: () => StompServiceState;
}
export interface IServiceEvent {
    on(state: 'connected', fn: () => void): any;
    on(state: 'error', fn: () => void): any;
    on(state: 'message', fn: (message: Message) => void): any;
    once(state: 'connected', fn: () => void): any;
    once(state: 'error', fn: () => void): any;
    once(state: 'message', fn: (message: Message) => void): any;
    emit(event: 'publish', data: any): any;
}
