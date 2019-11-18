const { State } = require("xstate")

const states = []

const findState = id => {
  const stateDefinition = states[id]
  if (stateDefinition) {
    const savedState = JSON.parse(stateDefinition)
    const state = State.create(savedState)
    return state
  }
}

const nextPersistId = () => states.length

const saveState = (id = nextPersistId(), state) => {
  states[id] = JSON.stringify(state)
  return id
}

const removeState = (id) => {
  states[id] = undefined
}

module.exports = {
  findState, saveState, removeState
}
