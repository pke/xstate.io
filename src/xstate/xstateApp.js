const { findState, saveState, removeState } = require("../persist")

const startService = require("./startService")
const mergeContext = require("../mergeContext")

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
  /**
   * Finds a persisted xstate service by id.
   * 
   * @param {String|Number} id of the running app to find
   */
  find(id) {
    if (id) {
      const state = findState(id)
      if (state) {
        return {
          id, 
          service: startService(createMachine(), state)
        }
      }
    }
  },
  
  /**
   * Creates an object that describes the context fields in a type safe way.
   * 
   * @param {Object} initialContext that is merged with the machine context to 
   * fill the default value of each field.
   */
  contextSchema(initialContext) {
    const machine = createMachine()
    const { meta = {}, context = {}, initial, id } = machine
    const initialStateMeta = meta[initial] || {}
    initialStateMeta.fields = initialStateMeta.fields || []
    const mergedContext = mergeContext(context, initialContext)
    return {
      type: "object",
      title: initialStateMeta.title || "Create " + id,
      properties: (Object.keys(context) || []).map(key => {
        const fieldMeta = initialStateMeta.fields.find(({ name }) => name === key) || {}
        return {
          ...fieldMeta,
          "default": mergedContext[key],
          type: fieldType(context[key], fieldMeta.type),
          name: key,
          value: context[key]
        }
      })
    }
  },
  
  create(context) {
    const machine = createMachine()
    const service = startService(
      machine.withContext(mergeContext(machine.context, context))
    )
    const id = saveState(undefined, service.state)
    return {
      id, service
    }
  },
  
  delete(id) {
    removeState(id)
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
