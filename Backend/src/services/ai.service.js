
import {HumanMessage,SystemMessage,AIMessage,tool,createAgent} from "langchain"
import {ChatMistralAI} from "@langchain/mistralai"
import {ChatGroq} from "@langchain/groq"
import * as z from "zod"
import { searchInternet } from "./internet.service.js";


const mainModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY
})

const compareModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: process.env.GROQ_API_KEY
})

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
  searchInternet,
  {
    name: "searchInternet",
    description:"use this tool to get the latest information from the internet",
    schema: z.object({
      query:z.string().describe("The search query to look up on the internet."),
      focus: z.string().optional().describe("Focus area: web,new,academic,reddit")
    })
  }
)

const agent = createAgent({
  model: mainModel,
  tools:[searchInternetTool]
})

const mistralAgent = createAgent({
  model: compareModel,
  tools:[searchInternetTool]
})

function formatMessages(messages,focus = "web"){
  return [
    new SystemMessage(
      `You are a helpful and precise assistant for answering questions.
      If the question requires up-to-date information, use the searchInternet tool.
      Current search focus mode: ${focus}.
      When using searchInternet tool,always pass focus: "${focus}".
     `
    ),
    ...messages.map(msg =>{
      if(msg.role === "user") return new HumanMessage(msg.content)
      else if(msg.role === "ai") return new AIMessage(msg.content)
    })
  ]
}

export async function generateResponse(messages,focus= "web"){
  const response = await agent.invoke({
   messages: formatMessages(messages,focus)
  })

  return response.messages[response.messages.length-1].text
}

export async function generateCompareResponse(messages,focus = "web"){
  const formatted = formatMessages(messages,focus)
  const [llamaRes,mixtralRes] = await Promise.all([
    agent.invoke({messages: formatted}),
    mistralAgent.invoke({messages: formatted})
  ])

  return {
    gemini : llamaRes.messages[geminiRes.messages.length-1].text,
    mistral : mixtralRes.messages[mistralRes.messages.length-1].text
  }
}

export async function generateDebateResponse(messages){
  const userQuery = messages[messages.length-1].content
  const [proRes,conRes] = await Promise.all([
    mainModel.invoke([
        new SystemMessage(`
          You are a skilled debater.
          You Must argue strongly for the following topic.
          Give 3 strong points supporting your side.
          Be confident and persuasive.
          Do not mention the supporting side.
          Do not use any tools or search the internet.`)
          ,new HumanMessage(userQuery)
  ]),
  compareModel.invoke([
    new SystemMessage(`
    You are a skilled debater.
    You Must argue strongly against the following topic.
    Give 3 strong points against your side.
    Be confident and persuasive.
    Do not mention the opposing side.
    Do not use any tools or search the internet.`),
    new HumanMessage(userQuery)
  ])
  ])

  return {
    pro: proRes.content,
    con: conRes.content
  }
}

export async function generateChatTitle(message){
  const response = await mistralModel.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations.
      User will provide you with the first message of chat conversation, and you will generate a title that captures the essence of the 
      conversation in 2-4 words. The title should be clear,relevant and engaging, giving users a quick understanding of the 
      chat's topic 
      `),
      new HumanMessage(`
        Generate a title for a chat conversation based on the following first message:
        "${message}"
      `)
  ])

  return response.text
}

