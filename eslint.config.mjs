import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "generated/**"],
  },
];

export default eslintConfig;
