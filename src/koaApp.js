const { URL } = require("url")

const Koa = require("koa")
const Router = require("koa-trie-router")

const createStateApp = require("./xstate/xstateApp")
const appUrl = require("./appUrl")
const toSiren = require("./toSiren")

const app = new Koa()
const router = new Router()

app.context.resourceUrl = function(id, path = "") {
  return appUrl(this.params.app, this.href, id, path)
}

const { streamEvents } = require("http-event-stream")

function sampleEvents(ctx) {
  const fetchEventsSince = async (lastEventId) => {
    return [ /* all events since event with ID `lastEventId` woud go here */ ]
  }
  return streamEvents(ctx.req, ctx.res, {
    async fetch (lastEventId) {
      // This method is mandatory to replay missed events after a re-connect
      return fetchEventsSince(lastEventId)
    },
    stream (stream) {
      const listener = state => {
        if (state.changed) {
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

      if (id) {
        const found = ctx.state.model.find(id)
        if (!found) {
          ctx.throw(404, `${app} with id ${id} not found`, { app, id })
        }
        ctx.state.service = found.service
        ctx.state.id = found.id
      }
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
    const created = ctx.state.model.create(ctx.query)
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
    if (!ctx.state.model.validEvent(ctx.state.service, event)) {
      ctx.status = 406
      return
    }
    await ctx.state.model.send({ id: ctx.state.id, service: ctx.state.service}, event)
    ctx.status = 200
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
  })


router.get("/error", () => {
  throw new Error("Test")
})

app.use(require("@koa/cors")())
app.use(require("koa-bodyparser")())
app.use(require("./middleware/errorResponse")())
app.use(require("./middleware/locationResponse")())
app.use(require("./middleware/sirenResponse")())
app.use(require("./routes/bing")(new Router()).middleware())
app.use(stateAppRoutes.middleware())
app.use(router.middleware())

module.exports = function listen(port) {
  return app.listen(port)
}
