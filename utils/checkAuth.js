// Функция - посредник (middleware). С помощью нее определяю можно или нельзя возвращать информацию

import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  //Получаю токен, который был передан при регистрации/авторизации. Убираю слово "Bearer"(Insomnia)
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

  if (token) {
    try {
      //Расшифровка токена по ключу
      const decoded = jwt.verify(token, 'hola420')

      req.userId = decoded._id
      next() // все ок, можно выполнять следующие функции
    } catch (e) {
      console.log(e)
      return res.status(403).json({
        message: 'Нет доступа',
      })
    }
  } else {
    return res.status(403).json({
      message: 'Нет доступа',
    })
  }
}
