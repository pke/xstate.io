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
    // Middleware or routes might annotate those
    ctx.state.links = []
    ctx.state.actions = []

    await next()

    if (ctx.state.service && ctx.state.id !== undefined) {
      ctx.body = toSiren(ctx.state.service, {
        href(path = "") {
          return ctx.resourceUrl(ctx.state.id, path)
        }
      })
    }
    const { body } = ctx
    if (isSiren(body) && ctx.accepts("application/vnd.siren+json", "json")) {
      ctx.body = JSON.stringify(body)
      ctx.set("Content-Type", "application/vnd.siren+json; charset=utf-8")
    }
  }
}
