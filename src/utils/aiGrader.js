import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const evaluateAnswer = async (userAnswer, questionData) => {
  const { correctAnswer, checkingInstruction, maxPoints } = questionData;

  const systemPrompt = `
    You are an expert quiz adjudicator. 
    Your goal is to grade the User's Answer against the Correct Answer.
    
    MAX POINTS POSSIBLE: ${maxPoints}
    GRADING INSTRUCTIONS: "${checkingInstruction}"
  `;

  const userPrompt = `
    Correct Answer: "${correctAnswer}"
    User's Answer: "${userAnswer}"

    Evaluate the answer based on the instructions provided. 
    Return a JSON object with:
    1. "score": (a number between 0 and ${maxPoints})
    2. "feedback": (a very brief explanation of why that score was given)
  `;

  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
};