import { STOMP_CONFIG } from './stomp.config';
import { EventEmitter } from 'events';
import { STOMP, StompConfig } from './stomp';

export enum StompServiceState {
  Close,
  Connected
}
export let stompConfig = STOMP_CONFIG
export class StompService extends EventEmitter {
  private _stomp = new STOMP();
  private _state = StompServiceState.Close;
  private _config =  STOMP_CONFIG

  constructor() {
    super();
  }

  configure(config:StompConfig){
    this._config = Object.assign({}, config, this._config)
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
        setInterval(() => {
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
    let publish_channel = STOMP_CONFIG.publish;
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
  }

  errorCollector = (data) => {
    console.log(data)
  }

  status = () => {
    return this._state;
  }
}