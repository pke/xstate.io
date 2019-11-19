module.exports = function appUrl(app, base, id, path = "") {
  return new URL(`/${app}/${id}${path ? "/".concat(path) : path}`, base).href
}
