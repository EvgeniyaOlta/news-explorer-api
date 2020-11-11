const Articles = require('../models/article');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

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
          owner: req.user._id,
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
  const currentOwner = req.user._id;
  Articles.findOne({ _id: req.params._id }).select('+owner')
    .orFail()
    .catch(() => {
      throw new BadRequestError({ message: 'Kарточка с таким идентификатором не найдена' });
    })
    .then((article) => {
      if (String(article.owner) !== currentOwner) throw new ForbiddenError({ message: 'Запрос некорректен: недостаточно прав' });
      return Articles.deleteOne(article);
    })
    .then(() => res.send({ message: 'Статья успешно удалена' }))
    .catch(next);
};
