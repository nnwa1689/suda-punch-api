// src/common/response.interface.ts

export interface StandardResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}