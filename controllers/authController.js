class authController {
  demo = (req, res) => {
    return res.send('Hello form auth');
  };
}

const auth = new authController();
export default auth;
