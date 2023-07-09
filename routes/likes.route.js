const express = require('express');
const { Posts, Likes, Users } = require('../models');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// 좋아요 생성, 삭제 api
router.put('/posts/:post_id/likes', authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { post_id } = req.params;

  const post = await Posts.findOne({where:{post_id:post_id}})
  // Promise { <pending> } 프로미스 문법으로 뜨길래 await 로 불러와 문제해결
  
  try {
    //유효성 검사
    //인증된 사용자인지
    if (!res.locals.user) {
      return res
        .status(403)
        .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }

    // 좋아요를 이미 눌렀는지 확인
    const Like = await Likes.findOne({
      where: {
        User_id: user_id,
        Post_id: post_id,
      },
    });
    // 좋아요를 이미 눌렀다면 삭제
    if (Like) {
      await Likes.destroy({
        where: {
          User_id: user_id,
          Post_id: post_id,
        },
      });
      await Posts.update(
        { likes: post.likes - 1 },
        { where: { post_id: post.post_id } },
      );
      return res.status(200).json({ data: '좋아요가 삭제되었습니다.' });
    } else {
      // 새로운 좋아요 생성
      await Likes.create({
        User_id: user_id,
        Post_id: post_id,
      });
      await Posts.update(
        { likes: post.likes + 1 },
        { where: { post_id: post.post_id } },
      );
      return res.status(201).json({ data: '좋아요 등록에 성공하였습니다.' });
    }
  } catch (error) {
    console.error(error);

    // 예외 종류에 따른 에러메시지
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res
        .status(403)
        .json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }

    return res
      .status(400)
      .json({ errorMessage: '좋아요 등록에 실패하였습니다.' });
  }
});

// 좋아요 갯수 확인
router.get('/posts/:post_id/likes', async (req, res) => {
  const { post_id } = req.params;
  try {
    const likes = await Likes.findAll({
      where: { Post_id: post_id },
      attributes: ['post_id'],
    });

    if (likes !== 0) {
      const results = likes.map((like) => {
        return {
          postId: like.post_id,
        };
      });
      res.status(200).json({ data: `좋아요 ${results.length}` });
    }
  } catch {
    return res
      .status(400)
      .json({ errorMessage: '알 수 없는 오류가 발생했습니다.' });
  }
});

// 좋아요 한 개시글 조회 api
router.get('/post/likes', authMiddleware, async (req, res) => {
  try {
  const { user_id } = res.locals.user;
  const likePost = await Likes.findAll({
    where: {User_id: user_id},
    attributes:['like_id'],
    include: [
      {
        model: Posts,
        order:[['likes', 'DESC']],
        include:[{ model:Users, attributes:['nickname']}]
      }
    ]
    // 좋아요를 Posts에서 불러오게 바꿈으로 필요없어짐
    // where: { User_id: user_id },
    // attributes:['like_id','post_id'],
    // // Posts를 바로 불러오는 include
    // include: [{ model: Posts,
    // attributes:['post_id','title','content',] }],
    // // [] 배열안에 있는 객체를 꺼내기 위한 raw (방법을 바꿔 이제쓸모X)
    // // raw: true
  });

  if (!likePost){
    return res.status(200).json({errorMessage:'좋아요 게시글이 없습니다.'})
  }
  return res.status(200).json(likePost)

  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '알 수 없는 오류가 발생했습니다.' });
  }
});

module.exports = router;
