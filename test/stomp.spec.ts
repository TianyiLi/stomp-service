import 'mocha'
import * as assert from 'assert'
import { StompService, stompConfig, StompServiceState } from '../src/index';
import * as merge from 'merge'
import * as Stomp from 'stomp-broker-js'
import * as http from 'http'
const EXPECTED_TIMEOUT = 2000
let client = new StompService()
let client2 = new StompService()
let server = http.createServer()
let stompServer = new Stomp({ server, debug () { process.env.NODE_DEBUG && console.log(arguments) } }, ['/stomp', '/stomp/websocket'])
describe('StompServiceTest', () => {
  before(async () => {
    stompServer.start()
    stompServer.on('error', console.log.bind(console))
    server.listen(61614)
    let config = stompConfig,
      config2 = merge(true, stompConfig)
    config.path = '/stomp'
    config.subscribe = ['/topic/app.test']
    config.publish = ['/queue/app.test']
    client.configure(config)
    config2.subscribe = ['/queue/app.test']
    config2.publish = ['/topic/app.test']
    config2.path = '/stomp'
    client2.configure(config2)
    await client2.start()
  })
  after(() => {
    client.disconnect()
    client2.disconnect()
    stompServer.removeAllListeners()
    server.close()
  })
  it('Service should emit connected when connection established', done => {
    client.once('connected', () => done())
    client.start()
  })
  it('Service state should on connected', () => {
    let state = client.status()
    assert.equal(state, StompServiceState.Connected)
  })
  it('Service should receive a message which from client2', done => {
    client.once('message', msg => done())
    client2.emit('publish', { e: 'test' })
  })
  it('service should be able get text massage', (done) => {
    client.once('message', msg => {
      assert.equal(msg, 'ok')
      done()
    })
    client2.emit('publish', 'ok')
  })
  it('Service should be able to subscribe a new Channel', done=>{
    client.subscribe('/topic/app.test2')
    client.once('message', msg => done())
    let chns = client2.publishChannels
    chns.push('/topic/app.test2')
    client2.emit('publish', {e:'test'})
  })
  it('Service should be able to unsubscribe a channel', function(done){
    this.timeout(EXPECTED_TIMEOUT+100)
    setTimeout(done, EXPECTED_TIMEOUT)
    client.unsubscribe('/topic/app.test2')
    client.once('message', msg=> done())
    client2.emit('publish', {e:"test", _channel:'/queue/app.test2'})
  })
})