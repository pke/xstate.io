const { interpret } = require("xstate")

const { findState, saveState, removeState } = require("./persist")
const createService = require("./createService")
const mergeContext = require("./mergeContext")

const fieldType = (value, defaultType = "text") => {
  const baseType = typeof value
  if (baseType === "number") {
    return baseType
  } else if (value instanceof Date) {
    return "date"
  } else if (baseType === "boolean") {
    return "check"
  } else {
    return defaultType
  }
}

const createStateApp = createMachine => ({
  find(id) {
    if (id) {
      const state = findState(id)
      if (state) {
        return {
          id, 
          service: createService(createMachine(), state)
        }
      }
    }
  },
  createForm(initialContext) {
    const machine = createMachine()
    const { meta = {}, context = {}, initial, id } = createMachine()
    const initialStateMeta = meta[initial] || {}
    initialStateMeta.fields = initialStateMeta.fields || []
    const mergedContext = mergeContext(context, initialContext)
    return {
      title: initialStateMeta.title || "Create " + id,
      fields: (Object.keys(context) || []).map(key => {
        const fieldMeta = initialStateMeta.fields.find(({ name }) => name === key) || {}
        return {
          ...fieldMeta,
          value: mergedContext[key],
          type: fieldType(context[key], fieldMeta.type),
          name: key
        }
      })
    }
  },
  create(context) {
    const machine = createMachine()
    const service = interpret(
      machine.withContext(
        mergeContext(machine.context, context)
      )
    ).start()
    const id = saveState(undefined, service.state)
    return {
      id, service
    }
  },
  delete(id) {
    removeState(id)
  },
  validEvent(service, event) {
    const type = event.type || event
    return service.state.nextEvents.indexOf(type) !== -1 && service.machine.transition(service.state, event).changed
  },
  async send({ id, service }, event) {
    const newState = await service.send(event)
    if (newState.changed) {
      saveState(id, service.state)
      return true
    }
    return false
  }
})

module.exports = createStateApp
