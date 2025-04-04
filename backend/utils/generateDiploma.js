const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

async function generateDiplomaPDF({ name, dni, company, date, serial, verificationURL, logoSrc, firmaSrc, qrSrc }) {
  try {
    const templatePath = path.join(__dirname, "../templates/diploma_dp.html");
    const html = await ejs.renderFile(templatePath, {
      name, dni, company, date, serial, verificationURL, logoSrc, firmaSrc, qrSrc
    });

    // 🧪 Guardamos HTML para depuración
    const debugPath = path.join(__dirname, "../templates/debug_diploma.html");
    fs.writeFileSync(debugPath, html);
    console.log("✅ HTML generado guardado en:", debugPath);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfPath = path.join(__dirname, "../templates/output.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    console.log("✅ PDF guardado como output.pdf");
    return fs.readFileSync(pdfPath);
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return null;
  }
}

module.exports = generateDiplomaPDF;
