import express from 'express';
import {errorMiddleware} from "../../../packages/error-handler/error-middleware";
import cookieParser from 'cookie-parser';

import router from "./routes/auth.router";

const host = process.env.HOST ?? 'localhost';
const port =  3001;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

// Import routes
app.use('/api',router)


app.use(errorMiddleware)

app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port} from auth-service`);
});
