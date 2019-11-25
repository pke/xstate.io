const { Machine } = require("xstate")

const toggleMachine = Machine({
  id: "Toggle",
  initial: "off",
  states: {
    off: {
      on: {
        ON: "on"
      }
    },
    on: {
      on: {
        OFF: "off"
      }
    }
  }
})

module.exports = toggleMachine
