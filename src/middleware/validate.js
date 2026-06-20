import ApiError from '../utils/ApiError.js';

/**
 * Joi validation middleware factory.
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'query'|'params'} property
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => d.message);
    return next(ApiError.badRequest('Validation failed', details));
  }

  req[property] = value;
  return next();
};

export default validate;
