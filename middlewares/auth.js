const jwt = require('jsonwebtoken');
const { Users } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const { Authorization } = req.cookies;
    const [tokenType, token] = Authorization.split(' ');
    if (tokenType !== 'Bearer') {
      return res
        .status(401)
        .json({ message: '토큰 타입이 일치하지 않습니다.' });
    }

    const decodedToken = jwt.verify(token, 'customized_secret_key');
    const user_id = decodedToken.user_id;
    const user = await Users.findOne({ where: { user_id } });

    if (!user) {
      res.clearCookie('Authorization');
      return res
        .status(401)
        .json({ message: '토큰 사용자가 존재하지 않습니다.' });
    }
    res.locals.user = user;

    next();
  } catch (error) {
    res.clearCookie('Authorization');
    return res.status(401).json({
      message: '비정상적인 요청입니다.',
    });
  }
};
