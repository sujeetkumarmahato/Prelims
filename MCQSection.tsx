
import React, { useState, useCallback } from 'react';
import { MCQ } from '../types';
import { generateMCQs } from '../services/geminiService';

const MCQSection: React.FC = () => {
  const [topic, setTopic] = useState<string>('Indian Polity');
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);

  const handleGenerateQuiz = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuestions = await generateMCQs(topic);
      if (fetchedQuestions && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setQuizStarted(true);
      } else {
        setError("Could not generate a quiz for this topic. Please try another one.");
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === questions[currentQuestionIndex].answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const handleRestart = () => {
    setQuizStarted(false);
    setQuestions([]);
    setError(null);
  }

  const getOptionClasses = (option: string) => {
    if (!isAnswered) {
      return "bg-white hover:bg-sky-100 cursor-pointer";
    }
    const isCorrect = option === questions[currentQuestionIndex].answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) return "bg-emerald-100 text-emerald-800 border-emerald-500";
    if (isSelected && !isCorrect) return "bg-rose-100 text-rose-800 border-rose-500";
    return "bg-slate-50 text-slate-500";
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg animate-pulse">
            <div className="w-16 h-16 border-4 border-sky-500 border-dashed rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Generating your quiz on "{topic}"...</p>
            <p className="text-slate-500 text-sm">This might take a moment.</p>
        </div>
    );
  }

  if (!quizStarted) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">MCQ Practice Zone</h2>
          <p className="text-slate-600 mb-6">Enter a UPSC-related topic to start a customized quiz.</p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Modern Indian History"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
            <button
              onClick={handleGenerateQuiz}
              disabled={isLoading}
              className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors duration-300 disabled:bg-slate-400"
            >
              Generate Quiz
            </button>
            {error && <p className="text-rose-500 mt-2">{error}</p>}
          </div>
        </div>
    );
  }

  if (questions.length === 0) {
      return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Oops!</h2>
            <p className="text-slate-600 mb-6">{error || "Something went wrong and we couldn't create your quiz."}</p>
            <button onClick={handleRestart} className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700 transition-colors">Try a Different Topic</button>
        </div>
      );
  }

  const isQuizFinished = currentQuestionIndex >= questions.length;

  if (isQuizFinished) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
            <p className="text-slate-600 mb-6">You've finished the quiz on "{topic}".</p>
            <div className="mb-6">
                <p className="text-lg">Your Score:</p>
                <p className="text-5xl font-bold text-sky-600">{score} / {questions.length}</p>
            </div>
            <button onClick={handleRestart} className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors">
                Start a New Quiz
            </button>
        </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-sky-700">Topic: {topic}</h2>
            <div className="text-lg font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">
                {currentQuestionIndex + 1} / {questions.length}
            </div>
        </div>
        <div className="mb-6">
            <p className="text-xl font-medium text-slate-800">{currentQuestion.question}</p>
        </div>
        <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
                <div
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 border rounded-lg transition-all duration-200 ${getOptionClasses(option)}`}
                >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                </div>
            ))}
        </div>
        {isAnswered && (
            <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 animate-fade-in">
                <h3 className="font-bold text-slate-800 mb-2">Explanation:</h3>
                <p className="text-slate-700">{currentQuestion.explanation}</p>
            </div>
        )}
        <div className="mt-8 text-right">
            {isAnswered && (
                 <button onClick={handleNextQuestion} className="bg-sky-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-sky-700 transition-colors">
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
                 </button>
            )}
        </div>
    </div>
  );
};

export default MCQSection;
