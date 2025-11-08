import i18next from "../../../../shared/i18n/i18n";
import { MyContext } from "../types/types";

// 💡 Адрес аккаунта для обратной связи
// Обычно константы хранят в конфиге, но для примера оставим здесь
const FEEDBACK_ACCOUNT_HANDLE = "LARINALAB";
const FEEDBACK_ACCOUNT_URL = `https://t.me/${FEEDBACK_ACCOUNT_HANDLE}`;

export async function feedbackHandler(ctx: MyContext) {
  const t = i18next.t.bind(i18next);

  // Передаем URL в качестве переменной 'accountUrl'
  const messageText = t("commands.feedback", {
    accountUrl: FEEDBACK_ACCOUNT_URL,
  });

  await ctx.reply(messageText, {
    parse_mode: "HTML",
    link_preview_options: {
      is_disabled: true,
    },
  });
}
