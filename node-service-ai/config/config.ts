import dotenv from "dotenv";
const envFile =
  process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({path:envFile});

interface ConfigEnv {
  port: string;
  OPENAI_API_KEY:string;
  FLOWDRAW_URL:string;
}

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function loadEnv(): ConfigEnv {
  return {
    port: getEnv("PORT"),
    OPENAI_API_KEY:getEnv("OPENAI_API_KEY"),
    FLOWDRAW_URL:getEnv("FLOWDRAW_URL")
  };
}

export const config = loadEnv();