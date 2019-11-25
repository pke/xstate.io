module.exports = function() {
  return async function errorResponse(ctx, next) {
    try {
      await next()
    } catch (err) {
      debugger
      if (process.env.NODE_ENV === "production") {
        // Let default koa error handler work
        throw err
      }
      ctx.status = ctx.status || 500
      if (!ctx.body && !ctx.headerSent) {
        const Youch = require("youch")
        const youch = new Youch(err, ctx.req)
        if (ctx.accepts("html")) {
          ctx.body = await youch.toHTML()
          ctx.type = "html"
        } else {
          cty.body = await youch.toJSON()
          ctx.type = "application/json"
        }
      }
    }
  }
}
