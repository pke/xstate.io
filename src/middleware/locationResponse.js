module.exports = function() {
  return async function(ctx, next) {
    await next()
    if (201 === ctx.status && ctx.state.id !== undefined) {
      ctx.set("Location", ctx.resourceUrl(ctx.state.id))
    }
  }
}
