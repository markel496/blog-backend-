//Структура таблицы списка пользователей

import mongoose from 'mongoose'

//Все свойства, которые мб у пользователя
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, //почта должна быть уникальной
    },
    //Информация о пароле дб зашифрована
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String, //Необязательное свойство
  },
  {
    timestamps: true, //Дата создания и обновления сущности
  }
)

export default mongoose.model('User', UserSchema)
