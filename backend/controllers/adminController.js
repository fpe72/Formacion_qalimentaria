const User = require('../models/User');
const Progress = require('../models/Progress');
const Attempt = require('../models/Attempt');
const Diploma = require('../models/Diploma');
const Company = require('../models/Company');
const Module = require('../models/Module');
const Exam = require('../models/FinalExam');

const getAllUserProgress = async (req, res) => {
  try {
    const users = await User.find().lean();
    const allModules = await Module.find({}, '_id title').sort({ order: 1 }).lean();
    const totalModules = allModules.length;

    const data = await Promise.all(users.map(async (user) => {
      const progresses = await Progress.find({ userEmail: user.email }).lean();
      const completedModules = progresses.map(p => {
        const mod = allModules.find(m => m._id.toString() === p.module.toString());
        return mod ? { id: mod._id, title: mod.title } : null;
      }).filter(Boolean);

      const attempt = await Attempt.findOne({ userId: user._id, passed: true }).sort({ endTime: -1 }).lean();
      let totalQuestions = 0;

      if (attempt?.examId) {
        const exam = await Exam.findById(attempt.examId).lean();
        totalQuestions = exam?.questions?.length || 0;
      }

      const diploma = await Diploma.findOne({ userId: user._id }).lean();
      // Si tiene diploma emitido → forzamos que se muestre como aprobado
      if (diploma && attempt && !attempt.passed) {
        attempt.passed = true;
      }

      const company = user.company ? await Company.findById(user.company).lean() : null;

      const progressPercent = Math.round((completedModules.length / totalModules) * 100);

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,  
        company: company?.name || 'Sin empresa',
        modulesCompleted: {
          count: completedModules.length,
          total: totalModules,
          percentage: progressPercent,
          list: completedModules
        },
        exam: attempt ? {
          status: attempt.status,
          score: attempt.score,
          passed: attempt.passed,
          date: attempt.endTime || attempt.startTime || null,
          totalQuestions: totalQuestions
        } : null,
        diploma: diploma ? {
          issued: true,
          serial: diploma.serial,
          url: diploma.verificationURL
        } : {
          issued: false
        }
      };
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos del progreso' });
  }
};

// ──────────────────────────────────────────────
// FUNCIÓN NUEVA: Permite a un admin generar PDF
// GET /api/admin/diploma/:userId
// ──────────────────────────────────────────────
const QRCode = require('qrcode');
const generateDiplomaPDF = require('../utils/generateDiploma');

const downloadDiplomaByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const attempt = await Attempt.findOne({ userId, passed: true }).sort({ endTime: -1 });
    if (!attempt) {
      return res.status(400).json({ message: 'El usuario no ha aprobado ningún examen' });
    }

    let diploma = await Diploma.findOne({ userId });
    if (!diploma) {
      const serial = `QA-${user.dni}-${Date.now()}`;
      const verificationURL = `https://formacion.qalimentaria.es/verificar/${serial}`;
      diploma = await Diploma.create({
        userId,
        examId: attempt.examId,
        name: `${user.name} ${user.firstSurname || ''} ${user.secondSurname || ''}`.trim(),
        dni: user.dni,
        company: user.companyName || 'Sin empresa',
        date: new Date().toISOString().split('T')[0],
        serial,
        verificationURL
      });
    }

    const qrBase64 = await QRCode.toDataURL(diploma.verificationURL);
    const pdfBuffer = await generateDiplomaPDF({
      name: diploma.name,
      dni: diploma.dni,
      company: diploma.company,
      date: diploma.date,
      serial: diploma.serial,
      verificationURL: diploma.verificationURL,
      logoSrc: 'logo.png',
      firmaSrc: 'firma-eva.png',
      qrSrc: qrBase64
    });

    if (!pdfBuffer) return res.status(500).json({ message: 'Error generando el diploma' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="diploma-${user.dni}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno generando el diploma' });
  }
};


module.exports = { getAllUserProgress, downloadDiplomaByUser };

