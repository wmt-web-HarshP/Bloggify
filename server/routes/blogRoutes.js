require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const blogRouter = express.Router();
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

blogRouter.get("/", async (req, res) => {
  try {
    const getAllBlog = await prisma.blog.findMany();
    res.status(200).send(getAllBlog);
  } catch (error) {
    res.status(500).send(error);
  }
});

blogRouter.get("/ownBlog", async (req, res) => {
  const token = req.headers.authorization;
  const decodeToken = jwt.verify(token, process.env.SECRET_KEY);
  console.log(decodeToken);
  if (!token) {
    return res.status(401).send({ msg: "Login required" });
  }
  const ownBlog = await prisma.blog.findMany({
    where: {
      authorId: decodeToken?.id,
    },
  });
  console.log(ownBlog);
  res.status(200).send(ownBlog);
});

blogRouter.post("/createBlog", async (req, res) => {
  try {
    const { title, content, published } = req.body;
    const token = req.headers.authorization;
    console.log(token);
    const decodeToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decodeToken);
    // const existingUser = await prisma.user.findUnique({
    //   where: { email: decodeToken.email },
    // });
    const newBlog = await prisma.blog.create({
      data: { title, content, published, authorId: decodeToken.id },
    });
    console.log(newBlog);
    res.status(200).send(newBlog);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = blogRouter;
