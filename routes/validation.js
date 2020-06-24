const Joi = require("@hapi/joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(4).required(),
    email: Joi.string().min(10).required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().min(6).required(),
    type: Joi.string().required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(10).required(),
    password: Joi.string().min(6).required(),
    type: Joi.string().required(),
  });
  return schema.validate(data);
};

const recoverValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(10).required(),
    type: Joi.string().required(),
  });
  return schema.validate(data);
};

const resetValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().min(6).required(),
    // type: Joi.string().required()
  });
  return schema.validate(data);
};

const addressValidation = (data) => {
  const schema = Joi.object({
    phone: Joi.string()
    .regex(/^\d{10}$/, ' ')
    .required(),
    address: Joi.string().required(),
    landmark: Joi.string().required(),
  });
  return schema.validate(data);
};
const restaurantDetailsValidation = (data) => {
  const schema = Joi.object({
    // profileImage: Joi.any(),
    restaurantName: Joi.string().required(),
    restaurantDescription: Joi.string().required(),
    phone: Joi.string()
      .regex(/^\d{10}$/, ' ')
      .required(),
    address: Joi.string().required(),
    landmark: Joi.string().required(),
    openFrom: Joi.string().required(),
    openTill: Joi.string().required(),
    openTomorrow: Joi.boolean().required(),
  });
  return schema.validate(data);
};
const restaurantItemsValidation = (data) => {
  const schema = Joi.object({
    // itemImage: Joi.any(),
    itemName: Joi.string().required(),
    itemDescription: Joi.string().required(),
    itemPrice: Joi.number().required(),
    Veg: Joi.boolean().required(), //.strict().validate('true')
  });
  return schema.validate(data);
};
const cartItemValidation = (data) => {
  const schema = Joi.object({
    count: Joi.number().required(),
  });
  return schema.validate(data);
};
const locationValidation = (data) => {

  const schema = Joi.object({
    lat : Joi.number().required(),
    lon : Joi.number().required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.recoverValidation = recoverValidation;
module.exports.resetValidation = resetValidation;
module.exports.addressValidation = addressValidation;
module.exports.restaurantDetailsValidation = restaurantDetailsValidation;
module.exports.restaurantItemsValidation = restaurantItemsValidation;
module.exports.cartItemValidation = cartItemValidation;
module.exports.locationValidation = locationValidation;
