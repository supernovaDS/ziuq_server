import 'dotenv/config'; // Loads your GROQ_API_KEY
import { evaluateAnswer } from './src/utils/aiGrader.js';

const testCase = {
  questionData: {
    correctAnswer: "The Eifell Tower in Paris",
    checkingInstruction: "Award full points if they mention the tower. Ignore spelling of Eiffel. Give half points if they only say Paris.",
    maxPoints: 10
  },
  userAnswer: "It is the Eifel Tower, located in paris"
};

async function runTest() {
  console.log("--- Starting AI Grading Test ---");
  console.log(`User Answer: "${testCase.userAnswer}"`);
  
  try {
    const result = await evaluateAnswer(testCase.userAnswer, testCase.questionData);
    
    console.log("\n--- AI Result ---");
    console.log(`Score: ${result.score} / ${testCase.questionData.maxPoints}`);
    console.log(`Feedback: ${result.feedback}`);
  } catch (error) {
    console.error("Test Failed:", error.message);
  }
}

runTest();