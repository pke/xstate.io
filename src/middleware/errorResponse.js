module.exports = function() {
  return async function errorResponse(ctx, next) {
    try {
      await next()
    } catch (error) {
      //console.error(error)
      ctx.status = error.status || ctx.status || 500
      ctx.response.headers = {
        ...ctx.response.headers,
        ...error.headers
      }
      if (process.env.NODE_ENV === "production") {
        // Let default koa error handler work
        throw error
      }
      if (!ctx.body && !ctx.headerSent) {
        const Youch = require("youch")
        const youch = new Youch(error, ctx.req)
        if (ctx.accepts("html")) {
          ctx.body = await youch.toHTML()
          ctx.type = "html"
        } else {
          ctx.body = await youch.toJSON()
          ctx.type = "application/json"
        }
      }
    }
  }
}
