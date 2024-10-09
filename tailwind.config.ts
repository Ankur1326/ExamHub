import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        green_button: '#1BC5BD',
        green_hover_button: '#18b7af',
        blue_button: '#3699FF',
        blue_hover_button: '#3291f0',
        accent: '#38c172',
        background: '#f8f9fa',
        // dark theme

        bg_primary: "#000",
        bg_secondary: "#181920",

        text_primary: "#E4E6EF",
        text_secondary: "#7E8299",
        text_red: "#DB1430",
        text_hover_red: "",
        
        border: "#424242",
        hover_border: "#5a5a5a",

        border_primary: "#424242",
        border_secondary: "#343434",

        hover_primary: "#424242",
        hover_secondary: "#282a30",
        // table_filter_section_bg: "#15171C",
        // table_raw_hover_color: "#22232c",
        // input_border: "#424242",
        // hover_input_border: "#5a5a5a",
        
        // light theme
        bg_light: "#fff",

      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
