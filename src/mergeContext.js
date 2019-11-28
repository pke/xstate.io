/**
 * Merges two contexts type-safe together
 */
module.exports = function mergeContexts(base = {}, init = {}) {
  return Object.keys(base).reduce((result, key) => {
    const baseValue = base[key]
    if (init[key] !== undefined) {
      const baseType = typeof baseValue
      if (baseType === "number") {
        result[key] = Number(init[key]) || result[key]
      } else if (baseValue instanceof Date) {
        result[key] = new Date(init[key])
      } else {
        result[key] = init[key] || result[key]
      }
    } else {
      result[key] = baseValue
    }
    return result
  }, base)
}
