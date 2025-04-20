import { User, Otp, RefreshToken } from '../db/models';
import { v4 as uuidv4 } from 'uuid';
import transporter, { use } from '../configs/nodemailer';
import generateOtpEmail from '../utils/emailTemplates/otpTemplate';
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
        return res.status(400).json({
          success: false,
          message: `Field ${field} is empty`,
        });
      }
    }

    try {
      const user = await User.findOne({
        where: { email: data.email },
      });
      if (user) {
        return res
          .status(409)
          .json({ success: false, message: 'User already exist' });
      }
      const salt = bcrypt.genSaltSync(SALT_HASH);
      const hash = await bcrypt.hashSync(data.password, salt);
      await User.create({
        id: uuidv4(),
        email: data.email,
        password: hash,
        name: data.name,
        role: 0,
        avatar: data.avatar,
        phone: data.phone,
        created_at: Date.now(),
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Welcome to PuShop',
        text: `Welcome to PuShop website. Your account has been created with email ${data.email}`,
      };
      await transporter.sendMail(mailOptions);

      res.status(201).json({ success: true, message: 'Create successfully!' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    try {
      const user = await User.findOne({
        where: { email: email },
      });

      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          const payload = {
            email: user.email,
            name: user.name,
          };

          const accessToken = generateToken(payload, ACCESS_TOKEN_EXP);
          const refreshToken = generateToken(payload, REFRESH_TOKEN_EXP);

          await RefreshToken.create({
            id: uuidv4(),
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    try {
      const user = await User.findOne({
        where: { email: email },
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      await Otp.destroy({
        where: { user_id: user.id },
      });
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 60 * 1000);

      await Otp.create({
        id: uuidv4(),
        user_id: user.id,
        otp,
        expires_at: expiresAt,
        status: 0,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Password Reset',
        html: generateOtpEmail(otp),
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }
    const user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    try {
      const otpRecord = await Otp.findOne({
        where: { user_id: user.id, otp: otp, status: 0 },
      });
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      if (new Date() > new Date(otpRecord.expires_at)) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired',
        });
      }

      await otpRecord.update({ status: 1 });
      const payload = {
        user_id: user.id,
      };
      const resetToken = generateToken(payload, process.env.RESET_TOKEN_LIFE);
      await res.cookie('resetToken', resetToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 30 * 1000,
      });
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  resetPasswordWithOtp = async (req, res) => {
    const resetToken = req.cookies.resetToken;
    if (!resetToken) {
      return res.status(401).json({
        success: false,
        message: 'Reset token is required. Please verify OTP first.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    try {
      const otpRecord = await Otp.findOne({
        where: { user_id: user.id, status: 1 },
      });

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message:
            'No verified OTP found. Please request and verify OTP first.',
        });
      }

      const isMatch = await bcrypt.compare(newPassword, user.password);
      if (isMatch) {
        return res.status(400).json({
          success: false,
          message: 'New password cannot be the same as the old password',
        });
      }

      const salt = bcrypt.genSaltSync(SALT_HASH);
      const hash = bcrypt.hashSync(newPassword, salt);

      await user.update({ password: hash });
      await Otp.destroy({ where: { user_id: user.id } });

      res.clearCookie('resetToken');

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      return res.status(500).json({
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

      await jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
      const user = await User.findOne({ where: { id: tokenRecord.user_id } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      const payload = {
        username: user.username,
        fullname: user.fullname,
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
