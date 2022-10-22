import { validationResult } from 'express-validator'

export default (req, res, next) => {
  const errors = validationResult(req) //Получаем все ошибки валидации

  //Если есть ошибки - возвращаем все ошибки, которые удалось провалидировать
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array())
  }

  next()
}
