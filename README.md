# xState API Server

Exposes xState statecharts as REST Hypermedia API using SIREN.

## `GET /`

Lists all known xState charts.

## Starting a statechart from a Gist

The gist must be public.
[xState Viz](https://xstate.js.org/viz/) saved statecharts can be loaded for now.

### `GET /<gist>`

Fetches the given gist `machine.js` and generates a form to fill its context.
The forms action points to `POST /<gist>`

### `POST /<gist>?context`

Fetches the given gist `machine.js` file and builds it with the given `context` vars.

### Example

Gist: `631ecba85437bb21a24ae86f67595623`


### Problems:

POST response "self" link points to POST original URL (incl query). Shouldn't 
it point to the resources URL instead?
