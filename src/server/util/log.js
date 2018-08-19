import winston from 'winston'

winston.configure({
  transports: [ new (winston.transports.Console)({'timestamp': true}) ]
})

export const log = winston
