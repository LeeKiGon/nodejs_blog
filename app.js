const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Goods = require("./models/goods");
const Post = require("./schemas/post");
const Comment = require("./schemas/comment");
const ejs = require("ejs"); //ejs 템플릿 사용!!
const authMiddleware = require("./middlewares/auth-middleware");
const Joi = require('joi');

const postRouter = require("./routes/post");

mongoose.connect("mongodb://localhost/gon", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();
app.use(express.urlencoded());
app.use(express.json());
app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));
app.use("/api", postRouter);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs")

const UserSchema = Joi.object({
  nickname: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required(),
});

router.post("/users", async (req, res) => {
  
  try{
    console.log("Asdfadf")    
    const { nickname, email, password, confirmPassword } = 
    await UserSchema.validateAsync(req.body)

    if (password !== confirmPassword) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
      });
      return;
    }
    // if(nickname.length < 3){
    //   res.status(400).send({
    //     errorMessage: "닉네임을 3자 이상 적어주세요!!",
    //   });
    //   return;
    // }

    const existUsers = await User.find({
      $or: [{ nickname }, { email }],
    });
    if (existUsers.length) {
      res.status(400).send({
        errorMessage: "이미 가입된 이메일 또는 닉네임이 있습니다.",
      });
      return;
    }
    if(nickname === password){
      res.status(400).send({
        errorMessage: "닉네임과 패스워드가 같습니다!!"
      });
      return;
    }
    const user = new User({ email, nickname, password });
    await user.save();
    res.status(201).send({});
  } catch (err) {
    res.status(400).send({
      errorMessage: (
        "@@@@@@@양식에 맞춰 다시 확인 부탁드립니다!!@@@@@@닉네임 = 세글자 이상, 비밀번호 = 네글자이상 및 닉네임과 다르게")
    })
  }
});

router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password }).exec();

  if (!user) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드가 잘못됐습니다.",
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, "my-secret-key");
  res.send({
    token,
  });
});

router.get("/users/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    user,
  });
});

//게시글 메인페이지
app.get("/posts", async (req, res) => {
  res.render("posts");
});

//게시글 상세페이지
app.get("/post/:id", async (req, res) => {
  const { id } = req.params; // 요청 url 정보
  const [user] = await User.find({}).exec(); //user 정보를 db에서 받아옴
  const [writedData] = await Post.find({ _id: id }); //[]해줘야 obj 받아옴
  const [commentlist] = await Comment.find({id : id})
  res.render("post", { list: writedData, list2: user, list3:commentlist }); //list은 게시글정보, list2는 유저정보
});


//게시글 작성페이지
app.get("/news", function (req, res) {
  res.render("news");
});

//게시글 삭제
app.delete("/delete", async (req, res) => {
  const { Id, password } = req.body; //클라이언트에게 전달받은 id,pasword
  const [pwData] = await Post.find({ _id: Id }); //db에서 id로 찾아 내용을 변수에 저장 ([]해줘야 obj 받아옴)

  if (pwData['pw'] === password) {  //db의 pw와 클라이언트에서 입력받은 pasword 비교
    await Post.deleteOne({ _id: Id }); //일치하면 해당id값을 가진 db데이터 삭제
    res.json({ success: '삭제 성공!' });
  } else {
    res.status(400).json({ success: false, msg: '비밀번호가 다릅니다!' });
  };
});

//게시글 수정!!
app.post("/save/:id", async (req, res) => {
  const { Id, password, memo } = req.body; //클라이언트에게 전달받은 id,password,memo
  const [saveData] = await Post.find({ _id: Id }); //db에서 id로 찾아 내용을 변수에 저장 ([]해줘야 obj 받아옴)
  if (saveData['pw'] === password) { //db와 클라이언트에서 입력받은 password 비교
    await Post.findByIdAndUpdate(req.params.id, { memo: req.body.memo }); //db의 id값을 찾아 클라이언트에 입력받은값을 db에 저장
    res.json({ success: '수정 완료!' })
  } else {
    res.json({ success: "비밀번호가 틀립니다!!" })
  }
});

// //댓글 수정
// app.post("/comment_save/:id", async (req, res) =>{
//   const {id, comment} = req.body;
//   const [comsave] = await Comment.find({_id : id });
//   const comid = await new mongoose.Types.ObjectId(id)
//   if (comsave['_id'].equals(comid)) {
//     console.log("Asdfafd")
//   await Comment.findByIdAndUpdate({ _id : comid});
//   res.json({ success : "수정 성공!"})
//   };
// });

//댓글 작성
// app.post("/comment/:id",  async (req, res) => {
//   const { user } = res.locals;
//   const { comment } = req.body;
//   const { id } = req.params;
//   // const { commentid} = user['nickname'];
//   await Comment.create({ comment, id});
//   res.json({ success: '저장 완료!' })
// });

//댓글 삭제
app.delete("/review_delete", async (req,res) =>{
  const {id} = req.body;
  const [comment] = await Comment.find({_id : id });
  const comid = await new mongoose.Types.ObjectId(id)

  if (comment['_id'].equals(comid)) {
  await Comment.deleteOne({ _id : comid});
  res.json({ success : "삭제 성공!"})
  };
});

//댓글 보여주기
// router.get("/review/:id",  async (req, res) => {
//   const { id } = req.params; // 요청 url 정보
//   const comment = await Comment.find({ id : id});
//   res.json({ //응담(json)형식 post 실행(바로 윗줄 Post.find 에 대한 응답값 실행)
//     comment
//   });
// });

app.listen(3000, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});