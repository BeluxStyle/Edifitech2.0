import { Server as IOServer } from 'socket.io'
import { NextApiResponse } from 'next'
import { Socket } from 'net'

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: {
      io?: IOServer
    }
  }
}
