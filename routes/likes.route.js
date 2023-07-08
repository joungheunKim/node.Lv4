const express = require('express');
const { Op } = require('sequelize');
const { Posts, Comments, Users, Likes } = require('../models');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// 좋아요 생성, 삭제 api
router.put('/posts/:post_id/likes', authMiddleware, async (req,res)=>{
  const {user_id} =res.locals.user;
  const {post_id} =req.params;

  try{
    //유효성 검사
    //인증된 사용자인지
    if (!res.locals.user) {
      return res
        .status(403)
        .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    // 좋아요를 이미 눌렀다면 삭제
    const isExitsLike = await Likes.findOne({
      where: {
        User_id: user_id,
        Post_id: post_id,
      }
    });
    if (isExitsLike){
      const deleteLike = await Likes.destroy({
        where:{
          User_id: user_id,
          Post_id: post_id,
        }
      })
      return res.status(200).json({ data: '좋아요가 삭제되었습니다.' });
    }
    else{
       // 새로운 좋아요 생성
    const createLike = await Likes.create({
      User_id: user_id,
      Post_id: post_id,
    });
    return res.status(201).json({ data: '좋아요 등록에 성공하였습니다.' });
    }
   
  } catch(error){
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
})

// 좋아요 갯수 확인
router.get('/posts/:post_id/likes', async (req, res)=>{
  const {post_id} =req.params;
  try {
    const likes = await Likes.findAll({
      where:{Post_id: post_id,},
      attributes: [
        'post_id'
      ]
    });

    if (likes !== 0){
      const results = likes.map((like) =>{
        return {
          postId: like.post_id,
        }
      })
      res.status(200).json({data: `좋아요 ${results.length}` })
    }
  } catch {
    return res
    .status(400)
    .json({ errorMessage: '알 수 없는 오류가 발생했습니다.' });
  }
})

// 좋아요 한 개시글 조회 api
router.get('/posts/like',authMiddleware, async (req,res)=>{
  try {
    const {user_id} = res.locals.user;
    const likePost = await Likes.findAll({
      where: {
        User_id: user_id
      },
    });

    if (likePost){
      const results = likePost
      res.status(200).json({data: `좋아요 ${results}` })

    }
    else{
      return res.status(400).json({ message: "게시글 조회 실패하였습니다." });
    }
  } 
  catch(error){
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '알 수 없는 오류가 발생했습니다.' });
  }
})

module.exports = router;
