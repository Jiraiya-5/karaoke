export function useValidator() {
  function stringBetween(v, min, max) {
    if (v) {
      return v.length >= min && v.length <= max;
    }
    return false;
  }

  function required(v) {
    return v != null && v != undefined && v != "";
  }

  function optional(v) {
    return !required(v);
  }

  function equal(v, comp) {
    return v === comp;
  }

  function email(v) {
    if (v) {
      return /^[\w-\.+\+]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v);
    }
    return false;
  }

  function password(v) {
    if (v) {
      return v.length >= 6;
    }
    return false;
  }

  function phoneNumber(v) {
    if (v) {
      return /(\+?( |-|\.)?\d{1,2}( |-|\.)?)?(\(?\d{3}\)?|\d{3})( |-|\.)?(\d{3}( |-|\.)?\d{4})/g.test(
        v
      );
    }
    return false;
  }

  return {
    stringBetween,
    required,
    email,
    password,
    equal,
    optional,
    phoneNumber
  };
}
