const {
  Machine,
  assign,
  send,
  sendParent,
  actions,
  spawn,
  raise,
  interpret,
  XState
} = require("xstate")

module.exports = function toMachine(machine) {
  if (typeof machine !== "string") {
    return machine
  }

  const createMachine = new Function(
    "Machine",
    "interpret",
    "assign",
    "send",
    "sendParent",
    "spawn",
    "raise",
    "actions",
    "XState",
    machine
  )

  const machines = []

  const machineProxy = (config, options) => {
    const machine = Machine(config, options)
    machines.push(machine)
    return machine
  }

  createMachine(
    machineProxy,
    interpret,
    assign,
    send,
    sendParent,
    spawn,
    raise,
    actions,
    XState
  )

  return machines[machines.length - 1]
}
