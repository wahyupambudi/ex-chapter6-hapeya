const jwt = require("jsonwebtoken");
const { ComparePassword, HashPassword } = require("../helper/passwd.helper");
const { ResponseTemplate } = require("../helper/template.helper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const qr = require("node-qr-image");
// const imagekit = require("../lib/imagekit");

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
      { name: user.name, email: user.email },
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

async function GetByPK(req, res) {
  const { email } = req.params;

  try {
    const users = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    let resp = ResponseTemplate(users, "success to get user by id", null, 200);
    res.json(resp);
    return;
  } catch (error) {
    console.log(error);
    let resp = ResponseTemplate(null, "internal server error", error, 500);
    res.json(resp);
    return;
  }
}

async function PictureUpdate(req, res) {
  const imageUrl = `${req.protocol}://${req.get("host")}/images/${
    req.file.filename
  }`;

  const profilePicture = req.body;
  const { email } = req.params;
  const payload = {};

  if (!profilePicture) {
    let resp = ResponseTemplate(null, "bad request", null, 400);
    res.json(resp);
    return;
  }

  if (profilePicture) {
    payload.profilePicture = imageUrl;
  }

  try {
    const users = await prisma.users.update({
      where: {
        email: email,
      },
      data: payload
    });

    let resp = ResponseTemplate(
      { data: imageUrl, profilePicture: users.profilePicture },
      "Profile Picure has Updated",
      null,
      200,
    );
    res.json(resp);
    return;
  } catch (error) {
    console.log(error);
    let resp = ResponseTemplate(null, "internal server error", error, 500);
    res.json(resp);
    return;
  }
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
  GetByPK,
  PictureUpdate,
};
