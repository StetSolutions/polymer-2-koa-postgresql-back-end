const path = require('path')

const { pool } = require(path.resolve('./config/lib/pg'))
const { _raw, sql } = require('pg-extra')

module.exports = {

  /**
   * Create example
   * @param   {string} name
   * @param   {string} image
   * @returns {array}
   */
  createExample: (name, image) => {
    return pool.query(
      sql`
        INSERT INTO public.example (name, image)
        VALUES (${name}, ${image})
        RETURNING id, name, image, created, updated;
      `
    )
  },

  /**
   * Delete example
   * @param   {integer} exampleId
   * @returns {array}
   */
  deleteExample: (exampleId) => {
    return pool.query(
      sql`
        DELETE FROM public.example
        WHERE id = ${exampleId}
        RETURNING id;
      `
    )
  },

  /**
   * Edit example
   * @param   {integer} id
   * @param   {string} name
   * @param   {string} image
   * @returns {array}
   */
  editExample: (id, name, image = null) => {
    return pool.query(
      sql`
        UPDATE public.example
        SET 
        name = ${name},
      `
        .append(
          (() => {
            if (image) {
              return sql`
                image = ${image},
              `
            }
          })()
        )
        .append(
          sql`
            updated = now()
            WHERE id = ${id}
            RETURNING id, name, image, created, updated;
          `
        )
    )
  },

  /**
   * Get example by id
   * @param   {integer} exampleId
   * @returns {array}
   */
  getExampleById: (exampleId) => {
    return pool.query(
      sql`
        SELECT id, name, image, created, updated
        FROM public.example
        WHERE id = ${exampleId};
      `
    )
  },

  /**
   * Get example by name
   * @param   {string} name
   * @returns {array}
   */
  getExampleByName: (name) => {
    return pool.query(
      sql`
        SELECT id, name, image, created, updated
        FROM public.example
        WHERE name = ${name};
      `
    )
  },

  /**
   * Get examples
   * @param   {string}  [column = 'id']
   * @param   {string}  [direction = 'DESC']
   * @param   {integer} [limit = none]
   * @param   {integer} [offset = 0]
   * @returns {array}
   */
  getExamples: (
    column = 'id',
    direction = 'DESC',
    limit = null,
    offset = 0
  ) => {
    return pool.query(
      sql`
        SELECT id, name, image, created, updated
        FROM public.example
      `
        .append(
          _raw`
            ORDER BY "${column}" ${direction} 
            LIMIT ${limit} 
            OFFSET ${offset} 
          `
        )
    )
  }
}
