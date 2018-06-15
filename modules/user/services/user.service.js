const path = require('path')

const { pool } = require(path.resolve('./config/lib/pg'))
const { _raw, sql } = require('pg-extra')

/**
 * Build query
 * @param   {object} search
 * @returns {string|undefined}
 */
const buildQuery = (search) => {
  const queries = []

  // Term
  if (search.term) {
    const parsedTerms = parseTerm(search.term)

    queries.push(
      `
      AND (
        to_tsvector(email) @@ to_tsquery('${parsedTerms}') 
        OR to_tsvector(first_name) @@ to_tsquery('${parsedTerms}')
        OR to_tsvector(last_name) @@ to_tsquery('${parsedTerms}') 
        OR to_tsvector(username) @@ to_tsquery('${parsedTerms}')
      )
      `
    )
  }

  // Start date
  if (search.startDate) {
    queries.push(
      `AND created > '${search.startDate}'`
    )
  }

  // End date
  if (search.endDate) {
    queries.push(
      `AND created < '${search.endDate}'`
    )
  }

  return queries.join(' ')
}

/**
 * Parse term
 * @param   {string} term
 * @return  {string}
 */
const parseTerm = (term) => {
  const parts = []

  let terms = term
    .trim()
    .split(' ')

  terms = terms.filter((term) => {
    return term !== ''
  })

  terms.map((term, index) => {
    if (/[&|!()]{2,}/.test(terms[index])) {
      terms[index] = terms[index].charAt(0)
    }

    if (
      index > 0 &&
      !/[&|!()]/.test(terms[index]) &&
      !/[&|!()]/.test(terms[index - 1])
    ) {
      parts.push(index)
    }
  })

  parts.reverse().map((part) => terms.splice(part, 0, '|'))

  const parsed = terms.join(' ')

  return parsed
}

module.exports = {

  /**
   * Create User
   * @param   {object} user
   * @returns {array}
   */
  createUser: (user) => {
    return pool.query(
      sql`
        INSERT INTO public.user (username, email, password, first_name, last_name)
        VALUES (
          TRIM(${user.username}),
          TRIM(${user.email.toLowerCase()}),
          TRIM(${user.password}),
          TRIM(${user.firstName}),
          TRIM(${user.lastName})
        )
        RETURNING id, username, email, first_name, last_name, created, updated;
      `
    )
  },

  /**
   * Delete User
   * @param   {integer} userId
   * @returns {array}
   */
  deleteUser: (userId) => {
    return pool.query(
      sql`
        DELETE FROM public.user
        WHERE id = ${userId}
        RETURNING id;
      `
    )
  },

  /**
   * Edit User
   * @param   {object} user
   * @returns {array}
   */
  editUser: (user) => {
    return pool.query(
      sql`
        UPDATE public.user
        SET 
          email = TRIM(${user.email.toLowerCase()}),
          username = TRIM(${user.username}),
          first_name = TRIM(${user.firstName}),
          last_name = TRIM(${user.lastName}),
          updated = now()
        WHERE id = ${user.id}
        RETURNING id, username, email, first_name, last_name, created, updated;
      `
    )
  },

  /**
   * Get User by email
   * @param   {string} email
   * @returns {array}
   */
  getUserByEmail: (email) => {
    return pool.query(
      sql`
        SELECT id, username, email, first_name, last_name, created, updated 
        FROM public.user
        WHERE email = ${email};
      `
    )
  },

  /**
   * Get User by id
   * @param   {integer} userId
   * @returns {array}
   */
  getUserById: (userId) => {
    return pool.query(
      sql`
        SELECT id, username, email, first_name, last_name, created, updated 
        FROM public.user
        WHERE id = ${userId};
      `
    )
  },

  /**
   * Get User by username
   * @param   {string} username
   * @returns {array}
   */
  getUserByUsername: (username) => {
    return pool.query(
      sql`
        SELECT id, username, email, first_name, last_name, created, updated 
        FROM public.user
        WHERE username = ${username};
      `
    )
  },

  /**
   * Get Users
   * @param   {string}  [column = 'id']
   * @param   {string}  [direction = 'DESC']
   * @param   {integer} [limit = null]
   * @param   {integer} [offset = 0]
   * @param   {object}  [search = {}]
   * @returns {array}
   */
  getUsers: (
    search = {},
    column = 'id',
    direction = 'DESC',
    limit = null,
    offset = 0
  ) => {
    const query = buildQuery(search)

    return pool.query(
      sql`
        SELECT id, username, email, first_name, last_name, created, updated 
        FROM public.user T1
      `
        .append(
          _raw`
          WHERE TRUE ${query}
        `
        )
        .append(
          _raw`
          ORDER BY ${column} ${direction}
          LIMIT ${limit}
          OFFSET ${offset}
        `
        )
    )
  },

  /**
   * Update User Password
   * @param   {object} user
   * @returns {array}
   */
  updateUserPassword: (user) => {
    return pool.query(
      sql`
        UPDATE public.user
        SET 
          password = ${user.password},
          updated = now()
        WHERE id = ${user.id}
        RETURNING id;
      `
    )
  }
}
