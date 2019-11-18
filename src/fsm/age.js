const { Machine } = require("xstate")

const isAdult = ({ age }) => age >= 18
const isMinor = ({ age }) => age < 18

const ageMachine = Machine({
  id: "age",
  context: { age: 28 },
  initial: "unknown",
  states: {
    unknown: {
      on: {
        // immediately take transition that satisfies conditional guard.
        // otherwise, no transition occurs
        "": [
          { target: "adult", cond: "isAdult" },
          { target: "child", cond: "isMinor" }
        ]
      }
    },
    adult: { type: "final" },
    child: { type: "final" }
  },
  meta: {
    "unknown": {
      title: "Create age decider",
      fields: [{
        name: "age",
        title: "Age",
        type: "number",
        min: 1
      }]
    }
  }
},{
  guards: {
    "isAdult": isAdult,
    "isMinor": isMinor
  }
})

module.exports = ageMachine
