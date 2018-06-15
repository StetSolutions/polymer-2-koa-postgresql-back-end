const path = require('path')

const { pool } = require(path.resolve('./config/lib/pg'))
const { _raw, sql } = require('pg-extra')

module.exports = {

  /**
   * Create user role
   * @param   {object} user
   * @returns {array}
   */
  createUserRole: (user, roleId) => {
    return pool.query(
      sql`
        INSERT INTO public.user_role (user_id, role_id)
        SELECT ${user.id}, ${roleId}
        RETURNING *;
      `
    )
  },

  /**
   * Delete user roles
   * @param {integer} userId
   */
  deleteUserRoles: (userId) => {
    return pool.query(
      sql`
        DELETE FROM public.user_role 
        WHERE user_id = ${userId};
      `
    )
  }

}
