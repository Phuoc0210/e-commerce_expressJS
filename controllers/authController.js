import { User, Otp, RefreshToken } from '../db/models';
import { v4 as uuidv4 } from 'uuid';
import transporter from '../configs/nodemailer';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_HASH = Number(process.env.SALT_HASH);
const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP;
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP;

const generateToken = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

class authController {
  register = async (req, res) => {
    const data = req.body;
    for (let field in data) {
      if (!data[field]) {
        return res.json({
          success: false,
          message: `Field ${field} is empty`,
        });
      }
    }

    try {
      const user = await User.findOne({
        where: { username: data.username },
      });
      if (user) {
        return res.json({ success: false, message: 'User already exist' });
      }
      const salt = bcrypt.genSaltSync(SALT_HASH);
      const hash = await bcrypt.hashSync(data.password, salt);
      await User.create({
        id: uuidv4(),
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        role: 'user',
        username: data.username,
        password: hash,
        createdAt: Date(),
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Welcome to PuShop',
        text: `Welcome to PuShop website. Your account has been created with email ${data.email}`,
      };
      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'Create successfully!' });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };
  login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    try {
      const user = await User.findOne({
        where: { username: username },
      });

      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          const payload = {
            username: user.username,
            fullname: user.fullname,
            role: user.role,
          };

          const accessToken = generateToken(payload, ACCESS_TOKEN_EXP);
          const refreshToken = generateToken(payload, REFRESH_TOKEN_EXP);

          await RefreshToken.create({
            id: uuidv4(),
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });

          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: payload,
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid password',
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid username',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  logout = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Please login!',
        });
      }
      await res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 0,
      });

      return res.status(200).json({
        success: true,
        message: 'Logout successfully!',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  requestOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: 'Email is required',
      });
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          success: false,
          message: 'Email not found',
        });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await Otp.create({
        id: uuidv4(),
        userId: user.id,
        email,
        otp,
        expiresAt,
        isUsed: false,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Password Reset',
        html: `
          <p>You requested to reset your password.</p>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      await transporter.sendMail(mailOptions);

      return res.json({
        success: true,
        message: 'OTP sent to your email',
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  };
  verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    try {
      const otpRecord = await Otp.findOne({
        where: { email, otp, isUsed: false },
      });

      if (!otpRecord) {
        return res.json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      if (new Date() > new Date(otpRecord.expiresAt)) {
        return res.json({
          success: false,
          message: 'OTP has expired',
        });
      }

      await otpRecord.update({ isUsed: true });

      return res.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  };
  resetPasswordWithOtp = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.json({
        success: false,
        message: 'Email and new password are required',
      });
    }

    try {
      const otpRecord = await Otp.findOne({
        where: { email, isUsed: true },
        order: [['createdAt', 'DESC']],
      });

      if (!otpRecord) {
        return res.json({
          success: false,
          message:
            'No verified OTP found. Please request and verify OTP first.',
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          success: false,
          message: 'User not found',
        });
      }

      const salt = bcrypt.genSaltSync(SALT_HASH);
      const hash = await bcrypt.hashSync(newPassword, salt);

      await user.update({ password: hash });

      await Otp.destroy({ where: { email } });

      return res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  };
  refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    try {
      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken },
      });
      if (!tokenRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      if (new Date() > new Date(tokenRecord.expiresAt)) {
        await tokenRecord.destroy();
        return res.status(401).json({
          success: false,
          message: 'Refresh token has expired',
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
      const user = await User.findOne({ where: { id: tokenRecord.userId } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      const payload = {
        username: user.username,
        fullname: user.fullname,
        role: user.role,
      };
      const newAccessToken = generateToken(payload, ACCESS_TOKEN_EXP);

      return res.json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }
  };
}

const auth = new authController();
export default auth;
