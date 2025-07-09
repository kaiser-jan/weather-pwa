// import { fontFamily } from "tailwindcss/defaultTheme";

export const colors = {
	red: '#f00',
	background: 'hsl(220, 50%, 5%)',
	midground: 'hsl(220, 25%, 12%)',
	foreground: 'hsl(220, 20%, 20%)',
	overlay: 'hsl(220, 20%, 30%)',

	text: {
		DEFAULT: 'hsl(220, 8%, 98%)',
		muted: 'hsl(220, 20%, 80%)',
		disabled: 'hsl(220, 12%, 50%)',
	},

	disabled: {
		DEFAULT: 'hsl(220, 15%, 20%)',
		foreground: 'hsl(220, 15%, 65%)',
	},

	primary: {
		DEFAULT: 'hsl(160.68, 51.3%, 22.55%)',
	},
}

/** @type {import('tailwindcss').Config} */
const config = {
	// TODO: migrate
	// darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	// safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			colors: {
				...colors,
				primary: {
					...colors.primary,
					foreground: colors.text.DEFAULT
				},
				accent: {
					DEFAULT: colors.foreground,
					foreground: colors.text.DEFAULT
				},
				secondary: {
					DEFAULT: colors.foreground,
					foreground: colors.text.DEFAULT
				},
				muted: {
					DEFAULT: colors.disabled.DEFAULT,
					foreground: colors.disabled.foreground,
				},
				popover: {
					DEFAULT: colors.background
				},
				input: {
					DEFAULT: colors.foreground
				},
				ring: colors.primary.DEFAULT
			},
			fontFamily: {
				// sans: [...fontFamily.sans]
			}
		}
	},
};

export default config;
