/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class"],
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            // 基于黄金比例的字体大小
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.266rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.618rem', { lineHeight: '2rem' }],
                '3xl': ['2.618rem', { lineHeight: '2.5rem' }],
                '4xl': ['4.236rem', { lineHeight: '1.1' }],
                '5xl': ['6.854rem', { lineHeight: '1' }],
            },
            // 改进的行高系统
            lineHeight: {
                'tighter': '1.1',
                'tight': '1.2',
                'normal': '1.5',
                'relaxed': '1.625',
                'loose': '2',
            },
            // 字符间距
            letterSpacing: {
                'tighter': '-0.05em',
                'tight': '-0.025em',
                'normal': '0',
                'wide': '0.025em',
                'wider': '0.05em',
                'widest': '0.1em',
            },
            // 色彩系统 - 使用CSS变量，定义在theme.css中
            colors: {
                theme: {
                    primary: {
                        50: 'var(--theme-primary-50)',
                        100: 'var(--theme-primary-100)',
                        200: 'var(--theme-primary-200)',
                        300: 'var(--theme-primary-300)',
                        400: 'var(--theme-primary-400)',
                        500: 'var(--theme-primary-500)',
                        600: 'var(--theme-primary-600)',
                        700: 'var(--theme-primary-700)',
                        800: 'var(--theme-primary-800)',
                        900: 'var(--theme-primary-900)',
                        DEFAULT: 'var(--theme-primary)',
                    },
                    secondary: {
                        50: 'var(--theme-secondary-50)',
                        100: 'var(--theme-secondary-100)',
                        200: 'var(--theme-secondary-200)',
                        300: 'var(--theme-secondary-300)',
                        400: 'var(--theme-secondary-400)',
                        500: 'var(--theme-secondary-500)',
                        600: 'var(--theme-secondary-600)',
                        700: 'var(--theme-secondary-700)',
                        800: 'var(--theme-secondary-800)',
                        900: 'var(--theme-secondary-900)',
                        DEFAULT: 'var(--theme-secondary)',
                    },
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            // 动画配置
            animation: {
                "float": "float 6s ease-in-out infinite",
                "float-slow": "float 15s ease-in-out infinite",
                "text-reveal": "text-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1)",
                "text-wave": "text-wave 2.25s ease-in-out forwards",
            },
            keyframes: {
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "text-reveal": {
                    "0%": {
                        transform: "translateY(100%)",
                        opacity: 0,
                    },
                    "100%": {
                        transform: "translateY(0)",
                        opacity: 1,
                    },
                },
                "text-wave": {
                    "0%, 100%": {
                        transform: "translateY(0)",
                    },
                    "50%": {
                        transform: "translateY(-15px)",
                    },
                },
            },
            // 过渡效果
            transitionTimingFunction: {
                "in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
                "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
                "custom": "cubic-bezier(0.22, 1, 0.36, 1)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config; 