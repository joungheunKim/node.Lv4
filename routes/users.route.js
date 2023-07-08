const express = require('express');
const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

//회원가입 API
router.post('/signup', async (req, res) => {
  const {
    nickname,
    password,
    confirmPassword,
  } = req.body;
  console.log(Users);
  const isExitsUser = await Users.findOne({
    where: {
      nickname: nickname,
    },
  });
  if (isExitsUser) {
    return res.status(409).json({ message: '이미 존재하는 아이디 입니다.' });
  } else if (password !== confirmPassword) {
    return res.status(409).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  //사용자 테이블에 데이터 삽입
  const user = await Users.create({
    nickname,
    password,
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});
// 로그인 API
router.post('/login', async (req, res) => {
  const { nickname, password } = req.body;
  const user = await Users.findOne({
    where: { nickname },
  });

  if (!user) {
    return res
      .status(401)
      .json({ message: '해당하는 사용자가 존재하지 않습니다.' });
  } else if (user.password !== password) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const token = jwt.sign({ user_id: user.user_id }, 'customized_secret_key');

  //쿠키발급
  res.cookie('Authorization', `Bearer ${token}`);
  //response 할당
  return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

router.get('/login', authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  console.log(user_id);
  const user = await Users.findOne({
    where: { user_id },
  });

  res.status(200).json({ data: user });
});

module.exports = router;
