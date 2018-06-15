const path = require('path')

const { pool } = require(path.resolve('./config/lib/pg'))
const { _raw, sql } = require('pg-extra')

module.exports = {

  /**
   * Create Role
   * @param   {object} role
   * @returns {array}
   */
  createRole: (role) => {
    return pool.query(
      sql`
        INSERT INTO public.role (role_name)
        VALUES ( ${role.role_name} )
        RETURNING *;
      `
    )
  },

  /**
   * Delete Role
   * @param   {integer} roleId
   * @returns {array}
   */
  deleteRole: (roleId) => {
    return pool.query(
      sql`
        DELETE FROM public.role
        WHERE id = ${roleId}
        RETURNING id;
      `
    )
  },

  /**
   * Edit Role
   * @param   {object} role
   * @returns {array}
   */
  editRole: (role) => {
    return pool.query(
      sql`
        UPDATE public.role
        SET 
          role_name = ${role.role_name},
          updated = now()
        WHERE id = ${role.id}
        RETURNING *;
      `
    )
  },

  /**
   * Get Role by id
   * @param   {integer} roleId
   * @returns {array}
   */
  getRoleById: (roleId) => {
    return pool.query(
      sql`
        SELECT id, role_name, created, updated
        FROM public.role
        WHERE id = ${roleId};
      `
    )
  },

  /**
   * Get Role by role_name
   * @param   {string} roleName
   * @returns {array}
   */
  getRoleByName: (roleName) => {
    return pool.query(
      sql`
        SELECT id, role_name, created, updated
        FROM public.role
        WHERE role_name = ${roleName};
      `
    )
  },

  /**
   * Get Roles
   * @param   {string} [column = 'id']
   * @param   {string} [direction = 'DESC']
   * @param   {integer} [limit = null]
   * @param   {integer} [offset = 0]
   * @returns {array}
   */
  getRoles: (
    column = 'id',
    direction = 'DESC',
    limit = null,
    offset = 0
  ) => {
    return pool.query(
      sql`
        SELECT id, role_name, created, updated 
        FROM public.role
      `.append(
          _raw`
            ORDER BY "${column}" ${direction} 
            LIMIT ${limit} 
            OFFSET ${offset} 
          `
        )
    )
  },

  /**
   * Get Roles by User Id
   * @param   {integer} userId
   * @returns {array}
   */
  getRolesByUserId: (userId) => {
    return pool.query(
      sql`
        SELECT role_id, role_name
        FROM public.user u 
        INNER JOIN public.user_role ur ON u.id = user_id
        INNER JOIN public.role r ON ur.role_id = r.id
        WHERE u.id = ${userId};
      `
    )
  }
}
