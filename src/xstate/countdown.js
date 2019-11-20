const { Machine, assign } = require("xstate")

module.exports = Machine({
  id: "countdown",
  initial: "idle",
  context: {
    count: 10
  },
  states: {
    idle: {
      on: {
        START: "counting"
      }
    },
    counting: {
      after: {
        1000: [
          { 
            target: "done",
            cond: "countedDown"
          },
          {
            target: "counting",
            actions: "countdown"
          }
        ]
      },
      on: {
        STOP: {
          target: "idle",
          actions: "reset"
        }
      }
    },
    done: {
      type: "final"
    }
  }
}, {
  guards: {
    countedDown: context => context.count === 1
  },
  actions: {
    reset: assign({ count: 10 }),
    countdown: assign({ count: context => context.count - 1 })
  },
  delays: {
    countdown: (context) => {
      return context.count * 1000
    }
  }
})
