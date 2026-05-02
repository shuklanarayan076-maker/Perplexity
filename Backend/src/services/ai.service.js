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
    const historyWithoutSystem = formatted.slice(1);
    
    // Call sequentially to avoid rate limits/concurrency issues
    const proRes = await mainModel.invoke([
      new SystemMessage(`You are a skilled debater. Argue strongly FOR the topic. Focus: ${focus}.`),
      ...historyWithoutSystem
    ]);

    const conRes = await fastModel.invoke([
      new SystemMessage(`You are a skilled debater. Argue strongly AGAINST the topic. Focus: ${focus}.`),
      ...historyWithoutSystem
    ]);

    if (!proRes.content || !conRes.content) {
      throw new Error("One or more debaters failed to provide an argument.");
    }

    return {
      pro: proRes.content,
      con: conRes.content
    };
  } catch (error) {
    console.error("Debate Mode Error:", error);
    throw new Error(`Debate Service Error: ${error.message}`);
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

export async function generateResearchResponse(question, emitProgress) {
  
  // STEP 1 — Planner
  emitProgress("🧠 Planning research strategy...")
  
  const plannerRes = await mainModel.invoke([
    new SystemMessage(`You are a research planner.
      Break the user's question into exactly 3 specific sub-questions.
      Return ONLY a JSON array with 3 strings. No explanation. No markdown.
      Example: ["sub question 1", "sub question 2", "sub question 3"]`),
    new HumanMessage(question)
  ])

  let subQuestions = []
  try {
    subQuestions = JSON.parse(plannerRes.content)
  } catch {
    subQuestions = [
      question,
      question + " latest developments",
      question + " future implications"
    ]
  }

  emitProgress("🔍 Searching across multiple sources...")

  // STEP 2 — 3 Researchers in parallel
  const researchPromises = subQuestions.map(async (subQ) => {
    let searchContext = ""
    try {
      searchContext = await searchInternet({ query: subQ, focus: "web" })
    } catch (e) {
      console.error("Search failed for subQ:", subQ)
    }

    const res = await mainModel.invoke([
      new SystemMessage(`You are a research agent.
        Based on the search results provided, give a detailed factual summary.
        Be concise and accurate.`),
      new HumanMessage(
        searchContext
          ? `Search results: ${searchContext}\n\nQuestion: ${subQ}`
          : subQ
      )
    ])

    return {
      subQuestion: subQ,
      finding: res.content
    }
  })

  const findings = await Promise.all(researchPromises)

  emitProgress("✍️ Synthesizing final answer...")

  // STEP 3 — Synthesizer
  const synthesisInput = findings.map((f, i) =>
    `Sub-question ${i + 1}: ${f.subQuestion}\nFindings: ${f.finding}`
  ).join("\n\n---\n\n")

  const synthRes = await mainModel.invoke([
    new SystemMessage(`You are a research synthesizer.
      Combine research findings into one comprehensive, well-structured answer.
      Use clear headings for each section.
      Be thorough but concise.`),
    new HumanMessage(
      `Original question: ${question}\n\nResearch findings:\n${synthesisInput}`
    )
  ])

  return {
    subQuestions,
    findings,
    finalAnswer: synthRes.content
  }
}
