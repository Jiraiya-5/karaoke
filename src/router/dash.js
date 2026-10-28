// MODULO DASHBOARD
const DashboardTemplate = () => import("@/views/templates/DashboardTemplate.vue");
const SubroutesTemplate = () => import("@/views/templates/SubroutesTemplate.vue");
const HomeView = () => import("@/views/dash/home/HomeView.vue");
const ArtistDetail = () => import("@/views/dash/artists/ArtistDetail.vue");
const ArtistsList = () => import("@/views/dash/artists/ArtistsList.vue");
const GenreDetail = () => import("@/views/dash/genres/GenreDetail.vue");
const GenresList = () => import("@/views/dash/genres/GenresList.vue");
const ProfileView = () => import("@/views/dash/profile/ProfileView.vue");
const SongsList = () => import("@/views/dash/songs/SongsList.vue");
const SongDetail = () => import("@/views/dash/songs/SongDetail.vue");
const PlanUpgrade = () => import("@/views/dash/upgrades/PlanUpgrade.vue");
const HistoryList = () => import("@/views/dash/history/HistoryList.vue");
const QueueList = () => import("@/views/dash/queue/QueueList.vue");
const PlaylistListTemplate = () => import("@/views/dash/playlists/PlaylistList.vue");
const PlaylistDetail = () => import("@/views/dash/playlists/PlaylistDetail.vue");
const IssueCollector = () => import("@/views/dash/collector/IssueCollector.vue");
const SeekerView = () => import("@/views/dash/seeker/SeekerView.vue");
const NewSongsList = () => import("@/views/dash/songs/NewSongsList.vue");
const DownloadedSongsList = () => import("@/views/dash/songs/DownloadedSongsList.vue");

const dashRoutes = {
  path: "/dashboard",
  name: "dashboard",
  redirect: { name: "home" },
  meta: {
    requiresAuth: true,
  },
  component: DashboardTemplate,
  children: [
    {
      path: "home",
      name: "home",
      component: HomeView,
    },
    {
      path: "profile",
      name: "profile",
      component: ProfileView,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "home" },
          },
          {
            label: "profile.single",
          },
        ],
      },
    },
    {
      path: "issue-collector",
      name: "issueCollector",
      component: IssueCollector,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "home" },
          },
          {
            label: "profile.report",
          },
        ],
      },
    },
    {
      path: "playlists",
      name: "playlists",
      redirect: { name: "playlistsList" },
      component: SubroutesTemplate,
      children: [
        {
          path: "playlistsList",
          name: "playlistsList",
          component: PlaylistListTemplate,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "playlist.plural",
              },
            ],
          },
        },
        {
          path: "playlist-detail/:id",
          name: "playlistDetail",
          component: PlaylistDetail,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "playlist.plural",
                title: "playlist.goToList",
                to: { name: "playlistsList" },
              },
              {
                label: "eki-item-detail",
              },
            ],
          },
        },
      ],
    },
    {
      path: "queue",
      name: "queue",
      redirect: { name: "queueList" },
      component: SubroutesTemplate,
      children: [
        {
          path: "list",
          name: "queueList",
          component: QueueList,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "queue.single",
              },
            ],
          },
        },
      ],
    },
    {
      path: "search",
      name: "seeker",
      component: SeekerView,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "home" },
          },
          {
            label: "seeker.label",
          },
        ],
      },
    },
    {
      path: "songs",
      name: "songs",
      redirect: { name: "songsList" },
      component: SubroutesTemplate,
      children: [
        {
          path: "list/:q?",
          name: "songsList",
          component: SongsList,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "song.plural",
              },
            ],
          },
        },
        {
          path: "detail/:id",
          name: "songDetail",
          component: SongDetail,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "song.plural",
                title: "song.goToList",
                to: { name: "songsList" },
              },
              {
                label: "eki-item-detail",
              },
            ],
          },
        },
      ],
    },
    {
      path: "songs/new",
      name: "newSongs",
      component: NewSongsList,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "home" },
          },
          {
            label: "song.new",
          },
        ],
      },
    },
    {
      path: "songs/downloaded",
      name: "downloadedSongs",
      component: DownloadedSongsList,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "home" },
          },
          {
            label: "song.downloadedSongs",
          },
        ],
      },
    },
    {
      path: "genres",
      name: "genres",
      redirect: { name: "genresList" },
      component: SubroutesTemplate,
      children: [
        {
          path: "list",
          name: "genresList",
          component: GenresList,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "genre.plural",
              },
            ],
          },
        },
        {
          path: "detail/:id",
          name: "genreDetail",
          component: GenreDetail,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "genre.plural",
                title: "genre.goToList",
                to: { name: "genresList" },
              },
              {
                label: "eki-item-detail",
              },
            ],
          },
        },
      ],
    },
    {
      path: "artists",
      name: "artists",
      redirect: { name: "artistsList" },
      component: SubroutesTemplate,
      children: [
        {
          path: "list",
          name: "artistsList",
          component: ArtistsList,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "artist.plural",
              },
            ],
          },
        },
        {
          path: "detail/:id",
          name: "artistDetail",
          component: ArtistDetail,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "artist.plural",
                title: "artist.goToList",
                to: { name: "artistsList" },
              },
              {
                label: "eki-item-detail",
              },
            ],
          },
        },
      ],
    },
    {
      path: "history",
      name: "history",
      redirect: { name: "historyList" },
      component: SubroutesTemplate,
      children: [
        {
          path: "list",
          name: "historyList",
          component: HistoryList,
          meta: {
            breadCrumb: [
              {
                label: "home.single",
                title: "home.goTo",
                to: { name: "home" },
              },
              {
                label: "history.single",
              },
            ],
          },
        },
      ],
    },
    {
      path: "plan-upgrade",
      name: "planUpgrade",
      component: PlanUpgrade,
      meta: {
        breadCrumb: [
          {
            label: "home.single",
            title: "home.goTo",
            to: { name: "home" },
          },
          {
            label: "upgrade.plan",
          },
        ],
      },
    },
  ],
};

export default dashRoutes;