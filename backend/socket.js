import { Server } from 'socket.io'
import pool from './config/database.js'

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://192.168.10.191:5173'
      ],
      methods: ['GET', 'POST']
    }
  })

  // Mapa de salas activas: { roomCode: { player: socketId, controls: [socketId] } }
  const rooms = new Map()

  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado:', socket.id)

    // ============================================================
    // 1. EL REPRODUCTOR (PC) SE UNE A UNA SALA
    // ============================================================
    socket.on('joinControl', (roomCode) => {
      console.log(`🎮 Recibido joinControl para sala: ${roomCode}`)
      
      if (!roomCode) {
        console.log('❌ joinControl sin roomCode')
        return
      }
      
      socket.join(roomCode)
      
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, { player: null, controls: [] })
      }
      
      rooms.get(roomCode).player = socket.id
      console.log(`🎮 Reproductor unido a sala ${roomCode}`)
      
      socket.emit('notification', {
        type: 'socket/joinedControlRoom',
        data: roomCode
      })
    })

    // ============================================================
    // 2. EL CELULAR SE UNE A UNA SALA
    // ============================================================
    socket.on('joinAsControl', (roomCode) => {
      console.log(`📱 Recibido joinAsControl para sala: ${roomCode}`)
      
      if (!roomCode) {
        console.log('❌ joinAsControl sin roomCode')
        return
      }
      
      socket.join(roomCode)
      
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, { player: null, controls: [] })
      }
      
      const room = rooms.get(roomCode)
      
      if (!room.controls.includes(socket.id)) {
        room.controls.push(socket.id)
      }
      
      console.log(`📱 Control unido a sala ${roomCode}`)
      
      // Notificar al reproductor y pedirle el token
      if (room.player) {
        // 1. Avisar de que hay un control conectado
        io.to(room.player).emit('notification', {
          type: 'socket/setControlConnected',
          data: { sender: socket.id }
        })

        // 2. 👇 PEDIR EL TOKEN A LA PC PARA QUE EL CELULAR PUEDA NAVEGAR
        io.to(room.player).emit('notification', {
          type: 'socket/requestTokenForControl',
          data: { controlSocketId: socket.id }
        })
      }
    })

    // ============================================================
    // 3. LA PC ENVÍA EL TOKEN AL CELULAR
    // ============================================================
    socket.on('sendTokenToControl', ({ controlSocketId, token, user }) => {
      console.log(`📤 Enviando token al control ${controlSocketId}`)
      io.to(controlSocketId).emit('notification', {
        type: 'socket/receiveToken',
        data: { token, user }
      })
    })

    // ============================================================
    // 4. EL REPRODUCTOR ENVÍA SU ESTADO
    // ============================================================
    socket.on('roomMessage', ({ type, data }) => {
      const roomEntry = Array.from(rooms.entries()).find(
        ([code, r]) => r.player === socket.id
      )
      
      if (roomEntry) {
        const [roomCode, room] = roomEntry
        room.controls.forEach(controlId => {
          io.to(controlId).emit('notification', { type, data })
        })
      }
    })

    // ============================================================
    // 5. EL CELULAR ENVÍA UN COMANDO AL REPRODUCTOR
    // ============================================================
    socket.on('controlCommand', ({ roomCode, functionName, param, param2 }) => {
      console.log(`🎮 Comando: ${functionName} en sala ${roomCode}`)
      
      const room = rooms.get(roomCode)
      if (room && room.player) {
        io.to(room.player).emit('notification', {
          type: 'player/callPlayerFunction',
          data: { functionName, param, param2 }
        })
      } else {
        console.log(`❌ Sala no encontrada o sin reproductor: ${roomCode}`)
      }
    })

    // ============================================================
    // 6. EL CELULAR ENVÍA UNA REACCIÓN
    // ============================================================
    socket.on('controlReaction', ({ roomCode, functionName, param, param2 }) => {
      const room = rooms.get(roomCode)
      if (room && room.player) {
        io.to(room.player).emit('notification', {
          type: 'player/callPlayerReactions',
          data: { functionName, param, param2 }
        })
      }
    })

    // ============================================================
    // 7. DESCONEXIÓN
    // ============================================================
    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado:', socket.id)
      
      for (const [roomCode, room] of rooms.entries()) {
        if (room.player === socket.id) {
          room.player = null
          room.controls.forEach(controlId => {
            io.to(controlId).emit('notification', {
              type: 'socket/playerDisconnected',
              data: {}
            })
          })
          if (room.controls.length === 0) rooms.delete(roomCode)
        } else if (room.controls.includes(socket.id)) {
          room.controls = room.controls.filter(id => id !== socket.id)
          if (room.player) {
            io.to(room.player).emit('notification', {
              type: 'socket/someoneWentOffline',
              data: { id: socket.id }
            })
          }
          if (room.controls.length === 0 && !room.player) rooms.delete(roomCode)
        }
      }
    })


    socket.on('requestToken', (roomCode) => {
  const room = rooms.get(roomCode)
  if (room && room.player) {
    io.to(room.player).emit('notification', {
      type: 'socket/requestTokenForControl',
      data: { controlSocketId: socket.id }
    })
  }
})

  })

  return io
}