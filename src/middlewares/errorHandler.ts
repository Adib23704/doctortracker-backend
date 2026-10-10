import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ID format for value: ${err.value}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    details = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if ('code' in err && (err as MongoDuplicateKeyError).code === 11000) {
    statusCode = 409;
    const key = Object.keys((err as MongoDuplicateKeyError).keyValue || {})[0] || 'field';
    message = `Duplicate record: A resource with this ${key} already exists.`;
  } else {
    console.error('Unhandled Server Error:', err);
    if (process.env.NODE_ENV === 'development') {
      message = err.message || message;
      details = err.stack;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
};
