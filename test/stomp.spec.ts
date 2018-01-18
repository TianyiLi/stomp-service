import 'mocha'
import * as assert from 'assert'
import { StompService, stompConfig, StompServiceState } from '../src/index';
import * as merge from 'merge'
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
    client.on('connected', () => done())
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
})