import UserModel from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const login = async (req, res) => {
  try {
    //Ищем пользователя по email в бд
    const user = await UserModel.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      })
    }

    //Сравнениваю пароль, который пришел в запросе с паролем в бд
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    )

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Неверный логин или пароль',
      })
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'hola420', //ключ для шифрования
      {
        expiresIn: '30d', //срок жизни токена
      }
    )

    const { passwordHash, ...userData } = user._doc

    res.json({
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    })
  }
}

export const register = async (req, res) => {
  try {
    // Хороший способ шифрования пароля. Его используют многие компании
    const password = req.body.password //Вытаскиваю пароль из запроса
    const salt = await bcrypt.genSalt(10) //salt - Алгоритм шифрования пароля
    const hash = await bcrypt.hash(password, salt) //Зашифрованный пароль

    //Подготовка документа для создания пользователя
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    })
    //Сохраняем документ в бд(создается новый пользователь)
    const user = await doc.save()

    //Шифрую инфу(_id) и возвращаю токен. Благодаря этому токену могу получать нужную инфу и что-то с ней делать
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'hola420', //ключ для шифрования
      {
        expiresIn: '30d', //срок жизни токена
      }
    )

    const { passwordHash, ...userData } = user._doc //для того, чтобы не возвращать поле passwordHash в ответе

    res.json({
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Пользователь с такой почтой уже существует',
    })
  }
}

export const getMe = async (req, res) => {
  try {
    // Нахожу пользователя по id, который расшифровал в файле checkAuth
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      })
    }

    const { passwordHash, ...userData } = user._doc

    res.json(userData)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Нет доступа',
    })
  }
}
