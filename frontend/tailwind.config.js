// File: frontend/tailwind.config.js
// Purpose: TailwindCSS configuration including custom theme colors and shadcn preset.
// Location: frontend directory root

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // Enable dark mode using a class strategy (common for shadcn)
  content: [
    "./index.html", // Include base HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS(X) files in src
     // Potential paths if using shadcn library components directly (adjust if needed)
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  prefix: "", // No prefix needed unless conflicting with other libraries
  theme: {
    container: { // Optional container presets from shadcn
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: { // Define your custom color palette here
        border: "hsl(var(--border))", // From shadcn defaults
        input: "hsl(var(--input))", // From shadcn defaults
        ring: "hsl(var(--ring))", // From shadcn defaults
        background: "hsl(var(--background))", // Map to your color
        foreground: "hsl(var(--foreground))", // Map to your text color
        primary: {
          DEFAULT: "hsl(var(--primary))",         // Your --primary
          foreground: "hsl(var(--primary-foreground))", // Text on primary bg (needs definition)
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",       // Your --secondary
          foreground: "hsl(var(--secondary-foreground))",// Text on secondary bg (needs definition)
        },
         accent: {
           DEFAULT: "hsl(var(--accent))",          // Your --accent
           foreground: "hsl(var(--accent-foreground))", // Text on accent bg (needs definition)
         },
         destructive: { // Default destructive colors from shadcn
           DEFAULT: "hsl(var(--destructive))",
           foreground: "hsl(var(--destructive-foreground))",
         },
         muted: { // Default muted colors from shadcn
           DEFAULT: "hsl(var(--muted))",
           foreground: "hsl(var(--muted-foreground))",
         },
         popover: { // Default popover colors from shadcn
           DEFAULT: "hsl(var(--popover))",
           foreground: "hsl(var(--popover-foreground))",
         },
         card: { // Default card colors from shadcn
           DEFAULT: "hsl(var(--card))",
           foreground: "hsl(var(--card-foreground))",
         },
         // Add your custom names directly if preferred over overriding shadcn names
         'custom-text': '#f2f2e6',
         'custom-background': '#080804',
         'custom-primary': '#cfcea0',
         'custom-secondary': '#527039',
         'custom-accent': '#81b56f',
      },
      borderRadius: { // Default border radius from shadcn
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: { // Default keyframes from shadcn (for animations)
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: { // Default animations from shadcn
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
       fontFamily: { // Add Inter font
            sans: ['Inter', 'sans-serif'], // Make Inter the default sans-serif font
       },
    },
  },
  plugins: [import("tailwindcss-animate")], // shadcn animation plugin
}