import PostModel from '../models/Post.js'
import CommentModel from '../models/Comment.js'

export const getAll = async (req, res) => {
  try {
    // Получаю все статьи из бд. Благодаря .populate('user') в поле user находится не id, а полная инфа
    const posts = await PostModel.find()
      .sort({ createdAt: 'desc' })
      .populate('user', { passwordHash: 0 })
      .exec()

    res.json(posts)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось получить статьи'
    })
  }
}

export const getPopulate = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ viewsCount: 'desc' })
      .populate('user', { passwordHash: 0 })
      .exec()

    res.json(posts)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось получить статьи'
    })
  }
}

export const getOne = (req, res) => {
  try {
    const postId = req.params.id

    //Получаю статью и обновляю количество просмотров
    PostModel.findOneAndUpdate(
      {
        _id: postId //находим по postId
      },
      {
        $inc: { viewsCount: 1 } //Увеличиваю число просмотров на 1
      },
      {
        returnDocument: 'after' //После обновления возвращаю уже актуальный документ
      },
      //что делать дальше, когда получили и обновили статью
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: 'Не удалось вернуть статью'
          })
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена'
          })
        }
        res.json(doc)
      }
    ).populate('user', {
      passwordHash: 0
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Не удалось получить статью'
    })
  }
}

export const create = async (req, res) => {
  try {
    //Подготовка документа
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags
        .replace(/\s{2,}/g, ' ')
        .trim()
        .split(' '),
      imageUrl: req.body.imageUrl,
      user: req.userId //Когда идет проверка на авторизацию в req.userId передается id
    })

    //Когда документ подготовлен - создаем его
    const post = await doc.save()

    res.json(post)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось создать статью'
    })
  }
}

export const remove = (req, res) => {
  try {
    const postId = req.params.id

    PostModel.findOneAndDelete(
      {
        _id: postId //находим по postId
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: 'Не удалось удалить статью'
          })
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена'
          })
        }
        res.json({
          success: true
        })
      }
    )
    CommentModel.deleteMany({ post: postId }).exec()
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Не удалось получить статью'
    })
  }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id
    await PostModel.updateOne(
      {
        _id: postId //находим по postId
      },
      {
        //что хотим обновить
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags
          .replace(/\s{2,}/g, ' ')
          .trim()
          .split(' '),
        imageUrl: req.body.imageUrl
      }
    )

    res.json({
      success: true
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось обновить статью'
    })
  }
}

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find({ tags: { $ne: [''] } })
      .sort({ createdAt: 'desc' })
      .limit(5)
      .exec() // Получаю последние 5 статей

    const tags = posts
      .map((post) => post.tags[0] && post.tags[0])
      // .flat() //Объединяет массивы
      .slice(0, 5)

    res.json(tags)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось получить статьи'
    })
  }
}

export const getPostsByTag = async (req, res) => {
  try {
    const postsTag = req.params.name
    PostModel.find(
      {
        tags: { $all: [postsTag] }
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: 'Не удалось вернуть статьи'
          })
        }
        if (!doc.length) {
          return res.status(404).json({
            message: 'Статьи не найдены'
          })
        }
        res.json(doc)
      }
    ).populate('user', { passwordHash: 0 })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Не удалось получить статьи'
    })
  }
}
