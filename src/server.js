require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
};

startServer();