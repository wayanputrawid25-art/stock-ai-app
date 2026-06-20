import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Primary Colors
        primary: { 
          DEFAULT: "hsl(var(--primary))", 
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          foreground: "hsl(var(--primary-foreground))" 
        },
        
        // Secondary Colors
        secondary: { 
          DEFAULT: "hsl(var(--secondary))", 
          light: "hsl(var(--secondary-light))",
          foreground: "hsl(var(--secondary-foreground))" 
        },
        
        // Muted Colors
        muted: { 
          DEFAULT: "hsl(var(--muted))", 
          foreground: "hsl(var(--muted-foreground))" 
        },
        
        // Accent Colors
        accent: { 
          DEFAULT: "hsl(var(--accent))", 
          foreground: "hsl(var(--accent-foreground))" 
        },
        
        // Card Colors
        card: { 
          DEFAULT: "hsl(var(--surface))", 
          foreground: "hsl(var(--foreground))" 
        },
        
        // Destructive
        destructive: { 
          DEFAULT: "hsl(var(--destructive))", 
          foreground: "hsl(0 0% 100%)" 
        },
        
        // Status Colors
        success: {
          DEFAULT: "hsl(var(--success))",
          light: "hsl(var(--success-light))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          light: "hsl(var(--warning-light))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          light: "hsl(var(--info-light))"
        },
        
        // Hot/Cold Colors
        hot: {
          DEFAULT: "hsl(var(--hot))",
          light: "hsl(var(--hot-light))"
        },
        cold: {
          DEFAULT: "hsl(var(--cold))",
          light: "hsl(var(--cold-light))"
        },
        
        // Border & Input
        border: {
          DEFAULT: "hsl(var(--border))",
          light: "hsl(var(--border-light))",
          focus: "hsl(var(--border-focus))"
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "9999px"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)"
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        DEFAULT: "var(--transition)",
        slow: "var(--transition-slow)"
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s infinite"
      },
      typography: {
        DEFAULT: {
          css: {
            color: "hsl(var(--foreground))"
          }
        }
      }
    }
  },
  plugins: []
};

export default config;
