const path = require('path')

const argon2 = require('argon2')
const owasp = require('owasp-password-strength-test')

const roleService = require(path.resolve('./modules/role/services/role.service.js'))
const userService = require(path.resolve('./modules/user/services/user.service.js'))
const userRoleService = require(path.resolve('./modules/user-role/services/user-role.service.js'))

/**
 * Check User Password
 * @async
 * @param   {object} ctx
 * @returns {boolean}
 */
const checkUserPassword = async (ctx) => {
  const user = ctx.request.body

  const owaspTest = owasp.test(user.password)

  if (owaspTest.errors.length) {
    ctx.throw(422)
  }

  return true
}

/**
 * Get User Roles
 * @async
 * @param   {integer} id
 * @returns {array}
 */
const getUserRoles = async (id) => {
  let roles = []

  const result = await roleService.getRolesByUserId(id)

  for (let role of result.rows) {
    roles.push(role)
  }

  return roles
}

/**
 * Hash User Password
 * @async
 * @param   {object} user
 * @returns {object}
 */
const hashUserPassword = async (user) => {
  const salt = await argon2.generateSalt()

  const hashed = await argon2.hash(user.password, salt)

  user.password = hashed

  return user
}

module.exports = {

  /**
   * Check User by email
   * @async
   * @param {object} ctx
   */
  checkUserByEmail: async (ctx) => {
    const email = ctx.params.email
    const result = await userService.getUserByEmail(email)
    const exists = result.rows[0]

    ctx.body = exists
  },

  /**
   * Check User by username
   * @async
   * @param {object} ctx
   */
  checkUserByUsername: async (ctx) => {
    const username = ctx.params.username
    const result = await userService.getUserByUsername(username)
    const exists = result.rows[0]

    ctx.body = exists
  },

  /**
   * Create User
   * @async
   * @param {object} ctx
   */
  createUser: async (ctx) => {
    let hashed

    const user = ctx.request.body
    const roles = JSON.parse(user.roles)

    if (await checkUserPassword(ctx)) {
      hashed = await hashUserPassword(user)
    }

    const result = await userService.createUser(hashed)

    for (const roleId of roles) {
      await userRoleService.createUserRole(result.rows[0], roleId)
    }

    if (result.rowCount) {
      ctx.status = 201
    }
  },

  /**
   * Delete User
   * @async
   * @param {object} ctx
   */
  deleteUser: async (ctx) => {
    const params = ctx.params
    const result = await userService.deleteUser(params.id)

    ctx.body = result.rows

    if (!result.rowCount) {
      ctx.status = 204
    }
  },

  /**
   * Edit User
   * @async
   * @param {object} ctx
   */
  editUser: async (ctx) => {
    const params = ctx.params

    let user = ctx.request.body
    user.id = params.id

    let result = await userService.editUser(user)

    if (user.roles) {
      const roles = JSON.parse(user.roles)

      await userRoleService.deleteUserRoles(result.rows[0].id)

      for (const roleId of roles) {
        await userRoleService.createUserRole(result.rows[0], roleId)
      }

      result.rows[0].roles = await getUserRoles(user.id)
    }

    ctx.body = result.rows[0]
  },

  /**
   * Get User
   * @async
   * @param {object} ctx
   */
  getUser: async (ctx) => {
    const params = ctx.params

    const result = await userService.getUserById(params.id)

    let user = result.rows[0]

    if (user) {
      user.roles = await getUserRoles(params.id)
    }

    ctx.body = user
  },

  /**
   * Get Users
   * @async
   * @param {object} ctx
   */
  getUsers: async (ctx) => {
    const query = ctx.request.query

    let users = []

    const resultA = await userService.getUsers(
      JSON.parse(query.search)
    )

    const resultB = await userService.getUsers(
      JSON.parse(query.search),
      ctx.request.query.column,
      ctx.request.query.direction,
      ctx.request.query.limit,
      ctx.request.query.offset
    )

    for (let user of resultB.rows) {
      user.roles = await getUserRoles(user.id)
      users.push(user)
    }

    ctx.body = {
      totalCount: resultA.rowCount,
      rows: users
    }
  },

  /**
   * Update Password
   * @async
   * @param {object} ctx
   */
  updatePassword: async (ctx) => {
    const body = ctx.request.body
    const params = ctx.params

    let hashed

    const resultA = await userService.getUserById(params.id)

    let user = resultA.rows[0]

    user.password = body.password

    await checkUserPassword(ctx)

    hashed = await hashUserPassword(user)

    const resultB = await userService.updateUserPassword(hashed)

    if (resultB.rowCount) {
      ctx.status = 204
    }
  },

  /**
   * Edit User
   * @async
   * @param {object} ctx
   */
  updateProfile: async (ctx) => {
    let roles = []

    const body = ctx.request.body
    body.id = ctx.params.id

    const resultA = await userService.editUser(body)
    const resultB = await roleService.getRolesByUserId(body.id)

    resultB.rows.forEach((row) => {
      roles.push(row.role_name)
    })

    let user = resultA.rows[0]

    user.roles = roles

    ctx.body = user
  }
}
