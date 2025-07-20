
import express from 'express';
import {errorMiddleware} from "../../../packages/error-handler/error-middleware";
import cookieParser from 'cookie-parser';
const app = express();


app.use(express.json());
app.use(cookieParser());


app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to property-service!' });
});

// Middleware
app.use(errorMiddleware);

// Import routes

const port = process.env.PORT || 3002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api from property-service`);
});
server.on('error', console.error);
