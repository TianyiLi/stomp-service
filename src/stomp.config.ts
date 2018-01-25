import { StompConfig } from './stomp';
export let STOMP_CONFIG: StompConfig = {
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
}