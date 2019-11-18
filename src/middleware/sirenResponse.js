const { URL } = require("url")

const toSiren = require("../toSiren")

function isSiren(unknown) {
  return (typeof unknown === "object")
    && (
      /siren/.test(unknown["$schema"]) 
      || unknown.class 
      || unknown.properties
      || unknown.links
      || unknown.entities)
}

module.exports = function sirenResponse() {
  return async function(ctx, next) {
    await next()
    if (ctx.service && ctx.id !== undefined) {
      ctx.body = toSiren(ctx.service, {
        href(path = "") {
          return ctx.resourceUrl(ctx.id, path)
        }
      })
      ctx.body.links.push({
        rel: ["new", "form"],
        href: new URL(`/${ctx.params.app}`, ctx.href).href
      })
    }
    const { body } = ctx
    if (isSiren(body) && ctx.accepts("application/vnd.siren+json", "json")) {
      ctx.body = JSON.stringify(body)
      ctx.set("Content-Type", "application/vnd.siren+json; charset=utf-8")
    }
  }
}
