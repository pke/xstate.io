const got = require("got")
const { parse } = require("fast-xml-parser")

const bingUrl = path => `https://www.bing.com/${path}`

module.exports = function(router) {
  return router
    .get("/bing/:daysBack", async ctx => {
      const { daysBack = 0 } = ctx.params
      const xml = await got(bingUrl(`HPImageArchive.aspx?n=${1+daysBack}`))
      try {
        const obj = parse(xml.body, {}, true)
        const images = Array.isArray(obj.images.image) ? obj.images.image : [obj.images.image]
        ctx.redirect(bingUrl(images[daysBack].url))
      } catch (err) {
        ctx.status = 500
      }
    })
}
