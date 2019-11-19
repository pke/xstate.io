const got = require("got")
const toMachine = require("./xstate/toMachine")

const basicAuth = process.env.GITHUB_USER && process.env.GITHUB_TOKEN && "Basic "
  + Buffer.from(
    process.env.GITHUB_USER 
    + ":" + process.env.GITHUB_TOKEN
  ).toString("base64")

// ac90dc3ae16d407369c6341f29c2b10c
async function fromGist(gistId) {
  try {
    const { body } = await got(gistId, {
      baseUrl: "https://api.github.com/gists/",
      json: true,
      headers: basicAuth && {
        "Authorization": basicAuth
      }
    })
    const machineJs = body.files && body.files["machine.js"]
    if (machineJs && machineJs.content) {
      const machine = toMachine(machineJs.content)
      return machine
    }
  } catch (err) {
    throw new Error(`Gist ${gistId} could not be downloaded (${err.statusCode} ${err.statusMessage})`)
  }
}

module.exports = fromGist
