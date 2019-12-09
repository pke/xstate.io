# xState API Server

Exposes xState state charts as REST Hypermedia API using SIREN.

## `GET /`

Lists all known xState charts.

## Starting a state chart from a Gist

The gist must be public.
[xState Viz](https://xstate.js.org/viz/) saved state charts can be loaded for now.

### `GET /<gist>`

Fetches the given gist `machine.js` and generates a form to fill its context.
The forms action points to `POST /<gist>`

### `POST /<gist>?context`

Fetches the given gist `machine.js` file and builds it with the given `context`
variables.

### Example

Gist: `631ecba85437bb21a24ae86f67595623`

### Problems:

POST response "self" link points to POST original URL (incl. query). Shouldn't
it point to the resources URL instead?

## `POST /<chart>` - Create state chart service

You can create a new state chart service by calling

`POST /<chart>`

### Protect the service using Basic Authorization

Just send an `Authorization: Basic` HTTP header with your request.
When you want to interact with the service again, you have to send the same
Authorization header with every request.

**Note**: Protected services can not be made public at the moment. It's also not
possible at the moment to protect publicly created services.

A possible way to add such functionality via middleware would be to annotate the
possible actions for a resource. When its currently not protected the middleware
could inject an action to a `PUT /protect` endpoint and for protected services
a `DELETE /protect` to remove the protection or `PATCH /protect` to change the
credentials.

Future versions of the API could also support ACL scenarios for services.
So some users could then just read the service state and get updates but would
not be able to change it/delete it.

## `GET /bing/:daysBack?`

Gets the wallpaper of the day from Bing.

| param | description |
|-------|-------------|
| `daysBack` | can range from `0..7`. Defaults to `0`|

This can be used in CSS like:

```css
html {
  height: 100vh;
  width: 100vw;
}
body {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-image: url(https://restlr.io/bing)
}
```
