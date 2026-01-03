import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

// admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    // 直接判斷資料表傳過來的布林值
    if (user && user.isAdmin === true) {
      return true;
    }

    throw new ForbiddenException('權限不足：您不是系統管理員');
  }
}