// Archivo para importar Howler correctamente
import Howler from 'howler'

// Exponer Howler globalmente para que EkiPlayerControls lo use
if (typeof window !== 'undefined') {
  window.Howler = Howler.Howler
  window.Howl = Howler.Howl
}

export { Howler }