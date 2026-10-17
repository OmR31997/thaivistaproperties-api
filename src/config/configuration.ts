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
  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 'cloudinary',
    rootFolder: process.env.CLOUDINARY_ROOT_FOLDER ?? 'thaivista/assets',
    mediaBaseUrl: process.env.MEDIA_BASE_URL,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
});
