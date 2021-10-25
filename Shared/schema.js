const Joi = require("joi");

const register = Joi.object({
    firstname: Joi.string().min(3).required(),
    lastname: Joi.string().required(),
    email: Joi.string().min(4).required().email(),
    password: Joi.string().min(5).required(),
    isActive: 0
})

const login = Joi.object({
    email: Joi.string().min(4).required().email(),
    password: Joi.string().min(5).required()
})

const forgotpassword = Joi.object({
    email: Joi.string().min(4).required().email(),
})
module.exports = {
    register,
    login,
    forgotpassword

}