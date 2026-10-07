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

module.exports = { registerUser };
