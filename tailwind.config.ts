import type { Config } from 'tailwindcss'

export default {
    content: [
        './app/**/*.{vue,ts,js}',
        './components/**/*.{vue,ts,js}',
        './layouts/**/*.{vue,ts,js}',
        './pages/**/*.{vue,ts,js}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f5f5',
                    100: '#e8e8e8',
                    200: '#d4d4d4',
                    300: '#b0b0b0',
                    400: '#888888',
                    500: '#6b6b6b',
                    600: '#5a5a5a',
                    700: '#4a4a4a',
                    800: '#3d3d3d',
                    900: '#2d2d2d',
                },
                accent: {
                    DEFAULT: '#8b8b8b',
                    hover: '#6b6b6b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
import type { Config } from 'tailwindcss'

export default {
    content: [
        './app/**/*.{vue,ts,js}',
        './components/**/*.{vue,ts,js}',
        './layouts/**/*.{vue,ts,js}',
        './pages/**/*.{vue,ts,js}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f5f5',
                    100: '#e8e8e8',
                    200: '#d4d4d4',
                    300: '#b0b0b0',
                    400: '#888888',
                    500: '#6b6b6b',
                    600: '#5a5a5a',
                    700: '#4a4a4a',
                    800: '#3d3d3d',
                    900: '#2d2d2d',
                },
                accent: {
                    DEFAULT: '#8b8b8b',
                    hover: '#6b6b6b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
