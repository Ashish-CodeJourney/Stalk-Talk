import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { base } from "./eslint.config.js";

export default tseslint.config(
  ...base,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: reactHooks.configs["recommended-latest"].rules,
    settings: {
      react: { version: "18.3.1" },
    },
  }
);
