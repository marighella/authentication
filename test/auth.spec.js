import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import nock from 'nock'
import jwt  from 'jsonwebtoken'
import app  from '../lib/app'

describe('Authentication', () => {

  beforeEach( () => {
    process.env.SECRET_JWT = 'random_string'
  })

  afterEach( () => {
    nock.cleanAll()
  })

  describe('valid github code', () => {
    const GITHUB_TOKEN = 'blablabla'

    beforeEach( () => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, `access_token=${GITHUB_TOKEN}`)
    })

    it('should return status 200', async ()=>{
      const res = await request(app())
        .get('/auth/?code=685342281f0d09fdd38e')
        .send()
      assert.equal(res.status, 200)
    })

    it('should return a JWT valid', async () => {
      const res = await request(app())
        .get('/auth/?code=685342281f0d09fdd38e')
        .send()
      const token = res.headers['authorization'].split(' ')[1]
      const user = jwt.verify(token, process.env.SECRET_JWT)

      assert.equal(user.github_token, GITHUB_TOKEN)
    })

    it('should return a JWT on response body', async () => {
      const res = await request(app())
        .get('/auth/?code=685342281f0d09fdd38e')
        .send()
      const token = res.headers['authorization'].split(' ')[1]

      assert.equal(res.body.jwt, token)
    })

  })

  describe('invalid github code', () => {
    const GITHUB_TOKEN = 'blablabla'

    beforeEach( () => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, `error=any message here`)
    })

    it('should return a 401', async () => {
      const res = await request(app())
        .get('/auth/?code=invalid')
        .send()

      assert.equal(res.status, 401)
    })
  })
})
