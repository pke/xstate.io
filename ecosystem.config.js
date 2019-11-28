module.exports = {
  apps: [{
    name: "xstate.io",
    script: "npm",
    args: "start",
    env: {
      PORT: 5000
    }
  }],
  deploy: {
    production: {
      user: "pke",
      host: "cronos.illunis.net",
      ssh_options: "StrictHostKeyChecking=no",
      port: "36077",
      ref: "origin/master",
      repo: "git@deployment:pke/xstate.io.git",
      path: "/var/www/restlr.io",
      "post-deploy": "npm ci --only=production && npm run restart"
    }
  }
}
