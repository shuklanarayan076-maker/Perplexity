import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";
import { searchInternet } from "./internet.service.js";

// Initialize models with explicit API keys
const mainModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7
});

const fastModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.5
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.7
});

function formatMessages(messages, focus = "web") {
  return [
    new SystemMessage(`You are a helpful AI assistant. Focus mode: ${focus}. Answer clearly and concisely.`),
    ...messages.map(msg => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (["ai", "gemini", "mistral", "pro", "con"].includes(msg.role)) return new AIMessage(msg.content);
      return null;
    }).filter(msg => msg !== null)
  ];
}

export async function generateResponse(messages, focus = "web") {
  try {
    const userQuery = messages[messages.length - 1].content;
    const formatted = formatMessages(messages, focus);

    // 1. Check if we need search
    const needsSearch = userQuery.length > 10; // Simple heuristic for speed
    let searchContext = "";

    if (needsSearch) {
      try {
        searchContext = await searchInternet({ query: userQuery, focus });
      } catch (e) {
        console.error("Search failed, proceeding without search:", e);
      }
    }

    // 2. Generate final answer with context if available
    const finalPrompt = searchContext 
      ? `Information found on internet: ${searchContext}\n\nUser Question: ${userQuery}`
      : userQuery;

    const response = await mainModel.invoke([
      ...formatted.slice(0, -1),
      new HumanMessage(finalPrompt)
    ]);

    return response.content;
  } catch (error) {
    console.error("Critical AI Error:", error);
    throw new Error("The AI service is currently overloaded. Please try again in a moment.");
  }
}

export async function generateCompareResponse(messages, focus = "web") {
  try {
    const formatted = formatMessages(messages, focus);
    const [llamaRes, mistralRes] = await Promise.all([
      mainModel.invoke(formatted),
      mistralModel.invoke(formatted)
    ]);

    return {
      gemini: llamaRes.content,
      mistral: mistralRes.content
    };
  } catch (error) {
    console.error("Compare Error:", error);
    throw new Error("Comparison mode failed. Please try normal mode.");
  }
}

export async function generateDebateResponse(messages, focus = "web") {
  try {
    const formatted = formatMessages(messages, focus);
    const [proRes, conRes] = await Promise.all([
      mainModel.invoke([
        new SystemMessage(`Argue FOR the topic. Focus: ${focus}.`),
        ...formatted.slice(1)
      ]),
      fastModel.invoke([
        new SystemMessage(`Argue AGAINST the topic. Focus: ${focus}.`),
        ...formatted.slice(1)
      ])
    ]);

    return {
      pro: proRes.content,
      con: conRes.content
    };
  } catch (error) {
    console.error("Debate Error:", error);
    throw new Error("Debate mode failed.");
  }
}

export async function generateChatTitle(message, focus = "web") {
  try {
    const response = await fastModel.invoke([
      new SystemMessage("Summarize this message in 2-3 words as a chat title."),
      new HumanMessage(message)
    ]);
    return response.content.replace(/["']/g, "");
  } catch (error) {
    return "New Conversation";
  }
}
