import { STOMP_CONFIG } from './stomp.config';
import { EventEmitter } from 'events';
import { STOMP, StompConfig } from './stomp';
import { Message } from 'webstomp-client'

export enum StompServiceState {
  Close,
  Connected
}
export let stompConfig = STOMP_CONFIG
export class StompService extends EventEmitter implements ServiceEvent {
  private _stomp = new STOMP();
  private _state = StompServiceState.Close;
  private _config = STOMP_CONFIG
  private _intervalTimer:NodeJS.Timer = undefined

  constructor() {
    super();
  }

  configure(config: StompConfig) {
    this._config = Object.assign({}, this._config, config)
  }

  start = async (isTest = false) => {
    // config
    let config = this._config
    // when test
    if (isTest) {
      config.debug = true
    }
    this._stomp.configure(config);
    let process = await this._stomp.try_connect(this.onMessageHandler)
      .then(() => {
        /**
         * When STOMP service already connect
         */
        this._state = StompServiceState.Connected;
        this.emit('connected', {})
        this._intervalTimer = setInterval(() => {
          this._stomp.publish('{}', ['/topic/heartbeat'])
        }, config.heartbeat_out)
        return true
      })
    this.on('publish', this.onPublishHandler)
    this.on('error', this.errorCollector)
    return process;
  }

  /**
   * Receive the message from broker, emit JSON data to the listener
   * 
   * 
   * @memberof StompService
   */
  onMessageHandler = (message) => {
    if (!message.body) console.log("Empty message receive");
    else {
      let data = JSON.parse(message.body);
      this.emit('message', data);
    }
  }

  /**
   * Handling the publish message, translate data to string file
   * 
   * 
   * @memberof StompService
   */
  onPublishHandler = (data) => {
    let d = data instanceof Object ? data : JSON.parse(data);
    let publish_channel = this._config.publish;
    d.src = 'node-payment'
    this._stomp.publish(d, publish_channel)
  }

  /**
   * disconnect stomp service
   * 
   * 
   * @memberof StompService
   */
  disconnect = () => {
    this._stomp.disconnect('Stomp Service end')
    this._state = StompServiceState.Close;
    clearInterval(this._intervalTimer)
  }

  errorCollector = (data) => {
    console.log(data)
  }

  status = () => {
    return this._state;
  }
}
export interface ServiceEvent {
  on(state: 'connected', fn: () => void)
  on(state: 'error', fn: () => void)
  on(state: 'message', fn: (message: Message) => void)

  once(state: 'connected', fn: () => void)
  once(state: 'error', fn: () => void)
  once(state: 'message', fn: (message: Message) => void)

  emit(state: 'publish', data: any)
}