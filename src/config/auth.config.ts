import dotenv from 'dotenv';

dotenv.config();

export const getAuthConfig = () => {
  return {
    jwt: {
      access: {
        secret: process.env.JWT_SECRET,
        expiresIn: +(process.env.JWT_EXPIRES_IN || 600),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: +(process.env.JWT_REFRESH_EXPIRES_IN || 604800),
      },
    },
  };
};
