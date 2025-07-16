import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to notification-service!' });
});

const port = process.env.PORT || 3005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api from notification-service`);
});
server.on('error', console.error);
