const { t } = require("tap")
const { interpret } = require("xstate")
const { SimulatedClock } = require("xstate/lib/SimulatedClock")

const machine = require("./kettle")
const toSiren = require("../toSiren")

const TEST_CONTEXT = {
  capacity: 1600,
  power: 2000,
  efficiency: 90,
  amount: 0,
  temp: 0,
  targetTemp: 100
}

const createKettle = (context = {}) => (
  interpret(machine.withContext({ ...TEST_CONTEXT, ...context}),
    {
      clock: new SimulatedClock()
    }
  ).start()
)

t.test("kettle", t => {
  t.beforeEach((done, t) => {
    t.context.kettle = createKettle().start()
    done()
  })

  t.afterEach((done, t) => {
    t.context.kettle.stop()
    done()
  })

  t.test("should start in idle mode", t => {
    t.plan(1)
    t.ok(t.context.kettle.state.matches("idle"))
  })

  t.test("can not start without water", t => {
    t.plan(1)
    const { kettle } = t.context
    kettle.send("START")
    t.ok(kettle.state.matches("idle"))
  })

  t.test("can not fill in water with closed lid", t => {
    t.plan(1)
    const { kettle } = t.context
    kettle.send("FILL_WATER")
    t.ok(kettle.state.matches("idle"))
  })

  t.test("open lid", t => {

    t.beforeEach((done, t) => {
      t.context.kettle.send("OPEN_LID")
      done()
    })

    t.test("lid is open", t => {
      t.plan(1)
      const { kettle } = t.context
      t.ok(kettle.state.matches("lidOpen"))
    })

    t.test("can not start with lid open", t => {
      t.plan(1)
      const { kettle } = t.context
      kettle.send("START")
      t.ok(kettle.state.matches("lidOpen"))
    })

    t.test("pour in water", t => {
      const { kettle } = t.context
      t.plan(2)
      kettle.send({
        type: "FILL_WATER",
        amount: 1000,
        temp: 10
      })
      const { context } = kettle.state
      t.is(context.amount, 1000)
      t.is(context.temp, 10)
    })

    t.test("generates SIREN action for filling in water", t => {
      t.plan(1)
      const siren = toSiren(t.context.kettle, {
        href(path) {
          return "http://localhost/kettle" + path ? ("/" + path) : path
        }
      })
      t.same(siren.actions[0].fields, [
        {
          name: "amount",
          type: "number",
          min: 1,
          max: 1600
        }, {
          name: "temp",
          type: "number",
          max: 100
        }
      ])
    })

    t.end()
  })

  t.test("can be started with water in it", t => {
    t.plan(1)
    const kettle = createKettle({ amount: 100 })
    kettle.send("START")
    t.ok(kettle.state.matches("heating"))
  })

  t.test("can NOT be started without water in it", t => {
    t.plan(1)
    const kettle = createKettle({ amount: 0 })
    kettle.send("START")
    t.ok(kettle.state.matches("idle"))
  })

  t.test("is done when reaching target temp", t => {
    t.plan(2)
    const kettle = createKettle({ amount: 100, temp: 99, targetTemp: 100 })
    kettle.send("START")
    kettle.clock.increment(300)
    t.is(kettle.state.context.temp, 100)
    t.is(kettle.state.value, "done")
  })

  t.end()
})
