const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Falta configurar MONGODB_URI en el archivo de entorno.');
  }

  await mongoose.connect(mongoUri);
};

module.exports = connectDB;