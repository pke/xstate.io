const { URL } = require("url")

const Koa = require("koa")
const Router = require("koa-trie-router")

const createStateApp = require("./stateApp")

const app = new Koa()
const router = new Router()

app.context.resourceUrl = function(id, path = "") {
  return new URL(`/${this.params.app}/${id}${path ? "/".concat(path) : path}`, this.href).href
}

app.use(require("./middleware/errorResponse")())

const stateApp = apps => {
  return new Router()
    .use(async (ctx, next) => {
      const app = apps[ctx.params.app]
      if (!app) {
        ctx.status = 404
        ctx.statusText = `App ${ctx.params.app} not found`
        return
      }
      ctx.model = createStateApp(app)
      if (ctx.params.id) {
        const found = ctx.model.find(ctx.params.id)
        if (!found) {
          ctx.status = 404
          return
        }
        ctx.status = 200
        ctx.service = found.service
        ctx.id = found.id
      }
      ctx.links = []
      ctx.actions = []
      await next()
    })
    .get("/:app", ctx => {
      const form = ctx.model.createForm(ctx.query)
      ctx.body = {
        actions: [{
          name: "create",
          title: form.title,
          method: "POST",
          href: new URL(`/${ctx.params.app}`, ctx.href).href,
          fields: form.fields
        }]
      }
    })
    .post("/:app", (ctx) => {
      const created = ctx.model.create(ctx.query)
      ctx.id = created.id
      ctx.service = created.service
      ctx.status = 201
    })
    .put("/:app/:id/:type", async (ctx) => {
      const event = {
        type: ctx.params.type,
        ...ctx.query
      }
      if (!ctx.model.validEvent(ctx.service, event)) {
        ctx.status = 406
        return
      }
      const changed = await ctx.model.send({ id: ctx.id, service: ctx.service}, event)
      ctx.status = 200
    })
    .get("/:app/:id", (ctx) => {
    })
    .del("/:app/:id", (ctx) => {
      ctx.model.del(ctx.id)
      ctx.status = 204
      ctx.id = ctx.service = undefined
    })
    .middleware()
}

router.get("/error", () => {
  throw new Error("Test")
})

app.use(require("./middleware/locationResponse")())
app.use(require("./middleware/sirenResponse")())
app.use(stateApp(require("./fsm")))
app.use(router.middleware())

module.exports = function listen(port) {
  app.listen(port)
}
