const { t } = require("tap")
const request = require("supertest")

const listen = require("../koaApp")

t.test("counter", t => {
  const server = listen()

  t.tearDown(() => server.close())

  t.test("create default counter", async t => {
    await request(server)
      .post("/counter")
      .expect(201)
      .expect("Location", /counter/)
  })

  t.test("create initiated counter", async t => {
    const { headers } = await request(server)
      .post("/counter")
      .send({count: 1})
    request(headers.location).put("/DEC").expect(200)
  })

  t.test("create initiated counter", async t => {
    const { headers } = await request(server)
      .post("/counter")
      .send({count: 10})
    request(headers.location).put("/INC").expect(406)
  })

  t.test("Can not DEC default counter", async t => {
    const { headers } = await request(server).post("/counter")
    request(headers.location).put("/DEC").expect(406)
  })

  t.test("INC counter", async t => {
    const { headers } = await request(server).post("/counter")
    request(headers.location).put("/INC").expect(200)
  })

  t.end()
})
