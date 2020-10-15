const Articles = require('../models/article');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const DeleteArticleError = require('../errors/DeleteArticleError');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;

  Articles.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .catch((err) => {
      throw new BadRequestError({ message: `Запрос некорректен: ${err.message}` });
    })
    .then((article) => {
      res.send({
        data: {
          _id: article._id,
          keyword: article.keyword,
          title: article.title,
          text: article.text,
          date: article.date,
          source: article.source,
          link: article.link,
          image: article.image,
        },
      });
    })
    .catch(next);
};

module.exports.getAllArticles = (req, res, next) => {
  Articles.find({})
    .populate('user')
    .then((article) => res.send({ data: article }))
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Articles.findById(req.params._id)
    .orFail()
    .catch(() => {
      throw new NotFoundError({ message: `Kарточка с идентификатором ${req.params.id} не найдена` });
    })
    .then((card) => {
      if (card.owner && card.owner.toString() !== req.user._id) {
        throw new DeleteArticleError({ message: 'Запрос некорректен: недостаточно прав' });
      }
      Articles.findByIdAndDelete(req.params._id)
        .then((article) => {
          res.send({ data: article });
        })
        .catch(next);
    })
    .catch(next);
};