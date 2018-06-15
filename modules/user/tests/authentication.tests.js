const path = require('path')

const server = require(path.resolve('./server.js'))

const request = require('supertest').agent(server.listen())
const { test } = require('ava')

const admin = {
  id: 1,
  email: 'admin@localhost.com',
  password: '!1A2b3C4d!',
  username: 'admin'
}

test.serial('Should login successfully', async t => {
  const res = await request
    .post('/api/v1/login')
    .send({
      password: admin.password,
      username: admin.username
    })

  t.is(res.status, 200)

  t.is(res.body.roles[0], 'admin')
})

test.serial('Should logout successfully', async t => {
  const res = await request
    .post('/api/v1/logout')

  t.is(res.status, 204)
})
