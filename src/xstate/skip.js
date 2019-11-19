const { Machine } = require("xstate")

const skipMachine = Machine({
  id: "skip",
  initial: "one",
  states: {
    one: {
      on: { CLICK: "two" }
    },
    two: {
      // null event '' always occurs once state is entered
      // immediately take the transition to 'three'
      on: { "": "three" }
    },
    three: {
      type: "final"
    }
  }
})

module.exports = skipMachine
