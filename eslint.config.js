import eslint from '@eslint/js'
import globals from 'globals'
import hooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-studio', 'dist-export-kit', 'artifacts', 'test-results', 'playwright-report'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.tsx'], plugins: { 'react-hooks': hooks }, rules: { ...hooks.configs.recommended.rules } },
  { files: ['scripts/*.mjs'], languageOptions: { globals: globals.node } },
)
