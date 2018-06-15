const path = require('path')

const roleService = require(path.resolve('./modules/role/services/role.service.js'))

module.exports = {

  /**
   * Create Role
   * @async
   * @param ctx
   */
  createRole: async (ctx) => {
    const role = ctx.request.body

    const result = await roleService.createRole(role)

    if (result.rowCount) {
      ctx.status = 201
    }
  },

  /**
   * Delete Role
   * @async
   * @param ctx
   */
  deleteRole: async (ctx) => {
    const params = ctx.params
    const result = await roleService.deleteRole(params.id)
    ctx.body = result.rows

    if (!result.rowCount) {
      ctx.status = 204
    }
  },

  /**
   * Edit Role
   * @async
   * @param ctx
   */
  editRole: async (ctx) => {
    const params = ctx.params
    let role = ctx.request.body

    role.id = params.id

    const result = await roleService.editRole(role)

    ctx.body = result.rows
  },

  /**
   * Get Role by id
   * @async
   * @param ctx
   */
  getRole: async (ctx) => {
    const params = ctx.params
    const result = await roleService.getRoleById(params.id)
    ctx.body = result.rows
  },

  /**
   * Get Roles
   * @async
   * @param ctx
   */
  getRoles: async (ctx) => {
    const resultA = await roleService.getRoles()
    const resultB = await roleService.getRoles(
      ctx.request.query.column,
      ctx.request.query.direction,
      ctx.request.query.limit,
      ctx.request.query.offset
    )

    ctx.body = {
      count: resultA.rowCount,
      results: resultB.rows
    }
  }
}
