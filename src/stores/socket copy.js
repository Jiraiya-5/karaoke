// Socket store for karaoke player application
// Manages real-time communication with control apps and server
import { io } from "socket.io-client";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { usePlayerStore } from "./player";
import { useUserStore } from "./user";
import { useUtilsStore } from "./utils";

export const useSocketStore = defineStore("socket", () => {
  // Restore socket state from localStorage
  const storedSocket = JSON.parse(localStorage.getItem("ekiPersistedSocket"));

  // Reactive state variables
  const socketOnline = ref(false);                    // Socket connection status
  const controlRoom = ref(storedSocket?.controlRoom ?? null);  // Current control room ID
  const listeningToControlRoom = ref(false);          // Whether listening to room events
  const controlConnected = ref(false);                // Whether any control is connected
  const controls = ref([]);                           // Array of connected control socket IDs
  const mainControl = ref(null);                      // ID of the main control device

  // Store references
  const utilsX = useUtilsStore();
  const playerX = usePlayerStore();
  const userX = useUserStore();

  // Watch for control room changes and persist to localStorage
  watch(
    () => controlRoom.value,
    (newRoom) => {
      // Disconnect when room is cleared
      if (newRoom === null) {
        disconnectControl();
      }
      
      // Persist room state to localStorage
      localStorage.setItem(
        "ekiPersistedSocket",
        JSON.stringify({
          controlRoom: newRoom,
        })
      );
    }
  );

  // Watch user authentication state to manage socket connection
  watch(
    [() => userX.isLoggedIn, () => userX.firebaseUser],
    ([isLogged, fbUser]) => {
      console.log(`Auth state changed - Logged in: ${isLogged}, Firebase user: ${!!fbUser}`);
      
      if (isLogged) {
        socket.connect();
      } else {
        socket.disconnect();
      }
    }
  );

  // Watch player state changes and broadcast to connected controls
  watch(
    () => playerX.controlState,
    (newState) => {
      if (controlConnected.value) {
        console.log("Broadcasting player state to controls");

        emit("roomMessage", {
          type: "player/updateState",
          data: playerX.controlState,
        });
      }
    },
    { deep: true }
  );

  // Initialize Socket.IO client (player doesn't need authentication token)
  const socket = io(import.meta.env.VITE_BROOM_SOCKET_ENDPOINT, {
    reconnectionDelayMax: 10000,
    transports: ["polling"],
    autoConnect: false,  // Manual connection control based on auth state
  });

  // Handle incoming notifications from server
  socket.on("notification", async ({ type, data }) => {
    console.log(`Received notification: ${type}`, data);

    switch (type) {
      // Socket connection established
      case "connected":
        socketOnline.value = true;
        // Auto-join control room if one was previously set
        if (controlRoom.value != null) {
          connectControl();
        }
        break;
      // Successfully joined a control room
      case "socket/joinedControlRoom":
        if (controlRoom.value === data) {
          listeningToControlRoom.value = true;
          // Announce player presence to all controls in the room
          emit("roomMessage", {
            type: "socket/setPlayerConnected",
            data: {
              sender: socket.id,
              value: true,
            },
          });
        }
        break;
      // Handle control device disconnection
      case "socket/someoneWentOffline":
        if (controls.value.includes(data.id)) {
          const index = controls.value.indexOf(data.id);
          controls.value.splice(index, 1);

          // Check if all controls disconnected
          if (controls.value.length === 0) {
            utilsX.setNotif({
              title: "control.remote",
              message: "control.noMoreControls",
              type: "info",
              timeVisible: 5,
              position: "top-center",
            });
            controlConnected.value = false;
            mainControl.value = null;
          } else if (data.id === mainControl.value) {
            // Reassign main control if the main control disconnected
            mainControl.value = controls.value[0];
            emit("directMessage", {
              type: "socket/setMainControl",
              to: mainControl.value,
              data: true,
            });
          }
        }
        break;
      // Handle new control device connection
      case "socket/setControlConnected":
        if (!controls.value.includes(data.sender)) {
          // Mark that we have controls connected
          if (!controlConnected.value) {
            controlConnected.value = true;
          }
          
          controls.value.push(data.sender);
          const isMain = mainControl.value === null;
          
          // Set first control as main control
          if (isMain) {
            mainControl.value = data.sender;
            utilsX.setNotif({
              title: "control.remote",
              message: "control.newMainControlConnected",
              type: "info",
              timeVisible: 5,
              position: "top-center",
            });
          } else {
            utilsX.setNotif({
              title: "control.remote",
              message: "control.newControlConnected",
              type: "info",
              timeVisible: 5,
              position: "top-center",
            });
          }

          // Send confirmation and current state to the new control
          emit("directMessage", {
            type: "socket/setPlayerConnected",
            to: data.sender,
            data: {
              sender: socket.id,
              value: true,
              mainControl: isMain,
            },
          });
          
          // Send current player state to the new control
          emit("directMessage", {
            type: "player/updateState",
            to: data.sender,
            data: playerX.controlState,
          });
        }
        break;
      // Execute player functions called from control devices
      case "player/callPlayerFunction":
        if (typeof playerX[data.functionName] === 'function') {
          playerX[data.functionName](data.param, data.param2);
        } else {
          console.warn(`Player function ${data.functionName} not found`);
        }
        break;
        
      // Execute utility functions (reactions, notifications) from controls
      case "player/callPlayerReactions":
        if (typeof utilsX[data.functionName] === 'function') {
          utilsX[data.functionName](data.param, data.param2);
        } else {
          console.warn(`Utils function ${data.functionName} not found`);
        }
        break;
    }
  });
  socket.on("connect", () => {
    console.log("connect");
  });
  socket.on("disconnect", (reason) => {
    console.log("disconnect", reason);
    socketOnline.value = false;
    listeningToControlRoom.value = false;
    controlConnected.value = false;
  });
  socket.on("connect_error", (error) => {
    console.log("conect", error);
  });
  socket.on("error", (error) => {
    console.log("error", error);
  });
  socket.on("ping", () => {
    console.log("ping");
  });
  socket.on("reconnect", (attempt) => {
    console.log("reconnect", attempt);
  });
  socket.on("reconnect_attempt", (attempt) => {
    console.log("reconnect_attempt", attempt);
  });
  socket.on("reconnect_error", (error) => {
    console.log("reconnect_error", error);
  });
  socket.on("reconnect_failed", () => {
    console.log("reconnect_failed");
  });

  function emit(type, data) {
    socket.emit(type, data);
  }

  // Connect to a control room
  function connectControl() {
    if (!listeningToControlRoom.value) {
      if (userX.isLoggedIn) {
        console.log(`Connecting to control room: ${controlRoom.value}`);
        socket.connect();
        emit("joinControl", controlRoom.value);
      } else {
        console.log("Cannot connect to control room - user not logged in");
        controlRoom.value = null;
      }
    } else {
      console.log("Already connected to control room");
    }
  }

  // Disconnect from control room and notify controls
  function disconnectControl() {
    // Emit intentional disconnection event before disconnecting
    if (controlRoom.value && socketOnline.value) {
      emit("playerDisconnectIntentional", {
        reason: "Player regenerating room or leaving intentionally"
      });
    }
    
    socket.disconnect();
    listeningToControlRoom.value = false;
    controlConnected.value = false;
    controls.value = [];
    mainControl.value = null;
  }

  return {
    socketOnline,
    controlRoom,
    controlConnected,
    listeningToControlRoom,
    controls,
    mainControl,
    emit,
    connectControl,
    disconnectControl
  };
});
