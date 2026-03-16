import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    return user;
  },
);
