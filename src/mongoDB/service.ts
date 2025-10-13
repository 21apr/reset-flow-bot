import User from "./models/User.model";
import { ITelegramUser, IUser } from "./interfaces/User.interface";

/**
 * Ищет пользователя по ID Telegram. Если не находит, создает нового.
 * Использует updateOne для надежной проверки upsert.
 */
export async function findOrCreateUser(
  telegramId: string,
  userData: ITelegramUser
): Promise<{ user: IUser; isNewUser: boolean }> {
  const query = { telegramId: telegramId };

  const update = {
    $set: {
      // Используем $set для обновления полей
      username: userData.username || null,
      firstName: userData.first_name || null,
    },
    $setOnInsert: {
      // Устанавливаем ТОЛЬКО при вставке
      registrationDate: new Date(),
    },
  };

  // 1. Выполняем updateOne с upsert: true
  const updateResult = await User.updateOne(query, update, { upsert: true });

  // 2. Проверяем флаг вставки
  // Если upsertedId существует, значит, была ВСТАВКА.
  const isNewUser = !!updateResult.upsertedId;

  // Вывод логов для проверки
  //   console.log("MongoDB Update Result (upsertedId):", updateResult.upsertedId);
  //   console.log(`User ID: ${telegramId}, isNewUser: ${isNewUser}`);

  // 3. Получаем полный документ пользователя
  // Поскольку upsert уже гарантировал, что пользователь существует, просто находим его.
  const user = await User.findOne(query);

  if (!user) {
    // Это должно произойти только при фатальной ошибке БД
    throw new Error("Не удалось найти пользователя после upsert.");
  }

  // 4. Возвращаем результат
  return {
    user: user as IUser,
    isNewUser: isNewUser,
  };
}
