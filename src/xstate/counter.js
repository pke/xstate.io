const { Machine, assign } = require("xstate")

const increment = context => context.count + 1
const decrement = context => context.count - 1
const notMax = context => context.count < 10
const notMin = context => context.count > 0

const counterMachine = Machine({
  id: "Counter",
  initial: "active",
  context: {
    count: 0
  },
  states: {
    active: {
      on: {
        INC: { 
          actions: "inc",
          cond: "notMax",
        },
        DEC: { 
          actions: "dec",
          cond: "notMin",
        }
      }
    }
  }
}, {
  actions: {
    inc: assign({ count: increment }),
    dec: assign({ count: decrement })
  },
  guards: {
    notMax,
    notMin,
  }
})

module.exports = counterMachine
