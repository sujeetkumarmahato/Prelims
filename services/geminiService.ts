
import { GoogleGenAI, Type } from '@google/genai';
import { MCQ, Message } from '../types';

export const generateMCQs = async (topic: string): Promise<MCQ[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Generate 5 high-quality, multiple-choice questions (MCQs) for a UPSC exam aspirant on the topic of "${topic}". Each question must have exactly 4 options and a single correct answer. Provide a brief but comprehensive explanation for why the correct answer is right. The options should be plausible and challenging.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: 'An array of 5 MCQ questions.',
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: 'The question text.' },
                  options: {
                    type: Type.ARRAY,
                    description: 'An array of exactly 4 string options.',
                    items: { type: Type.STRING }
                  },
                  answer: { type: Type.STRING, description: 'The correct option string from the options array.' },
                  explanation: { type: Type.STRING, description: 'A detailed explanation for the correct answer.' }
                },
                required: ['question', 'options', 'answer', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const data = JSON.parse(responseText);
      return data.questions;
    }
    throw new Error('Empty response from API');

  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw new Error("Failed to generate quiz. Please check the topic or try again later.");
  }
};

export const continueGroupDiscussion = async (
  topic: string,
  history: Message[],
  userMessage: string,
  base64Image?: string,
  mimeType?: string
): Promise<Message[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are a moderator and participant in a group discussion for UPSC aspirants. The topic is "${topic}".
  The participants are Aisha (analytical, fact-based) and Rohan (opinionated, provides counter-arguments).
  Your role is to generate insightful and relevant responses for Aisha and Rohan based on the user's message and the conversation history.
  Keep the discussion civil, on-topic, and educational.
  The user's message is: "${userMessage}".
  The chat history is: ${JSON.stringify(history)}.
  Generate a response from either Aisha or Rohan, or both if appropriate. Return your response ONLY as a valid JSON array of message objects, like this: [{ "sender": "Aisha", "text": "..." }, { "sender": "Rohan", "text": "..." }]. Do not include any other text or markdown formatting.`;

  const parts: any[] = [{ text: systemInstruction }];

  if (base64Image && mimeType) {
      parts.unshift({
          inlineData: {
              data: base64Image,
              mimeType: mimeType,
          },
      });
      parts[1].text = `(The user has provided an image for context). ${parts[1].text}`;
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
    });

    const aiResponseText = response.text.trim();
    const jsonText = aiResponseText.startsWith('```json')
      ? aiResponseText.replace(/^```json\n/, '').replace(/\n```$/, '')
      : aiResponseText;
      
    const parsedResponse = JSON.parse(jsonText);

    if (Array.isArray(parsedResponse)) {
      return parsedResponse.filter(msg => msg.sender && msg.text) as Message[];
    }
    
    return [{ sender: 'System', text: "Received an unexpected response format." }];
  } catch (error) {
      console.error("Error in group discussion:", error);
      return [{ sender: 'System', text: "Sorry, I encountered an error. Please try again." }];
  }
};
