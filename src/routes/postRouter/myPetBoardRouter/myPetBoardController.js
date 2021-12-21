const { Post, User } = require("../../../models");

// 근황 게시판 페이지
const getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page || 1); // url 쿼리에서 page 받기, 기본값 1
    const perPage = Number(req.query.perPage || 12); // url 쿼리에서 peRage 받기, 기본값 12

    const [total, posts] = await Promise.all([
      Post.countDocuments({}),
      Post.find({})
        .sort({ createdAt: -1 })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .populate("author"),
    ]);

    const totalPage = Math.ceil(total / perPage);

    res.render("myPetBoard.html", {
      isLogined: req.isLoggedIn,
      posts,
      page,
      perPage,
      totalPage,
    });
  } catch (error) {
    res.status(500).redirect("/");
  }
};

// 게시물(상세) 페이지
const getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ _id: id }).populate("author");

    if (!post) res.status(404).end();

    post.views += 1;
    post.save();

    res.render("myPetBoardDetail.html", {
      isLogined: req.isLoggedIn,
      data: post,
    });
  } catch (error) {
    res.status(500).redirect("/");
  }
};

const createPost = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    // 테스트를 위해 유저 데이터를 임시로 특정
    const user = await User.findOne({ nickname: "김동근1" });

    // 포스트 생성
    const post = await Post.create({
      title,
      content,
      author: user,
      category,
    });

    // 유저 posts에 포스트 추가
    user.posts.push(post);
    user.save();

    res.status(201).json(post);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;

  // 추후에 요청자와 post 작성자가 일치하는지 검증하는 로직 추가해야 함

  const post = await Post.deleteOne({ _id: id });

  if (!post) res.status(404).end();

  res.send(204);
};

const updatePost = async (req, res) => {
  const { id } = req.params;

  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    res.status(400).end();
  }

  // 추후에 요청자와 post 작성자가 일치하는지 검증하는 로직 추가해야 함

  const post = await Post.updateOne(
    { _id: id },
    {
      title,
      content,
      category,
    }
  );

  if (!post) res.status(404).end();

  res.json(post);
};

module.exports = {
  getPosts,
  getPostDetail,
};
