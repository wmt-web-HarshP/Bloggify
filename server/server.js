require("dotenv/config");
const express = require("express");
const PORT = process.env.PORT;
const app = express();
const cors = require('cors')
const userRouter = require("./routes/userRoutes");
const blogRouter = require("./routes/blogRoutes");

app.use(cors())
app.use(express.json());
app.get("/", (req, res) => {
  console.log("Welcome to Blogging Plateform");
  res.status(200).send("Welcome to Blogging Plateform");
});
app.use("/user", userRouter);
app.use("/blog", blogRouter);

app.listen(PORT, () => console.log(`Server is runnning on ${PORT}`));
