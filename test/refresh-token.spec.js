import 'babel-polyfill'

import assert  from 'assert'
import request from 'supertest'
import jwt  from 'jsonwebtoken'
import app  from '../lib/app'

describe('Refresh Token', () => {

  beforeEach( () => {
    process.env.SECRET_JWT = 'random_string'
  })

  describe('refresh token with new information', () => {
    const GITHUB_TOKEN = 'blablabla'

    it('should return status 200', async ()=>{
      const TOKEN = jwt.sign({ github_token: GITHUB_TOKEN }, process.env.SECRET_JWT, { expiresIn: '1d' });
      const res = await request(app())
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send()
      assert.equal(res.status, 200)
    })

    it('should return a JWT valid', async () => {
      const TOKEN = jwt.sign({ github_token: GITHUB_TOKEN }, process.env.SECRET_JWT, { expiresIn: '1d' });
      const user = {
        id: 12,
        login: 'John Doe',
      }
      const repository = {
        id: 123,
        name: 'org_name',
        full_name: 'org_name/opa',
      }
      const res = await request(app())
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send({
          user,
          repository,
        })
      const token = res.headers['authorization'].split(' ')[1]
      const payload = jwt.verify(token, process.env.SECRET_JWT)

      assert.equal(payload.github_token, GITHUB_TOKEN)
      assert.equal(payload.user.login, 'John Doe')
      assert.equal(payload.repository.full_name, 'org_name/opa')
    })

  })

})
