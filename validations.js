import { body } from 'express-validator'

export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов').isLength({
    min: 5,
  }),
  body('fullName', 'Укажите имя').isLength({ min: 5 }),
  body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(), //Если придет информация(optional()), то будет проверка - является ссылкой или нет
]

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов').isLength({
    min: 5,
  }),
]

export const postCreateValidation = [
  body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(),
  body('text', 'Введите текст статьи').isLength({ min: 5 }).isString(),
  body('tags', 'Неверный формат тегов').optional().isString(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
]
