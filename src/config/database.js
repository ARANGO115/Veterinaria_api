const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      'Falta configurar MONGODB_URI en el archivo .env o en las variables de entorno.'
    );
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error(
      'MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://.'
    );
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });
};

module.exports = connectDB;