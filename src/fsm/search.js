const { Machine } = require("xstate")

const searchValid = (context, event) => {
  return context.canSearch && event.query && event.query.length > 0
};

const searchMachine = Machine({
  id: "search",
  initial: "idle",
  context: {
    canSearch: true
  },
  states: {
    idle: {
      on: {
        SEARCH: [
          {
            target: "searching",
            // Only transition to 'searching' if the guard (cond) evaluates to true
            cond: searchValid // or { type: 'searchValid' }
          },
          { target: ".invalid" }
        ]
      },
      meta: {
        on: {
          SEARCH: {
            fields: [
              {
                name: "query",
                title: "Enter search term",
                type: "text",
                min: 1
              }
            ]
          }
        }
      },
      initial: "normal",
      states: {
        normal: {},
        invalid: {}
      }
    },
    searching: {
      entry: "executeSearch"
      // ...
    },
    searchError: {
      // ...
    }
  }
},
{
  guards: {
    searchValid // optional, if the implementation doesn't change
  }
})
module.exports = searchMachine
