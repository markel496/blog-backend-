import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Ссылается на отдельную модель User с помощью ObjectId. Создается связь между двумя таблицами
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    }
  },
  {
    timestamps: true //Дата создания и обновления сущности
  }
)

export default mongoose.model('Comment', CommentSchema)
