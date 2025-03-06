import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
//import { MANAGEMENT_API_URL } from "./src/constants/ApiConstant";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: "APP_",
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: MANAGEMENT_API_URL,
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  //   define: {
  //     global: {},
  //   },
  // },
});
