const path = require('path')

const passport = require('koa-passport')

const roleService = require(path.resolve('./modules/role/services/role.service.js'))
const userService = require(path.resolve('./modules/user/services/user.service.js'))

require(path.resolve('./modules/authentication/strategies/local.js'))

/**
 * Get User by id
 * @param   {integer} userId
 * @returns {object}
 */
const getUserById = async (userId) => {
  let roles = []

  const resultA = await userService.getUserById(userId)
  const resultB = await roleService.getRolesByUserId(userId)

  let user = resultA.rows[0]

  resultB.rows.forEach((row) => {
    roles.push(row.role_name)
  })

  if (user) {
    user.roles = roles
  }

  return user
}

/**
 * Serialize user
 * @param     {object} user
 * @callback  done
 */
passport.serializeUser((user, done) => {
  done(null, user.id)
})

/**
 * Deserialize user
 * @param     {integer} userId
 * @callback  done
 */
passport.deserializeUser(async (userId, done) => {
  const user = await getUserById(userId)

  if (user) {
    done(null, user)
  } else {
    done('Unauthorized')
  }
})

module.exports = {

  /**
   * Login
   * @param     {object} ctx
   * @callback  next
   * @return    {object}
   */
  login: async (ctx, next) => {
    return passport.authenticate('local', function (err, user, info, status) {
      if (err || !user) {
        ctx.logout()

        ctx.throw(401)
      } else {
        ctx.body = user

        ctx.login(user)
      }
    })(ctx, next)
  },

  /**
   * Logout
   * @param {object} ctx
   */
  logout: async (ctx) => {
    ctx.logout()

    this.session = null

    ctx.status = 204
  }
}
