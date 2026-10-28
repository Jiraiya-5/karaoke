// Polyfill para `contains` en NodeList (algunos navegadores antiguos)
if (typeof NodeList !== 'undefined' && !NodeList.prototype.contains) {
  NodeList.prototype.contains = function (el) {
    return Array.from(this).includes(el)
  }
}

// Polyfill para Element.prototype.closest
if (typeof Element !== 'undefined' && !Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    let el = this
    do {
      if (el.matches(s)) return el
      el = el.parentElement || el.parentNode
    } while (el !== null && el.nodeType === 1)
    return null
  }
}

export default {}