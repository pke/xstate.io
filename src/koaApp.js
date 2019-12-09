const { URL } = require("url")

const Koa = require("koa")
const Router = require("koa-trie-router")

const createStateApp = require("./xstate/xstateApp")
const appUrl = require("./appUrl")

const app = new Koa()
const router = new Router()

app.context.resourceUrl = function(id, path = "") {
  return appUrl(this.params.app, this.href, id, path)
}

function sampleEvents(ctx) {
  const { streamEvents } = require("http-event-stream")

  return streamEvents(ctx.req, ctx.res, {
    async fetch (lastEventId) {
      return []
    },
    stream (stream) {
      const listener = state => {
        if (state.changed) {
          const toSiren = require("./toSiren")

          stream.sendEvent({
            event: "change",
            data: JSON.stringify(toSiren(ctx.state.service, {
              href(path = "") {
                return ctx.resourceUrl(ctx.state.id, path)
              }
            }))
          })
        }
      }
      ctx.state.service.onTransition(listener)
      return () => ctx.state.service.off(listener)
    }
  })
}

const services = {}

const stateAppRoutes = new Router()
  .use(async (ctx, next) => {
    const { app, id } = ctx.params
    if (id) {
      const found = services[id]
      if (!found) {
        ctx.throw(404, `${app} with id ${id} not found`, { app, id })
      }
      ctx.state.model = createStateApp(() => found.machine)
      ctx.state.service = found
      ctx.state.id = id
    } else {
      let machine
      if (/^[a-f0-9]{32}$/i.test(app)) {
        const fromGist = require("./fromGist")
        machine = await fromGist(app)
      } else {
        try {
          machine = require(`./xstate/${app}`)
        } catch (err) {
          ctx.throw(404, `App ${app} not found`, { app })
        }
      }

      ctx.state.model = createStateApp(() => machine)
    }
    await next()
    if (ctx.state.id) {
      ctx.state.links.push({
        rel: ["new", "form"],
        href: appUrl(app, ctx.href, ctx.state.id)
      })
    }
  })
  .get("/:app", ctx => {
    const form = ctx.state.model.contextSchema(ctx.query)
    ctx.body = {
      actions: [{
        name: "create",
        title: form.title,
        method: "POST",
        href: new URL(ctx.params.app, ctx.href).href,
        fields: form.properties
      }]
    }
  })
  .get("/:app/:id/events", ctx => {
    sampleEvents(ctx)
    // Koa quirk: Don't close the request/stream after handling the route!
    ctx.respond = false
  })
  .post("/:app", ctx => {
    const created = ctx.state.model.create({...ctx.query, ...ctx.request.body})
    ctx.state.id = created.id
    ctx.state.service = created.service
    services[created.id] = created.service
    ctx.status = 201
  })
  .put("/:app/:id/:type", async ctx => {
    const event = {
      type: ctx.params.type,
      ...ctx.request.body,
      ...ctx.query
    }
    const newState = await ctx.state.service.send(event)
    ctx.status = newState.changed ? 200 : 406
  })
  .get("/:app/:id", ctx => {
    // Just to define the route. The response is composed by the middleware 
    // from the instantiated service app by that id
    ctx.status = 200
  })
  .del("/:app/:id", ctx => {
    ctx.state.model.delete(ctx.id)
    ctx.state.id = ctx.state.service = undefined
    ctx.status = 204
  }).middleware()


router.get("/error", () => {
  throw new Error("Test")
})

app.use(require("./routes/bing")(new Router()).middleware())

console.log("Adding CORS")
app.use(require("@koa/cors")())
console.log("Adding bodyparser")
app.use(require("koa-bodyparser")())
app.use(require("./middleware/errorResponse")())
app.use(require("./middleware/basicAuth")())
app.use(require("./middleware/locationResponse")())
app.use(require("./middleware/sirenResponse")())
app.use(stateAppRoutes)
app.use(router.middleware())

module.exports = function listen(port) {
  return app.listen(port)
}
