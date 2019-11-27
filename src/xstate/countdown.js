const { Machine, assign } = require("xstate")

const guards = {
  canCountDown: context => !guards.countedDown(context),
  countedDown: context => context.count === 0
}

const actions = {
  startCounting: assign({ startCount: context => context.count }),
  reset: assign({ count: context => context.startCount }),
  countdown: assign({ count: context => context.count - 1 })
}

const countdownMachine = Machine({
  id: "countdown",
  initial: "idle",
  context: {
    count: 10
  },
  states: {
    idle: {
      on: {
        START: {
          actions: "startCounting",
          target: "counting"
        }
      }
    },
    counting: {
      after: {
        1000: {
          target: "counting",
          actions: "countdown",
          cond: "canCountDown"
        }
      },
      on: {
        "": { 
          target: "done",
          cond: "countedDown"
        },
        STOP: {
          target: "idle",
          actions: "reset"
        }
      }
    },
    done: {
      type: "final",
      on: {
        RESTART: {
          target: "counting",
          actions: "reset"
        }
      }
    }
  }
}, {
  guards,
  actions
})

module.exports = countdownMachine
