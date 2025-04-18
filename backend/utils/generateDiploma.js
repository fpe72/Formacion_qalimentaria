const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const moment = require("moment");


async function generateDiplomaPDF({ name, dni, company, date, serial, verificationURL, logoSrc, firmaSrc, qrSrc }) {
  try {
    // Formatear la fecha al formato español: DD/MM/YYYY
    const formattedDate = moment(date).format("DD/MM/YYYY");

    // 1. Renderizar el HTML con EJS
    const templatePath = path.join(__dirname, "../templates/diploma_dp.html");
    const html = await ejs.renderFile(templatePath, {
      name,
      dni,
      company,
      date: formattedDate,
      serial,
      verificationURL,
      logoSrc,
      firmaSrc,
      qrSrc
    });

    const fs = require("fs");
      console.log("🧪 HTML renderizado guardado como debug_diploma.html");
      
    // 2. Generar el PDF en memoria con Puppeteer
      const browser = await puppeteer.launch({
        headless: "new", // o true
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: "load", timeout: 0 });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });


    // 3. Devolver el buffer del PDF
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return null;
  }
}

module.exports = generateDiplomaPDF;
