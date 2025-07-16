import {NextFunction} from "express";
import {AppError} from "./index";

export const errorMiddleware = (err:Error, req: Request, res: Response, next: NextFunction) => {
  if(err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(err.details && {details: err.details} )

    });
  }
  console.error(err);
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error',
  });
}
