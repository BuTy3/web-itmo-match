import js from "@eslint/js";
import globals from "globals";

/**
 * ESLint 9 config (flat config)
 */
export default [
  // use ESLint's recommended rule for JS
  js.configs.recommended,

  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // permit to use console in backend
      "no-console": "off",

      // variant /arg begin with _ will be not warned "unused"
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
