import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const stateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    nextRepresentative:Annotation<string>,
    refundAuthorized:Annotation<boolean>

})