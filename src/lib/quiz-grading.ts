/**
 * Quiz grading and validation utilities for C4C Campus
 * @module lib/quiz-grading
 */

export interface QuizValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}

export interface GradingResult {
  answers: Array<{
    question_id: string;
    answer: unknown;
    is_correct: boolean;
    points_earned: number;
  }>;
  score: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  gradingStatus: 'auto_graded' | 'needs_review' | 'pending';
}

export interface Quiz {
  id: string;
  title: string;
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
  available_from?: string;
  available_until?: string;
  randomize_questions?: boolean;
}

export interface Question {
  id: string;
  question_type: 'multiple_choice' | 'true_false' | 'multiple_select' | 'short_answer' | 'essay';
  question_text: string;
  points: number;
  options?: Array<{ text: string; is_correct: boolean }>;
  correct_answer?: string | boolean;
}

export interface QuizAttempt {
  id: string;
  started_at: string;
  submitted_at?: string;
}

/**
 * Validate quiz data structure and settings
 * @param quizData - Quiz data to validate
 * @returns Validation result with errors
 */
export function validateQuiz(quizData: Partial<Quiz>): QuizValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!quizData.title?.trim()) {
    errors.push('Quiz title is required');
  }

  // Time limit validation
  if (quizData.time_limit_minutes !== undefined) {
    if (typeof quizData.time_limit_minutes !== 'number' || quizData.time_limit_minutes < 0) {
      errors.push('Time limit must be a non-negative number');
    }
  }

  // Passing score validation
  if (quizData.passing_score !== undefined) {
    if (typeof quizData.passing_score !== 'number' ||
        quizData.passing_score < 0 ||
        quizData.passing_score > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
  }

  // Max attempts validation
  if (quizData.max_attempts !== undefined) {
    if (typeof quizData.max_attempts !== 'number' || quizData.max_attempts < 0) {
      errors.push('Max attempts must be a non-negative number (0 = unlimited)');
    }
  }

  // Date validation
  if (quizData.available_from && quizData.available_until) {
    const from = new Date(quizData.available_from);
    const until = new Date(quizData.available_until);
    if (until <= from) {
      errors.push('Available until date must be after available from date');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a student can start a quiz attempt
 * @param quiz - Quiz configuration
 * @param submittedAttemptsCount - Number of attempts already submitted
 * @returns Availability result
 */
export function checkQuizAvailability(
  quiz: Quiz,
  submittedAttemptsCount: number
): AvailabilityResult {
  // Check if quiz is published
  if (!quiz.is_published) {
    return {
      available: false,
      reason: 'This quiz is not yet available',
    };
  }

  // Check max attempts
  if (quiz.max_attempts > 0 && submittedAttemptsCount >= quiz.max_attempts) {
    return {
      available: false,
      reason: `You have reached the maximum number of attempts (${quiz.max_attempts})`,
    };
  }

  // Check availability window
  const now = new Date();

  if (quiz.available_from) {
    const from = new Date(quiz.available_from);
    if (now < from) {
      return {
        available: false,
        reason: `This quiz will be available starting ${from.toLocaleDateString()}`,
      };
    }
  }

  if (quiz.available_until) {
    const until = new Date(quiz.available_until);
    if (now > until) {
      return {
        available: false,
        reason: 'This quiz is no longer available',
      };
    }
  }

  return { available: true };
}

/**
 * Fisher-Yates shuffle algorithm
 * @param array - Array to shuffle
 * @param inPlace - Shuffle in place or create new array
 * @returns Shuffled array
 */
export function shuffleQuestions<T>(questions: T[], inPlace: boolean = false): T[] {
  const arr = inPlace ? questions : [...questions];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Shuffle options within a question
 * @param question - Question with options
 * @param inPlace - Modify in place or create new object
 * @returns Question with shuffled options
 */
export function shuffleQuestionOptions<T extends { options?: unknown[] }>(
  question: T,
  inPlace: boolean = false
): T {
  if (!question.options || question.options.length === 0) {
    return question;
  }

  const result = inPlace ? question : { ...question };
  result.options = shuffleQuestions(question.options, false);

  return result;
}

/**
 * Check if a quiz attempt has expired based on time limit
 * @param attempt - Quiz attempt data
 * @param quiz - Quiz configuration
 * @returns True if attempt has expired
 */
export function isAttemptExpired(attempt: QuizAttempt, quiz: Quiz): boolean {
  if (!quiz.time_limit_minutes || quiz.time_limit_minutes === 0) {
    return false;
  }

  const startTime = new Date(attempt.started_at).getTime();
  const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;
  const expiryTime = startTime + timeLimitMs;

  return Date.now() > expiryTime;
}

/**
 * Auto-grade a quiz attempt
 * @param questions - Quiz questions with correct answers
 * @param studentAnswers - Student's submitted answers
 * @param quiz - Quiz configuration
 * @returns Grading result
 */
export function autoGradeQuizAttempt(
  questions: Question[],
  studentAnswers: Record<string, unknown>,
  quiz: Quiz
): GradingResult {
  let totalPoints = 0;
  let pointsEarned = 0;
  let needsReview = false;

  const gradedAnswers = questions.map((question) => {
    totalPoints += question.points;
    const studentAnswer = studentAnswers[question.id];

    let isCorrect = false;
    let points = 0;

    switch (question.question_type) {
      case 'multiple_choice': {
        // Compare selected option
        if (question.options) {
          const correctOption = question.options.findIndex(opt => opt.is_correct);
          isCorrect = studentAnswer === correctOption || studentAnswer === String(correctOption);
        }
        break;
      }

      case 'true_false': {
        // Compare boolean answer
        const studentBool = studentAnswer === true || studentAnswer === 'true';
        const correctBool = question.correct_answer === true || question.correct_answer === 'true';
        isCorrect = studentBool === correctBool;
        break;
      }

      case 'multiple_select': {
        // Compare arrays - all correct selections, no incorrect
        if (Array.isArray(studentAnswer) && question.options) {
          const correctIndices = question.options
            .map((opt, idx) => opt.is_correct ? idx : -1)
            .filter(idx => idx !== -1);
          const studentIndices = (studentAnswer as (number | string)[])
            .map(a => typeof a === 'string' ? parseInt(a, 10) : a)
            .sort();

          isCorrect = correctIndices.length === studentIndices.length &&
            correctIndices.every((idx, i) => idx === studentIndices[i]);
        }
        break;
      }

      case 'short_answer': {
        // Case-insensitive exact match
        if (typeof studentAnswer === 'string' && typeof question.correct_answer === 'string') {
          isCorrect = studentAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
        }
        break;
      }

      case 'essay': {
        // Essays need manual review
        needsReview = true;
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      points = question.points;
      pointsEarned += points;
    }

    return {
      question_id: question.id,
      answer: studentAnswer,
      is_correct: isCorrect,
      points_earned: points,
    };
  });

  const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
  const passed = score >= quiz.passing_score;

  return {
    answers: gradedAnswers,
    score,
    pointsEarned,
    totalPoints,
    passed,
    gradingStatus: needsReview ? 'needs_review' : 'auto_graded',
  };
}

/**
 * Calculate remaining time for an attempt
 * @param attempt - Quiz attempt
 * @param quiz - Quiz with time limit
 * @returns Remaining time in seconds, or null if no limit
 */
export function getRemainingTime(attempt: QuizAttempt, quiz: Quiz): number | null {
  if (!quiz.time_limit_minutes || quiz.time_limit_minutes === 0) {
    return null;
  }

  const startTime = new Date(attempt.started_at).getTime();
  const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;
  const expiryTime = startTime + timeLimitMs;
  const remainingMs = expiryTime - Date.now();

  return Math.max(0, Math.floor(remainingMs / 1000));
}
