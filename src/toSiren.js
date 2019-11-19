function toSiren(service, annotate = {}) {
  const current = service.state
  return {
    title: current.meta.title || current.id,
    properties: current.context,
    links: [
      {
        rel: ["self"],
        href: annotate.href("")
      }
    ],
    entities: [
      {
        class: "state",
        properties: current
      }
    ],
    actions: current.nextEvents.reduce((actions, event) => {
      let meta = current.meta[`${service.id}.${current.toStrings()[0]}`] 
      if (!meta) {
        meta =  { on: { [event]: {} } }
      }
      const { fields, ...rest} = ((meta.on||{})[event] || {})
      if (Array.isArray(fields) || service.machine.transition(current, event).changed) {
        let action = {
          name: event,
          href: annotate.href && annotate.href(event),
          method: "PUT",
          fields,
          ...rest
        }
        actions.push(action)
      }
      return actions
    }, [])
  }
}

module.exports = toSiren
