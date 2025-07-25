import express from 'express';


const app = express();



app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to booking-service!' });
});

const port = process.env.PORT || 3003;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api from booking-service`);
});
server.on('error', console.error);
