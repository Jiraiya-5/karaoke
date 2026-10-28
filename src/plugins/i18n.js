import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    // ===== GENERAL =====
    search: 'Search',
    loadMore: 'Load more',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    noResults: 'No results to show',
    loading: 'Loading...',

    // ===== HOME =====
    home: {
      single: 'Home',
      goTo: 'Go to home',
      popularArtists: 'Popular Artists',
      popularGenres: 'Popular Genres',
      seeAll: 'See all',
      all: 'All'
    },

    // ===== SONG =====
    song: {
      single: 'Song',
      plural: 'Songs',
      title: 'Title',
      next: 'Next song',
      prev: 'Previous song',
      pausePlay: 'Pause/Play Song',
      mainSearch: 'What do you want to sing today?',
      mainSearchTitle: 'Search',
      goToDetail: 'Go to detail',
      goToList: 'Go to list',
      mySongs: 'My Songs',
      new: 'New songs',
      goToNew: 'Go to new songs',
      downloadedSongs: 'Downloaded songs',
      goToDownload: 'Go to downloaded songs',
      recording: 'Recording',
      recordingPaused: 'Recording paused',
      moveLeft: 'Move left',
      moveRight: 'Move right',
      removeFromQueue: 'Remove from queue',
      play: 'Play',
      notFound: 'Song not found',
      search: 'Search song',
      addToQueue: 'Add to queue',
      addedToQueue: 'Added!',
      addedToQueueMsg: 'Song added to queue',
      cancionero: 'Songbook'
    },

    // ===== ARTIST =====
    artist: {
      single: 'Artist',
      plural: 'Artists',
      goToList: 'Go to artists',
      goToDetail: 'Go to artist'
    },

    // ===== GENRE =====
    genre: {
      single: 'Genre',
      plural: 'Genres',
      goToList: 'Go to genres',
      goToDetail: 'Go to genre'
    },

    // ===== EFFECT =====
    effect: {
      label: 'Effects',
      simpleLabel: 'Effects',
      open: 'Open effects',
      close: 'Close effects'
    },
    react: {
      label: 'Reactions',
      open: 'Open reactions',
      close: 'Close reactions'
    },
    playEffect: 'Play {name}',

    // ===== CONTROL =====
    control: {
      player: 'Player',
      openClose: 'Open/Close',
      songVolume: 'Volume',
      activateVozGuia: 'Activate guide voice',
      deactivateVozGuia: 'Deactivate guide voice',
      remote: 'Remote control',
      newControlConnected: 'New control connected',
      newMainControlConnected: 'New main control connected',
      noMoreControls: 'No more controls connected'
    },

    // ===== SCREEN =====
    screen: {
      minMax: 'Fullscreen'
    },

    // ===== QUEUE =====
    queue: {
      show: 'Show queue',
      single: 'Waiting',
      goToList: 'Go to queue',
      clear: 'Clear queue'
    },

    // ===== CONFIG =====
    config: {
      purple: 'Purple',
      pink: 'Pink',
      yellow: 'Yellow',
      showQueue: 'Show queue',
      showSala: 'Show room number',
      showCustomMessage: 'Show custom message',
      showAllLyric: 'Show full lyrics',
      showScore: 'Show score',
      modifyTone: 'Modify tone',
      tone: 'Tone',
      font: 'Font',
      bgVideo: 'Background video',
      restoreTone: 'Restore tone',
      increaseTone: 'Increase tone',
      decreaseTone: 'Decrease tone',
      changeTheme: 'Change theme',
      changeStyle: 'Change style',
      languageChange: 'Change language',
      languageChangeTo: 'Change to {lang}',
      capital: 'UPPERCASE',
      lowercase: 'lowercase',
      original: 'Original',
      particles: 'Particles',
      stars: 'Stars',
      mistic: 'Mystic',
      campfire: 'Campfire',
      none: 'None',
      switch: 'Switch {topic}'
    },

    // ===== PROFILE =====
    profile: {
      single: 'Profile',
      options: 'Options',
      goTo: 'Go to profile',
      data: 'My data',
      dataGoTo: 'View my data',
      control: 'Remote control',
      controlGoTo: 'Open remote control',
      config: 'Configuration',
      configGoTo: 'Open configuration',
      cookies: 'Cookies',
      cookiesGoTo: 'Cookie preferences',
      video: 'Tutorial',
      videoGoTo: 'Open tutorial',
      report: 'Report issue',
      reportGoTo: 'Open report form'
    },

    // ===== PLAYLIST =====
    playlist: {
      single: 'Playlist',
      plural: 'Playlists',
      goToList: 'Go to playlists',
      create: 'Create playlist',
      name: 'Playlist name',
      created: 'Playlist created',
      deleted: 'Playlist deleted',
      noPlaylists: 'You have no playlists yet'
    },

    // ===== HISTORY =====
    history: {
      single: 'History',
      goToList: 'Go to history',
      playedAt: 'Played at'
    },

    // ===== ERROR =====
    error: {
      single: 'An error has occurred',
      something: 'Something went wrong. Please try again.',
      network: 'Connection error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      noSubscription: 'You have no active plan, buy one to access all features.',
      warning: 'Warning',
      loginFirst: 'You must log in first',
      songInProgress: 'Song already playing',
      noSongs: 'No songs',
      noMoreSongs: 'No more songs in queue',
      userNotFound: 'User not found',
      wrongPassword: 'Wrong password',
      invalidEmail: 'Invalid email',
      emailUsed: 'Email already in use',
      weakPassword: 'Password too weak'
    },

    // ===== UPGRADE =====
    upgrade: {
      viewOffer: 'Subscribe',
      plan: 'Plans'
    },

    // ===== AUTH =====
    auth: {
      login: 'Log in',
      loginMsg: 'Sign in to continue',
      register: 'Register',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      loggingIn: 'Logging in...',
      loggingOut: 'Logging out...',
      logout: 'Log out',
      logoutSuccess: 'Logged out',
      loginSuccess: 'Logged in',
      recover: 'Recover password',
      recoverMsg: 'Enter your email',
      recoverSended: 'Email sent',
      verify: 'Verify email',
      verificationSended: 'Verification email sent',
      activeConnections: 'Active connections',
      finishOrder: 'Finish order'
    },

    // ===== INSTALL/PWA =====
    install: 'Install',
    installBanner: 'Install app',
    update: 'Update',
    updateBanner: 'Update app',
    subscribe: 'Subscribe',

    // ===== LANGUAGES =====
    languages: {
      es: 'Spanish',
      en: 'English'
    },

    // ===== BREADCRUMBS =====
    topResults: 'Top results',
    epicSong: 'Epic song',
    amazingArtists: 'Amazing artists',
    roomName: 'Room: {name}',

    // ===== VUESTIC (para evitar warnings) =====
    vuestic: {
      toggleDropdown: 'Toggle menu',
      progressState: 'Loading...',
      breadcrumbs: 'Breadcrumbs'
    }
  },

  es: {
    // ===== GENERAL =====
    search: 'Buscar',
    loadMore: 'Cargar más',
    save: 'Guardar',
    cancel: 'Cancelar',
    add: 'Añadir',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    noResults: 'No hay resultados para mostrar',
    loading: 'Cargando...',

    // ===== HOME =====
    home: {
      single: 'Inicio',
      goTo: 'Ir al Inicio',
      popularArtists: 'Artistas Populares',
      popularGenres: 'Géneros Populares',
      seeAll: 'Ver todos',
      all: 'Todo'
    },

    // ===== SONG =====
    song: {
      single: 'Canción',
      plural: 'Canciones',
      title: 'Título',
      next: 'Siguiente canción',
      prev: 'Canción anterior',
      pausePlay: 'Pausar/Reproducir Canción',
      mainSearch: '¿Qué quieres cantar hoy?',
      mainSearchTitle: 'Buscar',
      goToDetail: 'Ir al detalle',
      goToList: 'Ir a la lista',
      mySongs: 'Mis Canciones',
      new: 'Nuevas disponibles',
      goToNew: 'Ir a nuevas canciones',
      downloadedSongs: 'Canciones descargadas',
      goToDownload: 'Ir a canciones descargadas',
      recording: 'Grabando',
      recordingPaused: 'Grabación pausada',
      moveLeft: 'Mover izquierda',
      moveRight: 'Mover derecha',
      removeFromQueue: 'Quitar de la cola',
      play: 'Reproducir',
      notFound: 'Canción no encontrada',
      search: 'Buscar canción',
      addToQueue: 'Añadir a la cola',
      addedToQueue: '¡Añadida!',
      addedToQueueMsg: 'Canción añadida a la cola',
      cancionero: 'Cancionero'
    },

    // ===== ARTIST =====
    artist: {
      single: 'Artista',
      plural: 'Artistas',
      goToList: 'Ir a artistas',
      goToDetail: 'Ir al artista'
    },

    // ===== GENRE =====
    genre: {
      single: 'Género',
      plural: 'Géneros',
      goToList: 'Ir a géneros',
      goToDetail: 'Ir al género'
    },

    // ===== EFFECT =====
    effect: {
      label: 'Efectos',
      simpleLabel: 'Efectos',
      open: 'Abrir efectos',
      close: 'Cerrar efectos'
    },
    react: {
      label: 'Reacciones',
      open: 'Abrir reacciones',
      close: 'Cerrar reacciones'
    },
    playEffect: 'Reproducir {name}',

    // ===== CONTROL =====
    control: {
      player: 'Reproductor',
      openClose: 'Abrir/Cerrar',
      songVolume: 'Volumen',
      activateVozGuia: 'Activar voz guía',
      deactivateVozGuia: 'Desactivar voz guía',
      remote: 'Control remoto',
      newControlConnected: 'Nuevo control conectado',
      newMainControlConnected: 'Nuevo control principal conectado',
      noMoreControls: 'No quedan controles conectados'
    },

    // ===== SCREEN =====
    screen: {
      minMax: 'Pantalla completa'
    },

    // ===== QUEUE =====
    queue: {
      show: 'Mostrar cola',
      single: 'En Espera',
      goToList: 'Ir a la cola',
      clear: 'Limpiar cola'
    },

    // ===== CONFIG =====
    config: {
      purple: 'Morado',
      pink: 'Rosa',
      yellow: 'Amarillo',
      showQueue: 'Mostrar canciones en espera',
      showSala: 'Mostrar número de sala',
      showCustomMessage: 'Mostrar mensaje personalizado',
      showAllLyric: 'Mostrar letra completa',
      showScore: 'Mostrar calificación',
      modifyTone: 'Modificar tono',
      tone: 'Tono',
      font: 'Fuente',
      bgVideo: 'Video de Fondo',
      restoreTone: 'Restaurar tono',
      increaseTone: 'Aumentar tono',
      decreaseTone: 'Disminuir tono',
      changeTheme: 'Cambiar tema',
      changeStyle: 'Cambiar estilo',
      languageChange: 'Cambiar idioma',
      languageChangeTo: 'Cambiar a {lang}',
      capital: 'MAYÚSCULAS',
      lowercase: 'minúsculas',
      original: 'Original',
      particles: 'Partículas',
      stars: 'Estrellas',
      mistic: 'Místico',
      campfire: 'Fogata',
      none: 'Ninguno',
      switch: 'Cambiar {topic}'
    },

    // ===== PROFILE =====
    profile: {
      single: 'Perfil',
      options: 'Opciones',
      goTo: 'Ir al perfil',
      data: 'Mis datos',
      dataGoTo: 'Ver mis datos',
      control: 'Control remoto',
      controlGoTo: 'Abrir control remoto',
      config: 'Configuración',
      configGoTo: 'Abrir configuración',
      cookies: 'Cookies',
      cookiesGoTo: 'Preferencias de cookies',
      video: 'Tutorial',
      videoGoTo: 'Abrir tutorial',
      report: 'Enviar reporte',
      reportGoTo: 'Abrir formulario de reporte'
    },

    // ===== PLAYLIST =====
    playlist: {
      single: 'Playlist',
      plural: 'PlayLists',
      goToList: 'Ir a playlists',
      create: 'Crear playlist',
      name: 'Nombre',
      created: 'Playlist creada',
      deleted: 'Playlist eliminada',
      noPlaylists: 'Aún no tienes playlists'
    },

    // ===== HISTORY =====
    history: {
      single: 'Historial',
      goToList: 'Ir al historial',
      playedAt: 'Reproducida'
    },

    // ===== ERROR =====
    error: {
      single: 'Ha ocurrido un error',
      something: 'Algo salió mal. Inténtalo de nuevo.',
      network: 'Error de conexión',
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      noSubscription: 'No tienes un plan activo, compra uno para acceder a todas las funcionalidades.',
      warning: 'Advertencia',
      loginFirst: 'Debes iniciar sesión primero',
      songInProgress: 'Canción ya en reproducción',
      noSongs: 'Sin canciones',
      noMoreSongs: 'No hay más canciones en la cola',
      userNotFound: 'Usuario no encontrado',
      wrongPassword: 'Contraseña incorrecta',
      invalidEmail: 'Correo inválido',
      emailUsed: 'El correo ya está en uso',
      weakPassword: 'Contraseña muy débil'
    },

    // ===== UPGRADE =====
    upgrade: {
      viewOffer: 'Suscribirme',
      plan: 'Planes'
    },

    // ===== AUTH =====
    auth: {
      login: 'Ingresar',
      loginMsg: 'Inicia sesión ingresando los datos de tu cuenta',
      register: 'Registrarse',
      emailLabel: 'Correo',
      passwordLabel: 'Contraseña',
      loggingIn: 'Iniciando sesión...',
      loggingOut: 'Cerrando sesión...',
      logout: 'Cerrar Sesión',
      logoutSuccess: 'Sesión cerrada',
      loginSuccess: 'Sesión iniciada',
      recover: 'Recuperar contraseña',
      recoverMsg: 'Ingresa tu correo',
      recoverSended: 'Correo enviado',
      verify: 'Verificar correo',
      verificationSended: 'Correo de verificación enviado',
      activeConnections: 'Conexiones activas',
      finishOrder: 'Finalizar orden'
    },

    // ===== INSTALL/PWA =====
    install: 'Instalar',
    installBanner: 'Instalar app',
    update: 'Actualizar',
    updateBanner: 'Actualizar app',
    subscribe: 'Suscribirme',

    // ===== LANGUAGES =====
    languages: {
      es: 'Español',
      en: 'Inglés'
    },

    // ===== BREADCRUMBS =====
    topResults: 'Mejores resultados',
    epicSong: 'Canción épica',
    amazingArtists: 'Banda asombrosa',
    roomName: 'Sala: {name}',

    // ===== VUESTIC (para evitar warnings) =====
    vuestic: {
      toggleDropdown: 'Alternar menú',
      progressState: 'Cargando...',
      breadcrumbs: 'Ruta de navegación'
    }
  }
}

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('app-language') || 'es',
  fallbackLocale: 'en',
  messages
})