import { defineStore } from "pinia";
import { ref } from "vue";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useUserStore } from "@/stores/user";

import {
  //Auth utils
  getAuth,
  onAuthStateChanged,
  updateProfile,
  signOut,
  //for google login/register)
  GoogleAuthProvider,
  signInWithPopup,
  //for email & pass login/register
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  //for appleId login/register
} from "firebase/auth";

export const useFirebaseStore = defineStore("firebase", () => {
  const fbConfig = ref({
    apiKey: "AIzaSyD7S-AyXudSX7rXOV8eaoveotkHwXL7IQ8",
    authDomain: "ekinternacional-358f5.firebaseapp.com",
    projectId: "ekinternacional-358f5",
    storageBucket: "ekinternacional-358f5.appspot.com",
    messagingSenderId: "631750120899",
    appId: "1:631750120899:web:cfc8ee53fb71c74faf1976",
  });

  const app = initializeApp(fbConfig.value);
  const messaging = getMessaging(app);
  const auth = getAuth(app);
  const userX = useUserStore();

  const checkApiUserInterval = ref(null);

  function sendResponse(status, data) {
    return { success: status, data: data };
  }

  function listenAuthChanges() {
    onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          userX.setFirebaseUser(user);
        }
      },
      () => {
        //Have to Logout
        userX.setFirebaseUser(null);
      }
    );
  }

  async function requestPermission() {
    if (checkApiUserInterval.value === null) {
      checkApiUserInterval.value = setInterval(async () => {
        if (userX.isLoggedIn) {
          const permission = await Notification.requestPermission();

          console.log(permission);

          if (permission === "granted") {
            console.log("Notification permission granted.");
            loadToken();
          } else {
            console.log("Do not have permission!");
          }

          console.log("interval val", checkApiUserInterval.value);

          clearInterval(checkApiUserInterval.value);
        } else {
          console.log("userX not logged in");
        }
      }, 5000);
    }
  }

  async function loadToken() {
    let KEY_PAIR = `${import.meta.env.VITE_APP_FCM_KEY_PAIR}`;

    getToken(messaging, { vapidKey: KEY_PAIR })
      .then(async (currentToken) => {
        if (currentToken) {
          console.log("client token", currentToken);

          const { useRequesterStore } = await import("@/stores/requester");

          const requesterX = useRequesterStore();

          let send = {
            fcmToken: currentToken,
          };

          let check = await requesterX.Post({
            route: "/fcm-token",
            withAuth: true,
            body: send,
          });

          if (check.status === 200) {
            console.log("Done save or update token");
          }
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
        }
      })
      .catch((err) => {
        console.error("An error occurred while retrieving token. ", err);

        // ? commented due to recursive errors
        // loadToken();
      });

    onMessage(messaging, async (payload) => {
      const { useUtilsStore } = await import("@/stores/utils");

      const utilsX = useUtilsStore();

      let notification = payload.notification;
      console.log(notification);

      utilsX.setNotif({
        title: notification.title,
        message: notification.body,
        type: "info",
        timeVisible: 5,
        position: "top-center",
      });
    });
  }

  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      return sendResponse(true, { user });
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          return sendResponse(false, { msg: "error.userNotFound" });
        case "auth/wrong-password":
          return sendResponse(false, { msg: "error.wrongPassword" });
        case "auth/invalid-email":
          return sendResponse(false, { msg: "error.invalidEmail" });

        default:
          return sendResponse(false, { msg: "error.something" });
      }
    }
  }

  async function googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser;
      return sendResponse(true, { user, msg: "auth.loginSuccess" });
    } catch (error) {
      console.error(error);
      return sendResponse(false, { msg: "error.something" });
    }
  }

  async function register(email, password, name) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      await updateProfile(user, {
        displayName: name,
      });
      return sendResponse(true, { user });
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          return sendResponse(false, { msg: "error.emailUsed" });
        case "auth/invalid-email":
          return sendResponse(false, { msg: "error.invalidEmail" });
        case "auth/weak-password":
          return sendResponse(false, { msg: "error.weakPassword" });

        default:
          return sendResponse(false, { msg: "error.something" });
      }
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      return sendResponse(true, { msg: "auth.logoutSuccess" });
    } catch (error) {
      console.error(error);
      return sendResponse(false, { msg: "error.something" });
    }
  }

  async function sendConfirmationCode() {
    try {
      const user = auth.currentUser;
      await sendEmailVerification(user);
      return sendResponse(true, { msg: "auth.verificationSended" });
    } catch (error) {
      console.error(error);
      return sendResponse(false, { msg: "error.something" });
    }
  }

  async function recover(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return sendResponse(true, { msg: "auth.recoverSended" });
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          return sendResponse(false, { msg: "error.userNotFound" });
        case "auth/invalid-email":
          return sendResponse(false, { msg: "error.invalidEmail" });

        default:
          return sendResponse(false, { msg: "error.something" });
      }
    }
  }

  async function passwordUpdate(password) {
    try {
      const user = auth.currentUser;
      await updatePassword(user, password);
      return sendResponse(true, { msg: "auth.changingPasswordSuccess" });
    } catch (error) {
      console.error(error);
      return sendResponse(false, { msg: "error.something" });
    }
  }

  return {
    messaging,
    login,
    googleLogin,
    register,
    logout,
    sendConfirmationCode,
    recover,
    passwordUpdate,
    listenAuthChanges,
    requestPermission,
  };
});
