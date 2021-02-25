module.exports = {
    extends: ['@allenai/eslint-config-varnish'],
    rules: {
        camelcase: 0, // turning off camelcase lint error since there are 123 offenders
    },
};
