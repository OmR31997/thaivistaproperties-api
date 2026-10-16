export default () => ({
  database: {
    uri: process.env.MONGODB_URI,
  },
  admin: {
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
});
