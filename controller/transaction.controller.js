const qr = require("node-qr-image");
const path = require("path");
const { ResponseTemplate } = require("../helper/template.helper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const imagekit = require("../lib/imagekit");
require("dotenv").config();


async function Insert(req, res) {
  const { amount, paymentLink, isPaid } = req.body;
  const userId = req.params.id;

  const outputFolder = path.join(__dirname, "../media/qr");
  const jsonData = JSON.stringify({ amount, userId });

  // untuk buffer
  const qr_buffer_png = qr.imageSync(jsonData, { type: "svg" });

  // untuk png
  const qr_png = qr.image(jsonData, { type: "png" });

  const nameFile = `userId-${userId}-trx-` + Date.now();
  // console.log(nameFile);

  const payload = {
    userId: Number(userId),
    amount: parseInt(amount),
    paymentLink: qr_buffer_png,
    isPaid,
  };

  //   const fileString = req.file.buffer.toString("base64");

  // const uploadFile = await imagekit.upload({
  //   fileName: req.file.originalname,
  //   file: fileString,
  // });

  try {
    const accounts = await prisma.transaction.create({
      data: payload,
    });

    qr_png.pipe(
      require("fs").createWriteStream(
        path.join(outputFolder, `${nameFile.toLowerCase()}.png`),
      ),
    );

    let resp = ResponseTemplate(accounts, "success", null, 200);
    res.json(resp);
    return;
  } catch (error) {
    console.log(error);
    let resp = ResponseTemplate(null, "internal server error", error, 500);
    res.json(resp);
    return;
  }
}

async function GetByPK(req, res) {
  const { userId } = req.params;
  try {
    const users = await prisma.users.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        name: true,
        email: true,
        transaction: true,
      },
    });

    // console.log(users)

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

async function Update(req, res) {
  const { amount, paymentLink } = req.body;
  const { idTrx } = Number(req.query);

  const payload = {};

  if (!idTrx && !amount && !paymentLink) {
    let resp = ResponseTemplate(null, "bad request", null, 400);
    res.json(resp);
    return;
  }

  if (idTrx) {
    payload.idTrx = idTrx;
  }

  if (amount) {
    payload.amount = amount;
  }

  if (paymentLink) {
    payload.paymentLink = paymentLink;
  }


  try {
    const trx = await prisma.transaction.update({
      where: {
        id: Number(idTrx),
      },
      data: payload,
    });

    let resp = ResponseTemplate(trx, "success", null, 200);
    res.json(resp);
    return;
  } catch (error) {
    console.log(error);
    let resp = ResponseTemplate(null, "internal server error", error, 500);
    res.json(resp);
    return;
  }
}

async function Delete(req, res) {
  const { idTrx } = req.query;

  const trx = await prisma.transaction.findUnique({
    where: {
      id: Number(idTrx),
    },
  });

  if(trx === null) {
    let resp = ResponseTemplate(null, "Transactions is Not Found", null, 404);
    res.json(resp);
    return;
  }

  try {
    const trx = await prisma.transaction.delete({
      where: {
        id: Number(idTrx),
      },
    });
    let resp = ResponseTemplate(trx, "success", null, 200);
    res.json(resp);
    return;
  } catch (error) {
    // console.log(error);
    let resp = ResponseTemplate(null, "internal server error", error, 500);
    res.json(resp);
    return;
  }
}

module.exports = { Insert, GetByPK, Update, Delete };
