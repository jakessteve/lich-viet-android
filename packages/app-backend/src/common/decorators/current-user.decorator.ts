import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../jwt.util.js';

export const CurrentUser = createParamDecorator((data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as JwtPayload | undefined;
  if (!user) return undefined;
  return data ? user[data] : user;
});
