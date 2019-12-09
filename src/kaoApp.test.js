const { t } = require("tap")
const request = require("supertest")

const listen = require("./koaApp")

t.test("server tests", t => {
  // Start a server on a random port for all tests
  const server = listen()

  // Before ending the tests, close the server and free the port
  t.tearDown(() => server.close())

  t.test("create counter with basic auth", async t => {
    const { headers } = await request(server)
      .post("/counter")
      .auth("The Dude", "abides")
      .expect(201)
      .expect("Location", /counter/)

    t.test("and access it with correct credentials", async t => {
      await request(headers.location)
        .get("")
        .auth("The Dude", "abides")
        .expect(200)
    })

    t.test("and access it with invalid credentials", async t => {
      await request(headers.location)
        .get("")
        .auth("The Dude", "does abide")
        .expect(403)
    })

    t.test("and access it without credentials", async t => {
      await request(headers.location)
        .get("")
        .expect(401)
    })
    
    t.end()
  })
  
  t.end()
})
