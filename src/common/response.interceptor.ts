// src/common/response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardResponse } from './response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    // 獲取當前 HTTP 請求的狀態碼
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map(data => {
        // 如果 Controller 已經返回了標準格式，則不重複包裝 (例如自定義錯誤)
        if (data && typeof data === 'object' && data.statusCode) {
             return data;
        }

        // 成功響應包裝
        return {
          statusCode: response.statusCode, // 使用 Controller 設置的 HTTP 狀態碼 (例如 200, 201)
          success: true,
          message: data?.message || '', // 優先使用 Controller 提供的 message
          data: data.data, // 將實際數據放在 data 欄位
        };
      }),
    );
  }
}