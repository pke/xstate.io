const got = require("got")
const toMachine = require("./toMachine")

const basicAuth = process.env.GITHUB_USER && process.env.GITHUB_TOKEN && "Basic "
  + Buffer.from(
    process.env.GITHUB_USER 
    + ":" + process.env.GITHUB_TOKEN
  ).toString("base64")

// a6d444e7a565341ef666f98a67d1f03e94e242e9
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
    throw new Error("Download error")
  }
}

module.exports = fromGist
