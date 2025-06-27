"use client";

import ComingSoon from '@/components/ComingSoon';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Trophy, BrainCircuit, RefreshCw } from 'lucide-react';

// --- Tipos de Datos ---
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// --- Componente Principal del Quiz ---
export default function PracticePage() {
  if (process.env.NEXT_PUBLIC_LAUNCH_MODE === 'preview') {
    return <ComingSoon />;
  }

  const [quizState, setQuizState] = useState<'loading' | 'playing' | 'finished' | 'error'>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const fetchQuiz = useCallback(async () => {
    setQuizState('loading');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/practice/quiz`);
      if (!res.ok) throw new Error('Failed to fetch quiz data');
      const data = await res.json();
      if (data.length === 0) throw new Error('Not enough data to create a quiz');
      setQuestions(data);
      setQuizState('playing');
    } catch (error) {
      console.error(error);
      setQuizState('error');
    }
  }, []);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const resetQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    fetchQuiz();
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // Ya se respondió

    const answerIsCorrect = option === questions[currentQuestionIndex].answer;
    setSelectedAnswer(option);
    setIsCorrect(answerIsCorrect);
    if (answerIsCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState('finished');
    }
  };

  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return 'bg-gray-700 hover:bg-gray-600';
    }
    const isCorrectAnswer = option === questions[currentQuestionIndex].answer;
    const isSelectedAnswer = option === selectedAnswer;

    if (isCorrectAnswer) return 'bg-emerald-500/80 border-emerald-400';
    if (isSelectedAnswer) return 'bg-red-500/80 border-red-400';
    return 'bg-gray-700 opacity-50';
  };

  // --- Renderizado Condicional ---

  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-16 w-16 animate-spin text-emerald-400 mb-4" />
        <p className="text-xl">Cargando tu desafío...</p>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white text-center p-4">
        <AlertTriangle className="h-16 w-16 text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Oh, no! Algo salió mal.</h2>
        <p className="text-gray-400 mb-6">No pudimos generar el quiz. Asegúrate de que el servidor esté funcionando.</p>
        <button onClick={resetQuiz} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-semibold transition-colors">
          <RefreshCw size={18} />
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (quizState === 'finished') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white text-center p-4">
        <Trophy className="h-24 w-24 text-yellow-400 mb-4" />
        <h2 className="text-4xl font-bold mb-2">¡Quiz Completado!</h2>
        <p className="text-2xl text-gray-300 mb-6">Tu puntuación final es:</p>
        <p className="text-6xl font-bold text-emerald-400 mb-8">{score} / {questions.length}</p>
        <button onClick={resetQuiz} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
          <RefreshCw size={20} />
          Jugar de nuevo
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BrainCircuit className="text-emerald-400" size={32}/>
            <h1 className="text-3xl font-bold">Práctica de Náhuatl</h1>
          </div>
          <p className="text-gray-400">Puntaje: {score} | Pregunta: {currentQuestionIndex + 1} de {questions.length}</p>
        </header>
        
        <div className="w-full h-2 bg-gray-700 rounded-full mb-8">
            <div className="h-2 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>

        <main className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
          <p className="text-gray-400 text-lg mb-2">Traduce la siguiente palabra:</p>
          <h2 className="text-4xl font-bold text-emerald-300 mb-8 text-center py-4">{currentQuestion.question}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={!!selectedAnswer}
                className={`p-4 rounded-lg text-lg font-medium border-2 border-transparent transition-all duration-200 ${getButtonClass(option)}`}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <div className="mt-6 text-center">
              <div className={`flex items-center justify-center gap-2 text-xl font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? <CheckCircle /> : <XCircle />}
                <span>{isCorrect ? '¡Correcto!' : 'Incorrecto'}</span>
              </div>
              {!isCorrect && <p className='text-gray-400 mt-1'>La respuesta correcta era: <span className='font-semibold'>{currentQuestion.answer}</span></p>}
              <button onClick={handleNextQuestion} className="mt-4 bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-lg font-semibold transition-colors">
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver resultados'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
