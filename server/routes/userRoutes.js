require('dotenv/config')
const express = require("express");
const userRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
const validRoles = ["AUTHOR", "READER", "ADMIN"];
const jwt = require("jsonwebtoken");

userRouter.get("/", async (req, res) => {
    try {
        const allUser = await prisma.user.findMany({ include: { blog: true } });
        console.log(allUser);
        res.status(200).send(allUser);
    } catch (error) {
        res.status(500).send(error);
    }
});

userRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!validRoles.includes(role)) {
            return res.status(400).json({ msg: "Invalid role" });
        }
        console.log(role);
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Missing or invalid fields" });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already in use" });
        }
        const encryptPassword = await bcrypt.hash(password, salt);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: encryptPassword,
                role,
            },
        });
        console.log(newUser);
        res.status(200).send(newUser);
    } catch (error) {
        res.status(500).send(error)
    }

});

userRouter.get('/details', async (req, res) => {
    try {
        const token = req.headers.authorization
        const user = jwt.verify(token, process.env.SECRET_KEY)
        if (!token || !user) {
            throw new Error('Authentication failed')
        }
        const userDetails = await prisma.user.findFirst({
            where: {
                email: user.email
            }
        })
        res.status(200).send(userDetails);
    } catch (error) {
        res.status(500).send(error)
    }

})

userRouter.post("/login", async (req, res) => {
    const user = await prisma.user.findFirst({
        where: { email: req.body.email },
    });
    console.log(user);
    if (!user || user == "null") {
        return res.status(400).send("The user was not found");
    }
    const secret = process.env.SECRET_KEY
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = jwt.sign({ email: user.email, id: user.id }, secret);
        res.status(200).send({ email: user.email, token });
    } else {
        res.status(400).send("Password is incorrect");
    }
});

module.exports = userRouter;
