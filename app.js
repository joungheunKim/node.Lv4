const express = require('express');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users.route');
const likesRouter = require("./routes/likes.route");
const postsRouter = require('./routes/posts.route');
const commentsRouter = require('./routes/comments.route');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(express.static('assets'));

app.use('/api', [usersRouter, likesRouter, postsRouter, commentsRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});


