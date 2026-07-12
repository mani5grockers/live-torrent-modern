module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/prettier"
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": "off",
    "vue/no-v-html": "warn"
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  }
};
