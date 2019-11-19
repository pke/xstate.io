const listen = require("./koaApp")

;(async () => {
  const server = await listen(process.env.PORT || 3000)
  console.log(`Listening on ${server.address().address}:${server.address().port}`)

  process.on("SIGINT", () => {
    console.log("Shutting down...")
    try {
      server.close()
    } catch (err) {
      console.error(err)
    }
    console.log("Done.")
  })
})()
