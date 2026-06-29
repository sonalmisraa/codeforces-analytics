import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 500,
  message?: string
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    message,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationMeta = { page, limit, total, totalPages };
  return sendSuccess(res, data, message, 200, pagination);
}
