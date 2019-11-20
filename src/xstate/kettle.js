const { Machine, assign } = require("xstate")

const HEAT_CAPACITY_OF_WATER = 4180

const heatingDuration = ({
  power,
  efficiency,
  amount,
  waterTemp,
  targetTemp = 100
}) => {
  const effectivePower = power * (efficiency * 0.01)
  const heat = HEAT_CAPACITY_OF_WATER * amount * (targetTemp - waterTemp)
  return Math.round(heat / effectivePower)
}

const roundToTwoDigitsAfterComma = number => (
  parseFloat((Math.round(number * 100) / 100).toFixed(2))
)

const kettle = Machine({
  id: "kettle",
  initial: "idle",
  context: {
    capacity: 1600, // in millilitre
    power: 2000, // in Watts
    efficiency: 90, // in %
    amount: 0, // in millilitre
    temp: 0, // in °C
    targetTemp: 100, // °C
  },
  states: {
    lidOpen: {
      on: {
        FILL_WATER: {
          target: "idle",
          actions: "fillWater",
          cond: "validFillEvent",
        },
        CLOSE_LID: "idle"
      },
      meta: {
        on: {
          FILL_WATER: {
            title: "Pour water into the kettle",
            fields: [
              {
                name: "amount",
                type: "number",
                min: 1,
                max: "maxAmount"
              },
              {
                name: "temp",
                type: "number",
                max: 100,
              }
            ]
          }
        }
      }
    },
    idle: {
      on: {
        OPEN_LID: "lidOpen",
        START: {
          target: "heating",
          actions: "setStartTime",
          cond: "notEmpty"
        }
      }
    },
    heating: {
      after: {
        NEXT_TEMP_TIME: {
          target: "heating",
          actions: "incTemp"
        }
      },
      on: {
        "": {
          target: "done",
          cond: "targetTempReached"
        },
        DISCONNECT: "idle",
        LIFT_UP: "idle",
        STOP: "idle"
      }
    },
    done: {
      type: "final"
    }
  }
}, {
  meta: {
    values: {
      maxAmount: context => context.capacity - context.amount
    }
  },
  actions: {
    fillWater: assign({
      amount: (context, event) => context.amount + (event.amount || 0),
      temp: (context, event) => (
        roundToTwoDigitsAfterComma((context.amount * context.temp + event.amount * event.temp) / (context.amount + event.amount))
      )
    }),
    setStartTime: assign({ startTime: () => Date.now() }),
    incTemp: assign({ temp: context => context.temp + 1 })
  },
  delays: {
    NEXT_TEMP_TIME: (context) => {
      const time = heatingDuration({
        power: context.power,
        efficiency: context.efficiency,
        waterTemp: context.temp,
        amount: context.amount,
        targetTemp: context.temp + 1
      })
      return time
    }
  },
  guards: {
    validFillEvent: (context, event) => (
      event.amount > 0
      && event.temp !== undefined
      && context.amount + event.amount <= context.capacity
    ),
    notEmpty: (context) => context.amount > 0,
    targetTempReached: (context) => {
      return context.temp === context.targetTemp
    }
  }
})

module.exports = kettle
