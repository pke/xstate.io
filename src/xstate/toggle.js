const { Machine } = require("xstate")

const toggleMachine = Machine({
  id: "Toggle",
  initial: "off",
  states: {
    off: {
      on: {
        TOGGLE: "on"
      }
    },
    on: {
      on: {
        TOGGLE: "off"
      }
    }
  }
})

module.exports = toggleMachine
