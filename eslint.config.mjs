// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "indent": "off",
      "quote-props": "off",
      "operator-linebreak": "off",
      "no-unused-vars": "off",
      "spaced-comment": "off",
      "comma-dangle": [
        "error",
        "never"
      ],
      "generator-star-spacing": [
        "error",
        "before"
      ],
      "quotes": [
        "error",
        "single",
        "avoid-escape"
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          "allowExpressions": true
        }
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/member-delimiter-style": "error",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
);