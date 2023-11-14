const qr = require("node-qr-image");
const path = require("path");
const { ResponseTemplate } = require("../helper/template.helper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();

async function Insert(req, res) {
  const { amount, paymentLink, isPaid } = req.body;
  const userId=0;

  const outputFolder = path.join(__dirname, "../media/qr");
  const jsonData = JSON.stringify({ amount, userId });

  // untuk buffer
  const qr_buffer_png = qr.imageSync(jsonData, { type: "svg" });

  // untuk png
  const qr_png = qr.image(jsonData, { type: "png" });

  const nameFile = `userId-${userId}-trx-` + Date.now();
  // console.log(nameFile);

  const payload = {
    userId: Number(req.params.id),
    amount: parseInt(amount),
    paymentLink: qr_buffer_png,
    isPaid,
  };

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

module.exports = { Insert, GetByPK };
