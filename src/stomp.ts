import * as Stomp from 'webstomp-client';
import * as WebSocket from 'ws'

export class STOMP {
  public state: STOMPState;
  public messages: Stomp.Message;
  private _config: StompConfig;
  private _client: Stomp.Client;
  private _resolvePromise: { (...args: any[]): void };
  private _connectCallBack: (mes: Stomp.Message) => any;
  private _subscribeList = []

  public constructor() {
    this.state = STOMPState.CLOSED;
  }

  /** Set up configuration */
  public configure(config?: StompConfig): void {

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
    this._client = Stomp.over(new WebSocket(`${scheme}://${this._config.host}:${this._config.port}/stomp/websocket`), {
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
  public try_connect(callback: (message: Stomp.Message) => void): Promise<{}> {

    if (this.state !== STOMPState.CLOSED) {
      throw Error('Can\'t try_connect if not CLOSED!');
    }
    if (this._client === null) {
      throw Error('Client not configured!');
    }

    this._connectCallBack = callback;

    // Attempt connection, passing in a callback
    this._client.connect(
      this._config.user,
      this._config.pass,
      this.on_connect,
      this.on_error
    );

    console.log('Connecting...');
    this.state = STOMPState.TRYING;

    return new Promise(
      (resolve, reject) => this._resolvePromise = resolve
    );
  }


  /** Disconnect the STOMP client and clean up */
  public disconnect(message?: string): void {

    // Notify observers that we are disconnecting!
    this.state = STOMPState.DISCONNECTING;

    // Disconnect. Callback will set CLOSED state
    if (this._client) {
      this._client.disconnect(
        () => this.state = STOMPState.CLOSED
      );
    }
  }


  /** Send a message to all topics */
  public publish(message: string, publish: string[] = this._config.publish): void {
    for (let t of publish) {
      this._client.send(t, JSON.stringify(message));
    }
  }


  /** Subscribe to server message queues */
  public subscribe(): void {

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
  public debug(...args: any[]): void {

    // Push arguments to this function into console.log
    if (console.log && console.log.apply) {
      console.log.apply(console, args);
    }
  }


  // Callback run on successfully connecting to server
  public on_connect = () => {
    console.log('Connected');
    // Indicate our connected state to observers
    this.state = STOMPState.CONNECTED;
    // Subscribe to message queues
    this.subscribe();
    // Resolve our Promise to the caller
    this._resolvePromise();
    // Clear callback
    this._resolvePromise = null;
  }


  // Handle errors from stomp.js
  public on_error = (error: any) => {
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
  }
}

/**
 * Represents a configuration object for the
 * STOMPService to connect to, pub, and sub.
 */
export interface StompConfig {
  // Which server?
  host: string;
  port: number;
  ssl: boolean;

  // What credentials?
  user: string;
  pass: string;

  // Which queues?
  publish: string[];
  subscribe: string[];

  // How often to heartbeat?
  heartbeat_in?: number;
  heartbeat_out?: number;

  // Enable client debugging?
  debug: boolean;

  // from where to publish
  src?: string;
};


/** possible states for the STOMP service */
export enum STOMPState {
  CLOSED,
  TRYING,
  CONNECTED,
  SUBSCRIBED,
  DISCONNECTING
};

/** look up states for the STOMP service */
export const StateLookup: string[] = [
  'CLOSED',
  'TRYING',
  'CONNECTED',
  'SUBSCRIBED',
  'DISCONNECTING'
];