/**
 * TV y equipos con poco CPU/GPU. Se calcula una vez: el user agent no cambia en la sesión.
 *
 * Tizen 5.x (2019–2020, TizenBrowser 5.4, Chromium 63–69) entiende ESM pero no
 * optional chaining ni el iframe API de YouTube de forma estable.
 */
export function isLowResourceDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  if (
    /TV|SmartTV|SMART-TV|Tizen|TizenBrowser|WebOS|webOS|BRAVIA|HbbTV|NetCast|Viera|Innova|VIDAA|Hisense|AFT|AppleTV|CrKey|PlayStation|Xbox/i.test(
      ua
    )
  ) {
    return true;
  }

  const connection = navigator.connection;
  if (connection && connection.saveData) {
    return true;
  }

  const cores = navigator.hardwareConcurrency;
  if (cores && cores <= 2) {
    return true;
  }

  return false;
}

export function isLegacyTizenBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  if (/TizenBrowser/i.test(ua)) {
    return true;
  }

  const tizen = ua.match(/Tizen[ /]?(\d+)/i);
  if (tizen && parseInt(tizen[1], 10) <= 5) {
    return true;
  }

  const chrome = ua.match(/Chrome\/(\d+)/i);
  if (/Tizen/i.test(ua) && chrome && parseInt(chrome[1], 10) < 80) {
    return true;
  }

  return false;
}

let cachedLowResource = null;
let cachedLegacyTizen = null;

export function useLowResourceProfile() {
  if (cachedLowResource == null) {
    cachedLowResource = isLowResourceDevice();
  }
  if (cachedLegacyTizen == null) {
    cachedLegacyTizen = isLegacyTizenBrowser();
  }

  return {
    isLowResource: cachedLowResource,
    skipYoutubeEmbed: cachedLegacyTizen,
  };
}
