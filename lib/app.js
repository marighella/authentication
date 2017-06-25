import querystring from 'querystring';
import express from 'express';
import expressJwt from 'express-jwt'
import jwt from 'jsonwebtoken';
import request from 'request-promise';
import winston from 'winston';
import bodyParser from 'body-parser';

export default function(){
  const app = express();
  const SECRET = process.env.SECRET_JWT;
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  app.post('/refresh-token',
    expressJwt({secret: SECRET}),
    (req, res) => {
      const github_token = req.user.github_token
      const userData = req.body.user || {}
      const repositoryData = req.body.repository || {}
      const newPayload = {
        github_token,
        user: {
          id: userData.id || -1,
          login: userData.login || '',
        },
        repository: {
          id: repositoryData.id || -1,
          name: repositoryData.name || '',
          full_name: repositoryData.full_name ||  '',
        },
      }

      const token = jwt.sign(newPayload, SECRET, { expiresIn: '1d' });
      res.set('Authorization', `Bearer ${token}`)
      res.status(200).json({ jwt: token })
    });

  app.get('/', (req, res) => {
    const data = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_SECRET_KEY,
      code: req.query.code,
    }

    const callback = (result) => {
      const data = querystring.parse(result);
      let status_code = 500,
          message = 'Something is not good';

      if(!!data.error) {
        winston.error('GITHUB', 'user not allowed on github', data);
        status_code, message = 401, 'Not authorized'
      } else if(!!data.access_token ) {
        const token = jwt.sign({ github_token: data.access_token }, SECRET, { expiresIn: '1d' });
        res.set('Authorization', `Bearer ${token}`)
        res.status(200).json({ jwt: token })
        return true;
      }else{
        winston.error('GITHUB', 'response not valid', data);
      }

      res.status(status_code).send(message)
    }

    request
      .post('https://github.com/login/oauth/access_token')
      .form(data)
      .then(callback)
  });

  return app;
}
