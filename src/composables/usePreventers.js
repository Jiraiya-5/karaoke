import { watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter, useRoute } from "vue-router";
import { useUtilsStore } from "@/stores/utils";
import { usePlayerStore } from "@/stores/player";

export function usePreventers() {
  const utilsX = useUtilsStore();
  const userX = useUserStore();
  const router = useRouter();
  const route = useRoute();
  const playerX = usePlayerStore();

  function preventNavCustom(url) {
    return userX.isLoggedIn ? null : url;
  }

  function preventAction(url) {
    if (!userX.isLoggedIn) {
      utilsX.loginFirst();
      router.push({ name: "login" });
      return false;
    }

    return true;
  }

  function preventInvalidNavigation() {
    watch(() => userX.isLoggedIn, (isLogged) => {
      const requiresAuth = route.matched.some(
        (record) => record.meta.requiresAuth
      );
      playerX.stop();
      //? if route is for users logged in only
      if (requiresAuth) {
        //? there is no user logged in
        if (!isLogged) {
          //? return login with redirection
          router.push({
            name: "login",
            query: {
              redirect: route.name,
              q: JSON.stringify(route.query),
              params: JSON.stringify(route.params),
            },
          });
          return;
        }
      } else {
        //? if route is public and there is a user logged in
        if (isLogged) {
          //? redirect to home view
          router.push({ name: 'home' });
          return;
        }
      }
    });
  }

  return {
    preventNavCustom,
    preventAction,
    preventInvalidNavigation,
  };
}
