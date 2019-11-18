const got = require("got")
const toMachine = require("./toMachine")

async function fromUrl(url) {
  try {
    const { body } = await got(url)
    if (body) {
      return toMachine(body)
    }
    throw new Error("Empty response")
  } catch (err) {
    throw new Error(`Download error from ${url}: ${err.message}`)
  }
}

module.exports = fromUrl
