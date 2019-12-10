
/** Protected resources by path */
const protected = {}

function addProtection(url, digest) {
  protected[url] = digest
}

function validProtection(url, digest) {
  const protection = protected[url]
  return (!protection || protection === digest)
}

function isProtected(url) {
  return !!protected[url]
}

module.exports = function(options = {}) {
  const headers = {
    "WWW-Authenticate": "Basic",
    ...options.header,
  }
  if (options.realm) {
    headers["WWW-Authenticate"] = `Basic realm="${realm.replace(/"/g, '\\"')}"`
  }

  function handleError(ctx, error) {
    if (error.status === 401 || error.status === 403) {
      ctx.throw(error.status, null, {
        headers
      })
    } else {
      throw error
    }
  }

  return async function(ctx, next) {
    try {
      if (isProtected(ctx.request.href)) {
        if (ctx.headers["authorization"]) {
          if (!validProtection(ctx.request.href, ctx.headers["authorization"])) {
            const error = new Error("Forbidden")
            error.status = 403
            throw error
          }
        } else {
          const error = new Error("Unauthorized")
          error.status = 401
          throw error
        }
      }
      await next()
      if (ctx.headers["authorization"] && 201 === ctx.status && ctx.state.id !== undefined) {
        addProtection(ctx.resourceUrl(ctx.state.id), ctx.headers["authorization"])
      }
    } catch (error) {
      handleError(ctx, error)
    }
  }
}
