import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { useUserStore } from "@/stores/user";
import { useUtilsStore } from "@/stores/utils";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // 👇 Si estamos en control remoto, dejar pasar TODO
  if (window.location.pathname.includes('/control/')) {
    return next()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const userX = useUserStore();
  const isLoggedIn = userX.isLoggedIn;
  const query = userX.isSubscribed ? null : { subscribed: 0 };

  if (requiresAuth) {
    if (!isLoggedIn) {
      const utilsX = useUtilsStore();
      utilsX.loginFirst();
      next({
        name: "login",
        query: {
          redirect: to.name,
          q: JSON.stringify(to.query),
          params: JSON.stringify(to.params),
        },
      });
      return;
    }
  } else {
    if (isLoggedIn && !(['finishOrder', 'download'].includes(to.name))) {
      next({ name: "home", query });
      return;
    }
  }

  if (requiresAuth && query && !Object.prototype.hasOwnProperty.call(to.query, "subscribed")) {
    next({ ...to, query: { ...to.query, ...query } });
    return;
  } else if (requiresAuth && query === null && Object.prototype.hasOwnProperty.call(to.query, "subscribed")) {
    delete to.query.subscribed;
    next({ ...to, query: { ...to.query } });
    return;
  }

  next();
});

export default router;