import { ref, onBeforeMount } from "vue";
import { useRequesterStore } from "@/stores/requester";
import { useRoute, useRouter } from "vue-router";
import { useUtilsStore } from "@/stores/utils";
import { useUserStore } from "@/stores/user";

export function useFinishApiLogin() {
  const isFinishOrder = ref(false);
  const finishOrderToken = ref(null);
  const incommingName = ref("");
  const incommingEmail = ref("");

  const route = useRoute();
  const router = useRouter();
  const requesterX = useRequesterStore();
  const utilsX = useUtilsStore();
  const userX = useUserStore();

  const { name, params } = route;
  const { redirect, q, params: qparams } = route.query;

  onBeforeMount(async () => {
    if ((name === "finishOrder" || name==='login')&&params.token) {
      finishOrderToken.value = params.token;
      isFinishOrder.value = true;

      try {
        const { data } = await requesterX.Get({
          route: `/purchase-info/${finishOrderToken.value}`,
        });

        incommingEmail.value = data.email;
        incommingName.value = data.name;
      } catch (e) {
        utilsX.setNotif({
          title: "auth.finishingOrder",
          message: "auth.finishBadToken",
          type: "error",
          timeVisible: 5,
          position: "top-center",
        });
        isFinishOrder.value = false;
        router.push({ name: "login" });
      }
    }
  });

  function sendResponse(status, data) {
    return { success: status, data: data };
  }

  async function finishApiLogin(token, userData, { hasPassword = true }) {
    try {
      const data = {
        token,
        hasPassword,
        userData: {
          ...userData,
          ...{
            isFinishOrder: isFinishOrder.value,
            finishRegistrationToken: finishOrderToken.value,
          },
        },
      };

      const apiUser = await requesterX.Post({
        route: "/login",
        body: data,
      });
      userX.setApiUser(apiUser.data);
      const {settings} = apiUser.data.user;
      if(settings) {
        userX.setUserSettings(settings);
      }
      return sendResponse(true, {
        redirect: redirect
          ? {
              name: redirect,
              query: JSON.parse(q),
              params: JSON.parse(qparams),
            }
          : { name: "home" },
      });
    } catch (error) {
      if (error.response.status === 409) {
        return sendResponse(false, {
          title: "error.warning",
          msg: "error.activeSessions",
          type: "warning",
          redirect: {
            name: "activeConnections",
            query: { token: error.response.data.token },
          },
        });
      }
      console.error(error);
      return sendResponse(false, { msg: "error.something" });
    }
  }
  async function sendPurchaseLink(email) {
    try {
      const { data } = await requesterX.Post({
        route: "/send-purchase-link",
        body: { email }
      });
      return sendResponse(true, data);
    } catch (error) {
      return sendResponse(false, { msg: "error.something" });
    }
  }
  return {
    incommingName,
    incommingEmail,
    finishApiLogin,
    finishOrderToken,
    sendPurchaseLink
  };
}
