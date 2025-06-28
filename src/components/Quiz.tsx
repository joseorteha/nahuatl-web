'use client';

import { useState, useEffect } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizProps {
  leccionId: string;
}

export default function Quiz({ leccionId }: QuizProps) {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        // Relative URL works because this is a client component
        const res = await fetch(`/api/lecciones/${leccionId}/quiz`);
        if (!res.ok) throw new Error('Failed to fetch quiz data');
        const data = await res.json();
        setQuizData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [leccionId]);

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent changing answer

    const correctAnswer = quizData[currentQuestionIndex].answer;
    const correct = option === correctAnswer;

    setSelectedAnswer(option);
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setQuizFinished(false);
    // Optional: re-fetch to get new random questions
  };

  if (loading) {
    return <p className="text-center text-lg">Cargando quiz...</p>;
  }

  if (quizData.length === 0) {
    return <p className="text-center text-lg">No hay quiz disponible para esta lección.</p>;
  }

  if (quizFinished) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">¡Quiz completado!</h2>
        <p className="text-xl mb-6">
          Tu puntuación final es: <span className="font-bold text-green-600">{score}</span> de {quizData.length}
        </p>
        <button
          onClick={handleRestart}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Pregunta {currentQuestionIndex + 1} de {quizData.length}
        </p>
        <div className="bg-gray-200 h-2 rounded-full mt-1">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        ¿Cuál es la traducción de "<span className='text-blue-600'>{currentQuestion.question}</span>"?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          let buttonClass = 'bg-white border-2 border-blue-400 hover:bg-blue-100 text-blue-800';
          if (isSelected) {
            buttonClass = isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white';
          } else if (selectedAnswer && option === currentQuestion.answer) {
            buttonClass = 'bg-green-200 border-green-400 text-green-800'; // Show correct answer if wrong one was picked
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
              className={`p-4 rounded-lg text-lg font-semibold transition-colors duration-200 w-full disabled:cursor-not-allowed ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedAnswer && (
        <div className="mt-6 text-center">
          <p className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </p>
          {!isCorrect && <p className="text-gray-700 mt-2">La respuesta correcta era: <span className="font-semibold">{currentQuestion.answer}</span></p>}
          <button
            onClick={handleNextQuestion}
            className="mt-4 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {currentQuestionIndex < quizData.length - 1 ? 'Siguiente' : 'Finalizar'}
          </button>
        </div>
      )}
    </div>
  );
}
