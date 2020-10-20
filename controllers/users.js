const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const AuthorizationError = require('../errors/AuthorizationError');
const ConflictError = require('../errors/ConflictError');

module.exports.getUser = (req, res, next) => {
  const currentOwner = req.user._id;
  User.findById(currentOwner)
    .orFail()
    .catch(() => {
      throw new NotFoundError({ message: `Пользователь с идентификатором ${req.params.id} не найден` });
    })
    .then((user) => res.send({
      data: {
        email: user.email,
        name: user.name,
      },
    }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    }))
    .catch((err) => {
      if (err.name === 'MongoError') {
        throw new ConflictError({ message: 'Пользователь с таким email уже существует' });
      }
      throw new BadRequestError({ message: `Запрос некорректен: ${err.message}` });
    })
    .then((user) => {
      res.send({
        data: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .catch(() => {
      throw new AuthorizationError({ message: `Пользователь с идентификатором ${req.body.email} не найден` });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};
