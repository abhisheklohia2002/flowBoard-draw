import { ChatOpenAI } from "@langchain/openai";
import { config } from "../../config/config";

const openAI = new ChatOpenAI({
  apiKey: config.OPENAI_API_KEY,
  model: "gpt-4.1-nano",
  temperature: 0,
});


export default openAI