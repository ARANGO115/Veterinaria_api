const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async ({ name, email, password }) => {
  const user = new User({ name, email, password });
  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }

  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

module.exports = { registerUser, loginUser };
