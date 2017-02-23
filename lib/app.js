import querystring from 'querystring';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'request-promise';


export default function(){
  const app = express();
  const SECRET = process.env.SECRET_JWT;

  app.get('/', (req, res) => {
    request
      .post('https://github.com/login/oauth/access_token')
      .form(
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_SECRET_KEY,
          code: req.query.code,
        }
      ).then((result, code)=>{
        const data = querystring.parse(result);

        if(!!data.error) {
          console.error('GITHUB: User not allowed on github: ', data);
          res.status(401).send('Not authorized');
        } else if(!!data.access_token ) {
          const token = jwt.sign({ github_token: data.access_token }, SECRET, { expiresIn: '1d' });
          res.set('Authorization', `Bearer ${token}`)
          res.send('authenticated');
        }else{
          console.error('GITHUB: response not valid: ', result);
          res.send(501, 'Something is not good');
        }
      })
  });

  return app;
}
