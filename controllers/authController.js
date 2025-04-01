import db from '../db/models/index.js';

class authController {
  demo = (req, res) => {
    return res.send('Hello form auth');
  };
  register = async (req, res) => {
    const { fullname, email, phone, address, gender, username, password } =
      req.body;
    try {
      await db.User.create({
        fullname,
        email,
        phone,
        address,
        gender,
        username,
        password,
        createdAt: Date(),
      });
      return res.status(200);

      //     .json({
      //     accesToken: accesToken,
      //     refreshToken: refreshToken.refreshToken,
      //     type: "Bearer",
      //     expiresIn: new Date().setDate(
      //       new Date().getDate() + Number(ACCESS_TOKEN_LIFE)
      //     ),
      //   });
    } catch (error) {
      res.send(error);
    }
  };
}

const auth = new authController();
export default auth;
