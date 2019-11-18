module.exports = {
  apps: [{
    name: "xstate.io",
    script: "npm",
    args: "start"
  }],
  deploy: {
    production: {
      user: "pke",
      host: "cronos.illunis.net",
      port: "36077",
      key: "~/.ssh/id_rsa.pub",
      ref: "origin/master",
      repo: "git@deployment:pke/xstate.io.git",
      path: "/var/www/restlr.io",
      "post-deploy": "npm i && npm run restart"
    }
  }
}
