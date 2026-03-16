import { UserAccessTokenDao } from './user-access-token.dao';
import { UserDao } from './user.dao';

export * from './user.dao';
export * from './user-access-token.dao';

export const daos = [UserDao, UserAccessTokenDao];
