import 'mocha'
import * as assert from 'assert'
import { StompService, stompConfig, StompServiceState } from '../src/index';
import * as merge from 'merge'
const EXPECTED_TIMEOUT = 2000
let client = new StompService()
let client2 = new StompService()
describe('StompServiceTest', () => {
  before(async () => {
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