import dotenv from "dotenv";

dotenv.config();

interface ConfigEnv {
  port: string;
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
  };
}

export const config = loadEnv();