import i18next from "../../shared/i18n/i18n";
import { Telegraf } from "telegraf";
import { MyContext } from "../features/general/types/types";

export async function setBotCommands(bot: Telegraf<MyContext>) {
  // Список поддерживаемых языков
  const languages = ["en", "ru", "he"];

  for (const lng of languages) {
    i18next.changeLanguage(lng);

    const commands = [
      { command: "start", description: i18next.t("commands.start_desc") },
      // { command: "help", description: i18next.t("commands.help_desc") },
      // { command: "settings", description: i18next.t("commands.settings_desc") },
      { command: "feedback", description: i18next.t("commands.feedback_desc") },
    ];

    await bot.telegram.setMyCommands(commands, { language_code: lng });
  }

  console.log("✅ Bot commands set for all languages");
}
