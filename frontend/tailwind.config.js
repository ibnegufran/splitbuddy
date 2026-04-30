/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glass: "0 12px 40px rgba(0, 0, 0, 0.22)"
      },
      colors: {
        night: "#07121f"
      },
      backgroundImage: {
        haze:
          "radial-gradient(circle at 5% 0%, rgba(34,211,238,0.25) 0, transparent 30%), radial-gradient(circle at 90% 20%, rgba(59,130,246,0.28) 0, transparent 32%), linear-gradient(160deg, #0f172a 0%, #08111f 45%, #0b1b2e 100%)"
      }
    }
  },
  plugins: []
};
