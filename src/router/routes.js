// Routes
import authRoutes from "./auth";
import dashRoutes from "./dash";

import DashboardTemplate from "@/views/templates/DashboardTemplate.vue";
import ControlRemoteView from "@/views/dash/control/ControlRemoteView.vue"; // 👈 Importar el nuevo

const NotFoundTemplate = () => import("@/views/templates/NotFoundTemplate.vue");
const DownloadView = () => import("@/views/templates/DownloadTemplate.vue");

const routes = [
  {
    path: "/",
    redirect: { name: "dashPreview" },
  },
  {
    path: "/download",
    name: "download",
    component: DownloadView,
  },
  // 👇 RUTA DEL CONTROL REMOTO (celular)
  {
    path: "/control/:roomCode",
    component: DashboardTemplate,
    meta: { isControlRemote: true, requiresAuth: false },
    children: [
      {
        path: "",
        name: "controlRemote",
        component: ControlRemoteView, // 👈 Usar ControlRemoteView
        meta: { isControlRemote: true, requiresAuth: false }
      }
    ]
  },
  authRoutes,
  dashRoutes,
  {
    path: "/:pathMatch(.*)*",
    meta: {
      requiresAuth: true,
    },
    component: NotFoundTemplate,
  },
];

export default routes;