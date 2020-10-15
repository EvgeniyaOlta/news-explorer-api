const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUser,
} = require('../controllers/users');

router.get('/me', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().required(),
  }),
}), getUser);

module.exports = router;
