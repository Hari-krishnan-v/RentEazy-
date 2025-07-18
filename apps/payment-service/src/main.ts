/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to payment-service!' });
});

const port = process.env.PORT || 3004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api from payment-service`);
});
server.on('error', console.error);
