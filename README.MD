# Stomp-Service

Sample

### Start the Connection

```javascript
const { StompService } = require('stomp-service')
let client = new StompService()
client.configure({
  host: "localhost",
  port: 61614,
  ssl: false,

  user: "user",
  pass: "password",

  subscribe: ["/topic/app"],
  publish: ["/queue/app"],

  heartbeat_in: 0,
  heartbeat_out: 20000,

  debug: false,
  src: 'stomp',
  path: '/stomp/websocket'
})
client.once('connected', ()=>{
    console.log('connected')
})

// this would return Promise
client.start()

// or you can do
async function connect () {
    await client.start()
    return
}
```

### Subscribe/unsubscribe new channel

```javascript
// subscribe
client.subscribe('/topic/new.channel')

// unsubscribe
client.unsubscribe('/topic/new.channel')
```

### Publish message

```javascript
client.emit('publish', {test:'test'})

// with specific channel
client.emit('publish', {test:'test', _channel:'/topic/special'})
```

### On message receive

```javascript
// data is object
client.on('message', data => {
    /// do something
})
```
