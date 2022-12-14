import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import cors from 'cors'
import fs from 'fs'
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  commentUpdateValidation
} from './validations.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'
import {
  UserController,
  PostController,
  CommentController
} from './controllers/index.js'

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://jonysmoker:c6RjiVuNh6BCu950@cluster0.8r0zj1n.mongodb.net/blog?retryWrites=true&w=majority'

const PORT = process.env.PORT || 4200

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err))

const app = express() //Создал express приложение. Вся логика express хранится в app

//Создаю хранилище для картинок
const storage = multer.diskStorage({
  // сохраняю загруженные файлы в папку uploads
  destination: (req, __, cb) => {
    //Если fs не нашел папку uploads - он ее создаст
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }

    if (req.url === '/upload/avatar') {
      if (!fs.existsSync('uploads/avatars')) {
        fs.mkdirSync('uploads/avatars')
      }
      cb(null, 'uploads/avatars')
    } else {
      cb(null, 'uploads')
    }
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

//Загрузка аватарки
app.post('/upload/avatar', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/avatars/${req.file.originalname}`
  })
})

//Удаление аватарки
app.delete('/uploads/avatars/:name', (req, res) => {
  try {
    fs.unlinkSync(`uploads/avatars/${req.params.name}`)
    return res.status(200).send('Successfully! Avatar has been deleted')
  } catch (err) {
    // handle the error
    return res.status(400).send(err)
  }
})

//Удаление картинки из папки uploads
app.delete('/uploads/:name', (req, res) => {
  try {
    fs.unlinkSync(`uploads/${req.params.name}`)
    return res.status(200).send('Successfully! Image has been deleted')
  } catch (err) {
    // handle the error
    return res.status(400).send(err)
  }
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

//Добавление комментария
app.post('/comments', checkAuth, CommentController.addComment)

//Получение последних 10 комментариев
app.get('/comments', CommentController.getLastComments)

//Получение комментариев к посту
app.get('/comments/:postId', CommentController.getCommentsOnThePost)

//получение комментариев по тегу
app.get('/comments/tag/:name', CommentController.getCommentsByTag)

//Удаление комментария
app.delete('/comments/:id', checkAuth, CommentController.remove)

//Редактирование комментария
app.patch(
  '/comments/:id',
  checkAuth,
  commentUpdateValidation,
  handleValidationErrors,
  CommentController.edit
)

app.listen(PORT, (err) => {
  if (err) {
    //Если сервер не смог запуститься - возвращаем сообщение об этом
    return console.log(err)
  }
  console.log('Server OK')
})
