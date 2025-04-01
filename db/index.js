import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load biến môi trường
dotenv.config();

// Kiểm tra xem biến DATABASE_DIALECT có tồn tại không
console.log('DATABASE_DIALECT:', process.env.DATABASE_DIALECT);

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD || '', // Tránh lỗi nếu PASSWORD là null
  {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT || 'mysql', // Đảm bảo giá trị không undefined
    port: process.env.DATABASE_PORT || 3306, // Đảm bảo cổng MySQL đúng
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

export default connectDB;
