const qr = require("node-qr-image");
const path = require("path");
const { ResponseTemplate } = require("../helper/template.helper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();

async function Insert(req, res) {
  const { userId, amount, paymentLink, isPaid } = req.body;

  const outputFolder = path.join(__dirname, "../media/qr");
  const jsonData = JSON.stringify({ amount, userId });

  // untuk buffer
  const qr_buffer_png = qr.imageSync(jsonData, { type: "svg" });

  // untuk png
  const qr_png = qr.image(jsonData, { type: "png" });

  const nameFile = `userId-${userId}-trx-` + Date.now();
  // console.log(nameFile);

  const payload = {
    userId: parseInt(userId),
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

module.exports = { Insert };
