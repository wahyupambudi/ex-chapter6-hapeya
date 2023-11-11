const jwt = require("jsonwebtoken");
const qr = require("node-qr-image");
const imagekit = require("../lib/imagekit");
const { ComparePassword, HashPassword } = require("../helper/passwd.helper");
const { ResponseTemplate } = require("../helper/template.helper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();

async function Register(req, res, next) {
  const { name, email, password, address, profilePicture } = req.body;

  const hashPass = await HashPassword(password);

  try {
    const checkUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (checkUser) {
      let respons = ResponseTemplate(null, "email already used", null, 400);
      res.status(400).json(respons);
      return;
    }

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashPass,
        address,
        profilePicture,
      },
    });

    let respons = ResponseTemplate(null, "created success", null, 200);
    res.status(200).json(respons);
    return;
  } catch (error) {
    next(error);
  }
}

async function Login(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      let respons = ResponseTemplate(
        null,
        "bad request",
        "invalid email or password",
        400,
      );
      res.status(400).json(respons);
      return;
    }

    let checkPassword = await ComparePassword(password, user.password);

    if (!checkPassword) {
      let respons = ResponseTemplate(
        null,
        "bad request",
        "invalid email or password",
        400,
      );
      res.status(400).json(respons);
      return;
    }

    let token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.SECRET_KEY,
    );
    // console.log(user)

    let respons = ResponseTemplate({ token }, "success", null, 200);
    res.status(200).json(respons);
    return;
  } catch (error) {
    next(error);
  }
}

function MediaProcessingImage(req, res) {
  const imageUrl = `${req.protocol}://${req.get("host")}/images/${
    req.file.filename
  }`;

  res.status(200).json({
    data: imageUrl,
    message: "success",
    status: 200,
    error: null,
  });
  return;
}

function whoami(req, res) {
  let respons = ResponseTemplate({ user: req.user }, "success", null, 200);
  res.status(200).json(respons);
  return;
}

module.exports = {
  Register,
  Login,
  whoami,
};
