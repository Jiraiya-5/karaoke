import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { io } from 'socket.io-client'
import { usePlayerStore } from './player'
import { useUserStore } from './user'
import { useUtilsStore } from './utils'

export const useSocketStore = defineStore('socket', () => {
  const storedSocket = JSON.parse(localStorage.getItem('ekiPersistedSocket'))

  const socketOnline = ref(false)
  const controlRoom = ref(storedSocket?.controlRoom ?? null)
  const listeningToControlRoom = ref(false)
  const controlConnected = ref(false)
  const controls = ref([])
  const mainControl = ref(null)
  let lastRemotePlayAt = 0
  const REMOTE_PLAY_MS = 350

  const utilsX = useUtilsStore()
  const playerX = usePlayerStore()
  const userX = useUserStore()

  // Detectar si estamos en el celular
  const isRemoteControl = () => window.location.pathname.includes('/control/')
  const getRemoteRoomCode = () => window.location.pathname.split('/').pop()

  watch(
    () => controlRoom.value,
    (newRoom) => {
      if (newRoom === null) disconnectControl()
      localStorage.setItem('ekiPersistedSocket', JSON.stringify({ controlRoom: newRoom }))
    }
  )

  // Conectar / desconectar según el login
  watch(
    [() => userX.isLoggedIn, () => userX.firebaseUser],
    ([isLogged]) => {
      if (isLogged && !isRemoteControl()) socket.connect()
    }
  )

  // Emitir el estado del reproductor a los controles (solo si es PC)
  watch(
    () => playerX.controlState,
    () => {
      if (!isRemoteControl() && controlConnected.value) {
        socket.emit('roomMessage', {
          type: 'player/updateState',
          data: playerX.controlState
        })
      }
    },
    { deep: true }
  )

  const socket = io('http://192.168.10.191:3000', {
    reconnectionDelayMax: 10000,
    transports: ['polling', 'websocket'],
    autoConnect: false
  })

  socket.on('notification', async ({ type, data }) => {
    console.log(`📩 Notificación recibida: ${type}`, data)

    switch (type) {
      case 'connected':
        socketOnline.value = true
        if (controlRoom.value != null && !isRemoteControl()) connectControl(controlRoom.value)
        break

      case 'socket/joinedControlRoom':
        if (controlRoom.value === data) {
          listeningToControlRoom.value = true
          socket.emit('roomMessage', {
            type: 'socket/setPlayerConnected',
            data: { sender: socket.id, value: true }
          })
        }
        break

      case 'socket/someoneWentOffline':
        if (controls.value.includes(data.id)) {
          controls.value.splice(controls.value.indexOf(data.id), 1)
          if (controls.value.length === 0) {
            utilsX.setNotif({ title: 'control.remote', message: 'control.noMoreControls', type: 'info' })
            controlConnected.value = false
            mainControl.value = null
          } else if (data.id === mainControl.value) {
            mainControl.value = controls.value[0]
            socket.emit('directMessage', {
              type: 'socket/setMainControl',
              to: mainControl.value,
              data: true
            })
          }
        }
        break

      case 'socket/setControlConnected':
        if (!controls.value.includes(data.sender)) {
          if (!controlConnected.value) controlConnected.value = true
          controls.value.push(data.sender)
          const isMain = mainControl.value === null
          if (isMain) {
            mainControl.value = data.sender
            utilsX.setNotif({ title: 'control.remote', message: 'control.newMainControlConnected', type: 'info' })
          } else {
            utilsX.setNotif({ title: 'control.remote', message: 'control.newControlConnected', type: 'info' })
          }
          socket.emit('directMessage', {
            type: 'socket/setPlayerConnected',
            to: data.sender,
            data: { sender: socket.id, value: true, mainControl: isMain }
          })
          socket.emit('directMessage', {
            type: 'player/updateState',
            to: data.sender,
            data: playerX.controlState
          })
        }
        break

      case 'player/callPlayerFunction':
        if (isRemoteControl()) return
        console.log(`🎮 Ejecutando: ${data.functionName}`, data.param)
        if (typeof playerX[data.functionName] === 'function') {
          if (['playKeepingQueue', 'play'].includes(data.functionName)) {
            const now = Date.now()
            if (now - lastRemotePlayAt < REMOTE_PLAY_MS) break
            lastRemotePlayAt = now
          }
          playerX[data.functionName](data.param, data.param2)
        }
        break

      case 'player/callPlayerReactions':
        if (isRemoteControl()) return
        if (typeof utilsX[data.functionName] === 'function') {
          utilsX[data.functionName](data.param, data.param2)
        }
        break

      case 'player/updateState':
  if (isRemoteControl() && data) {
    console.log('📊 Estado del reproductor recibido:', data)
    
    // Actualizar el estado local en el celular
    if (data.currentSong) {
      playerX.currentSong = data.currentSong
    }
    playerX.playing = data.playing
    playerX.volume = data.volume
    if (data.songProgress !== undefined) playerX.songProgress = data.songProgress
    if (data.songSeconds !== undefined) playerX.songSeconds = data.songSeconds
    if (data.queue) playerX.queue = data.queue
  }
  break

      // 👇 NUEVO: La PC recibe la petición del token y lo envía
      case 'socket/requestTokenForControl':
        if (!isRemoteControl()) {
          console.log('📤 Enviando token al celular...')
          socket.emit('sendTokenToControl', {
            controlSocketId: data.controlSocketId,
            token: userX.tokens.token,
            user: userX.apiUser
          })
        }
        break

      // 👇 NUEVO: El celular recibe el token y lo guarda
      case 'socket/receiveToken':
  if (isRemoteControl()) {
    console.log('🔑 Token recibido de la PC')
    
    // 👇 Verificar si ya tenemos el token para no recargar en bucle
    const currentUser = JSON.parse(localStorage.getItem('ekiAppUser') || '{}')
    
    if (!currentUser.token) {
      localStorage.setItem('ekiAppUser', JSON.stringify({
        token: data.token,
        user: data.user,
        isSubscribed: true
      }))
      
      // Recargar solo si no teníamos token antes
      window.location.reload()
    } else {
      console.log('✅ Ya teníamos token, no recargamos')
    }
  }
  break
    }
  })

  socket.on('connect', () => console.log('🟢 Conectado al socket'))
  socket.on('disconnect', () => {
    console.log('🔴 Desconectado del socket')
    socketOnline.value = false
    listeningToControlRoom.value = false
    controlConnected.value = false
  })

  function connectControl(roomCode) {
    if (!roomCode) return
    if (socket.connected && controlRoom.value === roomCode) return

    controlRoom.value = roomCode

    if (!socket.connected) {
      socket.connect()
    }

    if (socket.connected) {
      socket.emit('joinControl', roomCode)
    } else {
      socket.once('connect', () => {
        socket.emit('joinControl', roomCode)
      })
    }
  }

  function disconnectControl() {
    if (controlRoom.value && socketOnline.value) {
      socket.emit('playerDisconnectIntentional', { reason: 'Sala regenerada' })
    }
    socket.disconnect()
    listeningToControlRoom.value = false
    controlConnected.value = false
    controls.value = []
    mainControl.value = null
  }

  // 👇 INICIALIZACIÓN DEL MODO CONTROL REMOTO
  function initControlMode() {
  if (isRemoteControl()) {
    const roomCode = getRemoteRoomCode()
    console.log('📱 Modo Control Remoto Activado. Sala:', roomCode)
    
    // 👇 Verificar si ya tenemos token
    const currentUser = JSON.parse(localStorage.getItem('ekiAppUser') || '{}')
    
    if (!socket.connected) {
      socket.connect()
    }
    
    if (socket.connected) {
      socket.emit('joinAsControl', roomCode)
      
      // 👇 Solo pedir token si no tenemos uno
      if (!currentUser.token) {
        socket.emit('requestToken', roomCode)
      }
    } else {
      socket.once('connect', () => {
        socket.emit('joinAsControl', roomCode)
        
        if (!currentUser.token) {
          socket.emit('requestToken', roomCode)
        }
      })
    }
  }
}

  initControlMode()

  return {
    socketOnline,
    controlRoom,
    controlConnected,
    listeningToControlRoom,
    controls,
    mainControl,
    emit: (type, data) => socket.emit(type, data),
    connectControl,
    disconnectControl
  }
})