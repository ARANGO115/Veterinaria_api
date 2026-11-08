const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Veterinaria API funcionando correctamente'
  });
};

module.exports = { getHealth };
