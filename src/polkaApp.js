const polka = require("polka")
const send = require("@polka/send")
const toSiren = require("./toSiren")
const { findState, saveState, removeState } = require("./persist")
const createService = require("./createService")

const protocol = req => req.socket.encrypted ? "https" : "http"

const { URL } = require("url")
const url = (req, path) => new URL(path, `${protocol(req)}://${req.headers.host}${req.originalUrl}`).href

const requestAnnotator = (req, pathPrefix) => ({
  href: (path) => url(req, pathPrefix!==undefined ? pathPrefix + "/" + path : path),
})

const createStateApp = createMachine => (
  polka()
    .use(async (req, res, next) => {
      if (req.params && req.params.id) {
        const state = findState(req.params.id)
        if (!state) {
          return send(res, 404)
        }
        req.service = createService(createMachine(), state)
      }
      next()
    })
    .post("/", (req, res) => { // Create a new counter FSM
      const machine = createMachine()
      req.service = interpret(machine.withContext({
        ...machine.context,
        ...req.query
      })).start()
      req.params.id = saveState(undefined, req.service.state)
      if (req.originalUrl[req.originalUrl.length-1] !== "/") {
        req.originalUrl += "/"
      }
      req.annotator = requestAnnotator(req, req.params.id)
      res.siren = toSiren(req.service, req.annotator)
      const location = req.annotator.href("")
      res.setHeader("Location", location)
      send(res, 201, res.siren)
    })
    .delete(":id", (req, res) => {
      removeState(req.params.id)
      send(res, 204, "Deleted")
    })
    .post(":id/:type", (req, res) => {
      const { id, type } = req.params
      req.service.send(type, req.query)
      saveState(id, req.service.state)
      res.siren = toSiren(req.service, requestAnnotator(req))
      send(res, 200, res.siren)
    })
    .get(":id", (req, res) => {
      if (req.originalUrl[req.originalUrl.length-1] !== "/") {
        req.originalUrl += "/"
      }
      res.siren = toSiren(req.service, requestAnnotator(req))
      send(res, 200, res.siren)
    })
)

async function errorPage(err, req, res) {
  const Youch = require("youch")
  const youch = new Youch(err, req)
  const body = await youch.toJSON()
  send(res, 500, body, {
    "Content-Type": "application/json"
  })
}

async function getFromGist(req, res, next) {
  const fromGist = require("./fromGist")

  // eslint-disable-next-line require-atomic-updates
  req.machine = await fromGist(req.params.gist)
  next()
}

const apps = require("./fsm")

const app = polka({
  onError: errorPage
})
  .use("gist/:gist", getFromGist, createStateApp((req) => req.machine))
  .get("/error", () => { throw new Error("Ooops") })
  .get("/", (req, res) => {
    const actions = Object.keys(apps).map(key => {
      return {
        name: "create-" + key,
        href: url(req, key),
        method: "POST",
        title: "Create " + key,
        rel: ["index"]
      }
    })
    res.siren = {
      class: ["index"],
      title: "API index",
      actions
    }
    send(res, 200, res.siren)
  })
Object.keys(apps).forEach(key => app.use(key, createStateApp(apps[key])))

module.exports = app

app.listen(3000)

/*const request = require("supertest")

request(app.handler)
  .post("/counters")
  .expect(201)

request(app.handler)
  .get("/counters")
*/
