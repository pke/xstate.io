const {t} = require("tap")

const { resolve } = require("url")
const protocol = req => req.socket.encrypted ? "https" : "http"
const url = (req, path) => resolve(`${protocol(req)}://${req.headers.host}${req.originalUrl}`, path)

t.test("base URL path composition", t => {
  t.plan(2)

  t.is(resolve("/counter", "/"), "/counter/")
  t.is(resolve("/counter/0/INC", "DEC"), "/counter/0/DEC")
})
