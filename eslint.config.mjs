// @ts-check
import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
    {
        plugins: {
            '@stylistic': stylistic,
        },
        files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
        rules: {
            'indent': 'off',
            '@stylistic/indent': ['error', 2],
            'quotes': ['error', 'single'],
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error'],
            'vue/no-multiple-template-root': 0,
            'vue/multi-word-component-names': 0,
            '@typescript-eslint/no-explicit-any': 0,
            'no-irregular-whitespace': 0,
            '@typescript-eslint/unified-signatures': 0,
            'vue/html-indent': ['error', 2, {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            }],
        },
    },
)
