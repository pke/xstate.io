const { interpret } = require("xstate")

module.exports = function createService(machine, state) {
  const service = interpret(machine)
    .start(state && machine.resolveState(state))
  return service
}
