const { interpret } = require("xstate")

/**
 * Interprets a machine and optionally rehydrates it from a persisted state.
 * 
 * @param [Object] machine
 * @param [Object] state to rehydrate from
 */
module.exports = function startService(machine, state) {
  const service = interpret(machine)
    .start(state && machine.resolveState(state))
  return service
}
