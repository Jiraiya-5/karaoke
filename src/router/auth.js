// MODULO AUTH
const DashboardTemplate = () => import("@/views/templates/DashboardTemplate.vue");
const DashPreview = () => import("@/views/auth/DashPreview.vue");
const LoginView = () => import("@/views/auth/LoginView.vue");
const RegisterView = () => import("@/views/auth/RegisterView.vue");
const RecoverView = () => import("@/views/auth/RecoverView.vue");
const FinishOrderView = () => import("@/views/auth/FinishOrderView.vue");
const VerifyView = () => import("@/views/auth/VerifyView.vue");
const ActiveConnections = () => import("@/views/auth/ActiveConnections.vue");

const authRoutes = {
  path: "/auth",
  name: "auth",
  redirect: { name: "dashPreview" },
  component: DashboardTemplate,
  children: [
    {
      path: "dash-home-preview",
      name: "dashPreview",
      component: DashPreview,
    },
    {
      path: "login/:token?",
      name: "login",
      component: LoginView,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "dashPreview" },
          },
          {
            label: "auth.login",
          },
        ],
      },
    },
    {
      path: "register",
      name: "register",
      component: RegisterView,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "dashPreview" },
          },
          {
            label: "auth.register",
          },
        ],
      },
    },
    {
      path: "recover",
      name: "recover",
      component: RecoverView,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "dashPreview" },
          },
          {
            label: "auth.recover",
          },
        ],
      },
    },
    {
      path: "active-connections",
      name: "activeConnections",
      component: ActiveConnections,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "dashPreview" },
          },
          {
            label: "auth.activeConnections",
          },
        ],
      },
    },
    {
      path: "finish-order/:token",
      name: "finishOrder",
      component: FinishOrderView,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "dashPreview" },
          },
          {
            label: "auth.finishOrder",
          },
        ],
      },
    },
    {
      path: "verify-email",
      name: "verify",
      meta: {
        requiresAuth: true,
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "dashPreview" },
          },
          {
            label: "auth.verify",
          },
        ],
      },
      component: VerifyView,
    },
  ],
};

export default authRoutes;