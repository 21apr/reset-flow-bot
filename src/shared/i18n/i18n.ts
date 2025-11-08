import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "node:path";

export async function initI18n() {
  await i18next.use(Backend).init({
    initImmediate: false,
    backend: {
      loadPath: path.resolve(
        "./src/shared/i18n/locales/{{lng}}/translation.json"
      ),
    },
    fallbackLng: "en",
    preload: ["en", "ru"],
    interpolation: {
      escapeValue: false,
    },
  });

  console.log("✅ i18next initialized");
}

export { default } from "i18next";
