import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default tseslint.config(
	eslint.configs.recommended,
	prettierConfig,
	eslintPluginPrettier,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: "latest",
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"prettier/prettier": "error",
			"no-console": ["error"],
			indent: ["error", "tab", { SwitchCase: 1 }],
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "double"],
			semi: ["error", "always"],
			"keyword-spacing": [
				"error",
				{
					before: true,
					after: true,
				},
			],
			"space-before-blocks": [
				"error",
				{
					functions: "always",
					keywords: "always",
					classes: "always",
				},
			],
			"prefer-const": [
				"error",
				{
					destructuring: "any",
					ignoreReadBeforeAssign: false,
				},
			],
			"no-var": ["error"],
			"default-case-last": ["error"],
			"no-useless-escape": ["error"],
			"require-await": ["error"],
			camelcase: ["error"],
			"no-unsafe-optional-chaining": ["error"],
			"@typescript-eslint/array-type": ["error"],
			"@typescript-eslint/explicit-module-boundary-types": ["error"],
			"no-redeclare": ["off"],
			"@typescript-eslint/no-redeclare": ["error", { ignoreDeclarationMerge: true }],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
		},
	}
);
