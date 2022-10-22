import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    imageUrl: String,
    viewsCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Ссылается на отдельную модель User с помощью ObjectId. Создается связь между двумя таблицами
      required: true,
    },
  },
  {
    timestamps: true, //Дата создания и обновления сущности
  }
)

export default mongoose.model('Post', PostSchema)
