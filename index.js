import express from 'express';


const app = express();
const auth = (req, res) => {
  console.log('someone is here');
  res.send('authenticated');
}

app.get('/', auth);
app.listen(7000);
