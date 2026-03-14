import { sendCycleMenu } from "../../../utils/conversationTemplates";
import { MyContext } from "../types/types";
import i18next from "../../../../shared/i18n/i18n";

export async function startHandler(ctx: MyContext, isNewUser: boolean) {
  const t = i18next.t.bind(i18next);
  const userName = ctx.from?.first_name || t("placeholder.friend");

  const translationKey = isNewUser
    ? "message.greeting.welcome_new"
    : "message.greeting.welcome_back";

  const greeting = t(translationKey, { userName: userName });

  await sendCycleMenu(ctx, greeting);
}
