const express = require('express');
const { Op } = require('sequelize');
const { Posts, Comments, Users } = require('../models');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// 댓글 작성 API (authMiddleware: 사용자 인증)
router.post('/posts/:post_id/comments', authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { post_id } = req.params;
  const { comment } = req.body;

  try {
    // 게시글 조회
    const post = await Posts.findOne({ where: { post_id } });
    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    // 댓글 데이터 유효성 검사
    if (!comment || typeof comment !== 'string') {
      return res
        .status(412)
        .json({ errorMessage: '댓글의 형식이 올바르지 않습니다.' });
    }

    // 새로운 댓글 작성
    await Comments.create({
      User_id: user_id,
      Post_id: post_id,
      comment,
    });

    return res.status(201).json({ message: '댓글 작성에 성공하였습니다.' });
  } catch (error) {
    console.error(error);

    // 예외 종류에 따라 에러 메시지 설정
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
      .json({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

// 댓글 조회 API
router.get('/posts/:post_id/comments', async (req, res) => {
  const { post_id } = req.params;

  try {
    // 댓글 조회
    const comments = await Comments.findAll({
      attributes: ['comment', 'comment_id'],
      where: { Post_id: post_id },
    });

    if (comments.length !== 0) {
      const results = comments.map((comments) => {
        return {
          comment: comments.comment,
          commentId: comments.comment_id,
        };
      });
      res.status(200).json({ results });
    } else {
      res.json({ message: '댓글이 존재하지 않습니다.' });
    }

    //return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

// 댓글 상세 조회 API
router.get('/comments/:comment_id', async (req, res) => {
  const { comment_id } = req.params;

  try {
    // 댓글 조회
    const comment = await Comments.findOne({
      where: { comment_id },
    });

    if (!comment) {
      return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    }

    return res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '댓글 상세 조회에 실패하였습니다.' });
  }
});

// 댓글 수정 API (authMiddleware: 사용자 인증)
router.put('/comments/:comment_id', authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { comment_id } = req.params;
  const { comment } = req.body;

  try {
    // 댓글 조회
    const existingComment = await Comments.findOne({ where: { comment_id } });
    if (!existingComment) {
      return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    }

    // 사용자 인증 및 권한 확인
    if (existingComment.User_id !== user_id) {
      return res
        .status(403)
        .json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    // 댓글 수정
    await Comments.update({ comment }, { where: { comment_id } });

    return res.status(200).json({ message: '댓글 수정에 성공하였습니다.' });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '댓글 수정에 실패하였습니다.' });
  }
});

// 댓글 삭제 API (authMiddleware: 사용자 인증)
router.delete('/comments/:comment_id', authMiddleware, async (req, res) => {
  const { user_id } = res.locals.user;
  const { comment_id } = req.params;

  try {
    // 댓글 조회
    const existingComment = await Comments.findOne({ where: { comment_id } });
    if (!existingComment) {
      return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    }

    // 사용자 인증 및 권한 확인
    if (existingComment.User_id !== user_id) {
      return res
        .status(403)
        .json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    // 댓글 삭제
    await Comments.destroy({ where: { comment_id } });

    return res.status(200).json({ message: '댓글 삭제에 성공하였습니다.' });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
  }
});

module.exports = router;
