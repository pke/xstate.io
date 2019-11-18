const {t} = require("tap")

const createCounter = require("../src/fsm/counter.js")

function stateLinks(service) {
  return service.state.nextEvents.map(event => {
    return {
      rel: []
    }
  })
}

function initialLink(service) {
  return {
    rel: ["first", "index"],
    href: `${service.initialState.value}`
  }
}

function toSiren(state) {

}

t.test("get initial POST url to create a counter", async t => {
  t.plan(0)
  
  const machine = createCounter(0)
  const json = JSON.stringify(machine.state)
  
})
