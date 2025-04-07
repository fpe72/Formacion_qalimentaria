const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

async function generateDiplomaPDF({ name, dni, company, date, serial, verificationURL, logoSrc, firmaSrc, qrSrc }) {
  try {
    // 1. Renderizar el HTML con EJS
    const templatePath = path.join(__dirname, "../templates/diploma_dp.html");
    const html = await ejs.renderFile(templatePath, {
      name,
      dni,
      company,
      date,
      serial,
      verificationURL,
      logoSrc,
      firmaSrc,
      qrSrc
    });

    const fs = require("fs");
      fs.writeFileSync("debug_diploma.html", html);
      console.log("🧪 HTML renderizado guardado como debug_diploma.html");


    // 2. Generar el PDF en memoria con Puppeteer
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load", timeout: 0 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true
    });
    
    await browser.close();

    fs.writeFileSync("debug_output.pdf", pdfBuffer);
    console.log("📥 PDF guardado como debug_output.pdf");

    // 3. Devolver el buffer del PDF
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return null;
  }
}

module.exports = generateDiplomaPDF;
