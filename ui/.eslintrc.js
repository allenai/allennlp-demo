module.exports = {
    extends: ['@allenai/eslint-config-varnish'],
    globals: {
        JSX: true,
    },
    rules: {
        '@typescript-eslint/no-use-before-define': 0,
        camelcase: 0, // turning off camelcase lint error since there are 123 offenders
    },
};
