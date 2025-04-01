import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

console.log('DATABASE_DIALECT:', process.env.DATABASE_DIALECT);

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD || '',
  {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT || 'mysql',
    port: process.env.DATABASE_PORT || 3306,
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
