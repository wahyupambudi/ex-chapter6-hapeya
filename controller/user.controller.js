const jwt = require("jsonwebtoken");
const { ComparePassword, HashPassword } = require("../helper/passwd.helper");
const { ResponseTemplate } = require("../helper/template.helper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const qr = require("node-qr-image");
const imagekit = require("../lib/imagekit");

require("dotenv").config();

// async function Get(req, res) {
//   const { id, name, email } = req.query;

//   const payload = {};

//   if (name) {
//     payload.name = name;
//   }

//   if (email) {
//     payload.email = email;
//   }

//   try {
//     const page = parseInt(req.query.page) || 1; // total halaman
//     const perPage = parseInt(req.query.perPage) || 10; // total item per halaman
//     const skip = (page - 1) * perPage;
//     const users = await prisma.users.findMany({
//       skip,
//       take: perPage,
//       where: payload,
//       select: {
//         id: true,
//         email: true,
//         name: true,
//       },
//     });

//     let resp = ResponseTemplate(users, "success to get user", null, 200);
//     res.json(resp);
//     return;
//   } catch (error) {
//     let resp = ResponseTemplate(null, "internal server error", error, 500);
//     res.json(resp);
//     return;
//   }
// }

async function Register(req, res, next) {
  const { name, email, password, address, profilePicture, memberId } = req.body;

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
        memberId,
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
      {
        id: user.id,
        name: user.name,
        email: user.email,
        memberId: user.memberId,
      },
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

async function PictureUpdate(req, res) {
  // const imageUrl = `${req.protocol}://${req.get("host")}/images/${
  //   req.file.filename
  // }`;

  const profilePicture = req.body;
  const { email } = req.params;
  const payload = {};

  if (!profilePicture) {
    let resp = ResponseTemplate(null, "bad request", null, 400);
    res.json(resp);
    return;
  }

  // image kit
  const fileString = req.file.buffer.toString("base64");

  const uploadFile = await imagekit.upload({
    fileName: req.file.originalname,
    file: fileString,
  });


  if (profilePicture) {
    payload.profilePicture = uploadFile.url;
  }

  try {
    const users = await prisma.users.update({
      where: {
        email: email,
      },
      data: payload,
    });

    let resp = ResponseTemplate(
      { data: uploadFile.url, profilePicture: users.profilePicture },
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
  // Get,
  PictureUpdate,
};
