const path = require('path')

const Acl = require('acl')
const router = require('koa-router')()

const roleController = require(path.resolve('./modules/role/controllers/role.controller.js'))

const acl = new Acl(new Acl.memoryBackend())

/**
 * Secured
 * @param     {object} ctx
 * @callback  next
 */
const secured = async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    const isAllowed = await acl.areAnyRolesAllowed(
      ctx.state.user.roles,
      ctx._matchedRoute,
      ctx.method.toLowerCase(),
      (err, status) => {
        if (!err) {
          return status
        }
      }
    )

    if (isAllowed) {
      return next()
    }
  }

  ctx.status = 401
}

acl.allow(
  [{
    roles: ['admin'],
    allows: [
      {
        resources: '/api/v1/roles',
        permissions: ['get', 'post']
      },
      {
        resources: '/api/v1/roles/:id',
        permissions: ['delete', 'get', 'post']
      }
    ]
  }]
)

router
  .del('/api/v1/roles/:id', secured, roleController.deleteRole)

  .get('/api/v1/roles', secured, roleController.getRoles)
  .get('/api/v1/roles/:id', secured, roleController.getRole)

  .post('/api/v1/roles', secured, roleController.createRole)
  .post('/api/v1/roles/:id', secured, roleController.editRole)

module.exports = router
