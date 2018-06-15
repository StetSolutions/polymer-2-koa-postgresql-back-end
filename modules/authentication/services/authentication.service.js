const path = require('path')

const { pool } = require(path.resolve('./config/lib/pg'))
const { sql } = require('pg-extra')

module.exports = {

  /**
   * Get User by username with password hash
   * @param   {string} username
   * @returns {array}
   */
  getUserByUsername: (username) => {
    return pool.query(
      sql`
        SELECT id, username, email, first_name, last_name, password, created, updated
        FROM public.user
        WHERE username = ${username};
      `
    )
  }
}