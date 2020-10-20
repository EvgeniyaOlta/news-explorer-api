const express = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  getAllArticles,
  createArticle,
  deleteArticle,
} = require('../controllers/articles');

const articlesRouter = express.Router();

articlesRouter.get('/', getAllArticles);

articlesRouter.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().pattern(/^((http|https):\/\/)(www\.)?([a-zA-z0-9.-]+)\.([a-zA-z]+)([a-zA-z0-9%$?/.-]+)?(#)?$/),
    image: Joi.string().required().pattern(/^((http|https):\/\/)(www\.)?([a-zA-z0-9.-]+)\.([a-zA-z]+)([a-zA-z0-9%$?/.-]+)?(#)?$/),
  }),
}), createArticle);

articlesRouter.delete('/:_id', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().alphanum().length(24).hex(),
  }),
}), deleteArticle);

module.exports = articlesRouter;
