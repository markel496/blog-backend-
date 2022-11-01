import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import cors from 'cors'
import fs from 'fs'
import {
  registerValidation,
  loginValidation,
  postCreateValidation
} from './validations.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'
import { UserController, PostController } from './controllers/index.js'

// 'mongodb+srv://jonysmoker:c6RjiVuNh6BCu950@cluster0.8r0zj1n.mongodb.net/blog?retryWrites=true&w=majority'
//blog вписал я. Это говорит о том, что нужно подключиться не к самому серверу, а к нужной бд

mongoose
  .connect(
    'mongodb+srv://jonysmoker:c6RjiVuNh6BCu950@cluster0.8r0zj1n.mongodb.net/blog?retryWrites=true&w=majority'
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err))

const PORT = 4200

const app = express() //Создал express приложение. Вся логика express хранится в app

//Создаю хранилище для картинок
const storage = multer.diskStorage({
  // сохраняю загруженные файлы в папку uploads
  destination: (_, __, cb) => {
    //Если fs не нашел папку uploads - он ее создаст
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }
    cb(null, 'uploads')
  },
  // определяю имя файла перед сохранением
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  }
})

//Создаю хранилище / функцию, которая будет позволять использовать multer
const upload = multer({ storage })

app.use(express.json()) //Позволит читать JSON, который будет приходить от клиента в запросе

app.use(cors()) //Убирает cors блокировку - это позволит делать запросы с любых доменов

app.use('/uploads', express.static('uploads')) //Позволит обработать get-запрос на получение статичного файла

//Загрузка картинки на сервер. В случае успешной загрузки, в ответе - ссылка на загруженную картинку
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

// Авторизация
app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
)

// Регистрация
app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
)

//Получение инфы о пользователе
app.get('/auth/me', checkAuth, UserController.getMe)

//Получение всех статей
app.get('/posts', PostController.getAll) //сортировка по дате
app.get('/populate', PostController.getPopulate) //сортировка по просмотрам

// Получение одной статьи
app.get('/posts/:id', PostController.getOne)

//Создание статьи
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
)

//Обновление статьи
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
)

//Удаление статьи
app.delete('/posts/:id', checkAuth, PostController.remove)

//Получение последних 5 тегов
app.get('/tags', PostController.getLastTags)

//Получение постов по тегу
app.get('/posts/tags/:name', PostController.getPostsByTag)

app.listen(process.env.PORT || PORT, (err) => {
  if (err) {
    //Если сервер не смог запуститься - возвращаем сообщение об этом
    return console.log(err)
  }
  console.log('Server OK')
})

/** В переменной req хранится то, что прислал клиент, в res - что нужно передать клиенту
 *  4200 - порт, на который прикрепляем приложение
 */
