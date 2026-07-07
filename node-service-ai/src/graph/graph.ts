
import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { stateAnnotation } from "../state/grapgState"; 

async function startLLM(state: typeof stateAnnotation.State) {
  const response = await openAI.invoke(state.messages);
  return { messages: [response] }; 
}
import openAI from "../model/model";
import { SYSTEM_PROMPT } from "../constant";

const graph = new StateGraph(stateAnnotation)
  .addNode("startLLM", startLLM)
  .addEdge("__start__", "startLLM")
  .addEdge("startLLM", "__end__");

const appModel = graph.compile({ checkpointer: new MemorySaver() });

async function modelInvoke(data: { userMessage: string; diagram: number }) {
  const threadId = String(data.diagram);
  const existing = await appModel.getState({ configurable: { thread_id: threadId } });

  const messages = existing.values?.messages?.length
    ? [{ role: "user", content: data.userMessage }]
    : [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: data.userMessage },
      ];

  const state = await appModel.invoke(
    { messages },
    { configurable: { thread_id: threadId } }
  );

  return state.messages[state.messages.length - 1]?.content;
}


export default modelInvoke