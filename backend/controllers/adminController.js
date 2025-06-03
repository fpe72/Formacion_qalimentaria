const User = require('../models/User');
const Progress = require('../models/Progress');
const Attempt = require('../models/Attempt');
const Diploma = require('../models/Diploma');
const Company = require('../models/Company');
const Module = require('../models/Module');

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

      const attempt = await Attempt.findOne({ userId: user._id }).lean();
      const diploma = await Diploma.findOne({ userId: user._id }).lean();
      // Si tiene diploma emitido → forzamos que se muestre como aprobado
      if (diploma && attempt && !attempt.passed) {
        attempt.passed = true;
      }

      const company = user.company ? await Company.findById(user.company).lean() : null;

      const progressPercent = Math.round((completedModules.length / totalModules) * 100);

      return {
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
          date: attempt.endTime || attempt.startTime || null
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

module.exports = { getAllUserProgress };

