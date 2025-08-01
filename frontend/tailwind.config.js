/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], 
  content: [
    "./index.html", 
    "./src/**/*.{ts,tsx}",
    // './pages/**/*.{ts,tsx}',
    // './components/**/*.{ts,tsx}',
    // './app/**/*.{ts,tsx}',
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
      colors: { 
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
         accent: {
           DEFAULT: "hsl(var(--accent))",          
           foreground: "hsl(var(--accent-foreground))", 
         },
         destructive: { 
           DEFAULT: "hsl(var(--destructive))",
           foreground: "hsl(var(--destructive-foreground))",
         },
         muted: { 
           DEFAULT: "hsl(var(--muted))",
           foreground: "hsl(var(--muted-foreground))",
         },
         popover: { 
           DEFAULT: "hsl(var(--popover))",
           foreground: "hsl(var(--popover-foreground))",
         },
         card: { 
           DEFAULT: "hsl(var(--card))",
           foreground: "hsl(var(--card-foreground))",
         },
         'custom-text': '#f2f2e6',
         'custom-background': '#080804',
         'custom-primary': '#cfcea0',
         'custom-secondary': '#527039',
         'custom-accent': '#81b56f',
      },
      borderRadius: { 
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: { 
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: { 
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
       fontFamily: { 
            sans: ['Inter', 'sans-serif'], 
       },
    },
  },
  plugins: [import("tailwindcss-animate")], 
}