const joi = require('joi');

const validateReg = (data) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const studentSchema = joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().email().required(),
        username: joi.string().alphanum().required(),
        password: joi.string().pattern(passwordPattern).required(),
        role: joi.string().valid('user', 'admin').default('user'),
    });

    const { error, value } = studentSchema.validate(data);

    return { error, value };
}

module.exports = {
    validateReg
}