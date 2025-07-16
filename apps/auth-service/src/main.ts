import express from 'express';
import {errorMiddleware} from "../../../packages/error-handler/error-middleware";
import cookieParser from 'cookie-parser';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = express();
app.use(cors)
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use(errorMiddleware)

app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port} from auth-service`);
});
