const Joi = require("joi");

const validateRegistration = (data) => {
  const schema = Joi.object({
    userName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).pattern(/[A-Za-z]/).required(),
  });
  return schema.validate(data);
};

module.exports = { validateRegistration };
