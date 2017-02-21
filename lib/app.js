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
			).then((result)=>{
				const data = querystring.parse(result);
				const token = jwt.sign({ github_token: data.access_token }, SECRET);
				res.set('Authorization', `Bearer ${token}`)
				res.send('authenticated');
			})
  });

  return app;
}
