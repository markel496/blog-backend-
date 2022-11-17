import CommentModel from '../models/Comment.js'
import PostModel from '../models/Post.js'

export const addComment = async (req, res) => {
  try {
    //Подготовка документа
    const doc = new CommentModel({
      text: req.body.text,
      autor: req.userId, //Когда идет проверка на авторизацию в req.userId передается id
      post: req.body.postId
    })

    //Когда документ подготовлен - создаем его
    const comment = await doc.save()

    PostModel.findOneAndUpdate(
      {
        _id: req.body.postId //Нахожу пост по id
      },
      {
        $inc: { commentsCount: 1 } //Увеличиваю число комментариев на 1
      },
      {
        returnDocument: 'after'
      }
    ).exec()

    res.json(comment)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось добавить комментарий'
    })
  }
}

export const getCommentsOnThePost = async (req, res) => {
  try {
    const { postId } = req.params
    const comments = await CommentModel.find({ post: postId }, { post: 0 })
      .sort({ createdAt: 'asc' })
      .populate('autor', { passwordHash: 0 })
      .exec()

    res.json(comments)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось получить комментарии'
    })
  }
}

export const remove = async (req, res) => {
  const commentId = req.params.id
  const postId = req.body.postId
  try {
    CommentModel.findOneAndDelete(
      {
        _id: commentId //находим по commentId
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: 'Не удалось удалить комментарий'
          })
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Комментарий не найден'
          })
        }
        PostModel.findOneAndUpdate(
          {
            _id: postId //Нахожу пост по id
          },
          {
            $inc: { commentsCount: -1 } //Уменьшаю число комментариев на 1
          },
          {
            returnDocument: 'after'
          }
        ).exec()
        res.json({
          success: true
        })
      }
    )
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Не удалось получить комментарий'
    })
  }
}

export const edit = async (req, res) => {
  try {
    const commentId = req.params.id
    await CommentModel.updateOne(
      {
        _id: commentId //находим по commentId
      },
      {
        //что хотим обновить
        text: req.body.text
      }
    )
    res.json({
      success: true
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось редактировать комментарий'
    })
  }
}

export const getLastComments = async (req, res) => {
  try {
    const comments = await CommentModel.find()
      .sort({ createdAt: 'desc' })
      .limit(10)
      .populate('autor', { passwordHash: 0 })
      .exec()

    res.json(comments)
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: 'Не удалось получить комментарии'
    })
  }
}

export const getCommentsByTag = async (req, res) => {
  const tagName = req.params.name
  CommentModel.find()
    .sort({ createdAt: 'desc' })
    .populate('autor', { passwordHash: 0 })
    .populate('post', {
      tags: 1
    })
    .limit(10)
    .then((comments) => {
      const result = comments.filter((comment) =>
        comment.post.tags.includes(tagName)
      )
      res.json(result)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json({
        message: 'Не удалось получить комментарии'
      })
    })
}
