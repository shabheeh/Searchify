import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";


interface CustomError extends Error {
    status: number;
    code?: number;
}


export const errorHandler = (
  error: CustomError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  let status = error.status || 500;
  let message = 'Internal server error';

  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  } else if (process.env.NODE_ENV === 'development') {
    message = error.message;
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  res.status(status).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  };

  res.status(404).json(response);
};