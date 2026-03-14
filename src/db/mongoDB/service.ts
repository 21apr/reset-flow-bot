import User from "./models/User.model";
import { ITelegramUser, IUser } from "./interfaces/User.interface";

export async function findOrCreateUser(
  telegramId: string,
  userData: ITelegramUser
): Promise<{ user: IUser; isNewUser: boolean }> {
  const query = { telegramId: telegramId };

  const userLanguageCode = userData.language_code || "en";

  const update = {
    $set: {
      username: userData.username || null,
      firstName: userData.first_name || null,
    },
    $setOnInsert: {
      registrationDate: new Date(),
      language: userLanguageCode,
    },
  };

  const updateResult = await User.updateOne(query, update, { upsert: true });

  const isNewUser = !!updateResult.upsertedId;

  const user = await User.findOne(query);

  if (!user) {
    throw new Error("User not found after upsert.");
  }

  return {
    user: user as IUser,
    isNewUser: isNewUser,
  };
}

export async function addBreathingTime(
  telegramId: string,
  secondsToAdd: number
): Promise<void> {
  await User.findOneAndUpdate(
    { telegramId: telegramId },
    { $inc: { totalBreathingSeconds: secondsToAdd } },
    { new: true }
  ).exec();
}

export async function getUserTotalBreathingTime(
  telegramId: string
): Promise<number> {
  const user = await User.findOne(
    { telegramId: telegramId },
    "totalBreathingSeconds"
  ).exec();
  return user ? user.totalBreathingSeconds : 0;
}
