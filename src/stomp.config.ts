import { StompConfig } from './stomp';
export let STOMP_CONFIG: StompConfig = {
  host: "0.0.0.0",
  port: 61614,
  ssl: false,

  user: "user",
  pass: "password",

  subscribe: ["/topic/app"],
  publish: ["/queue/app"],

  heartbeat_in: 0,
  heartbeat_out: 20000,

  debug: false,
  src:'smc'
}