# Quiz Student UI - Quick Reference

## Files Created

### Components (5 files)
```
/src/components/
├── QuizCard.tsx              # Quiz display in lessons (235 lines)
├── QuizQuestion.tsx          # Question renderer (318 lines)
├── QuizTimer.tsx             # Countdown timer (138 lines)
├── QuizProgress.tsx          # Progress tracking (118 lines)
└── QuizResults.tsx           # Results display (276 lines)
```

### Pages (3 files)
```
/src/pages/quizzes/[id]/
├── take.astro                       # Quiz taking interface (340 lines)
├── results/[attemptId].astro        # Results page (198 lines)
└── attempts.astro                   # Attempt history (310 lines)
```

### API Endpoints (2 files)
```
/src/pages/api/quizzes/[id]/attempts/[attemptId]/
├── save.ts                   # Save draft answers (126 lines)
└── index.ts                  # Get attempt details (149 lines)
```

### Integration
```
/src/pages/lessons/[slug].astro      # Modified to show quizzes
```

### Tests & Docs
```
/tests/quiz-student-flow.test.ts     # Test suite (294 lines)
/docs/QUIZ_STUDENT_UI_COMPLETE.md    # Full documentation
/docs/QUIZ_STUDENT_QUICK_REFERENCE.md # This file
```

---

## Component Props

### QuizCard
```typescript
interface QuizCardProps {
  quizId: number;
  lessonId: number;
  onStart?: (quizId: number) => void;
}
```

### QuizQuestion
```typescript
interface QuizQuestionProps {
  question: QuizQuestionForStudent;
  questionNumber: number;
  totalQuestions: number;
  value: string | string[];
  onChange: (answer: string | string[]) => void;
  readonly?: boolean;
  showCorrectAnswer?: boolean;
  correctAnswer?: string | string[];
  isCorrect?: boolean | null;
  explanation?: string;
}
```

### QuizTimer
```typescript
interface QuizTimerProps {
  startedAt: string;
  timeLimit: number | null; // in minutes
  onTimeUp?: () => void;
}
```

### QuizProgress
```typescript
interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  showAll?: boolean;
}
```

### QuizResults
```typescript
interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetry?: () => void;
  onReview?: () => void;
  canRetake: boolean;
}
```

---

## API Endpoints

### GET /api/quizzes/[id]
**Returns:** Quiz details with user attempts
```json
{
  "quiz": { /* Quiz object */ },
  "attempts": [ /* QuizAttempt[] */ ]
}
```

### POST /api/quizzes/[id]/start
**Returns:** New attempt with questions
```json
{
  "success": true,
  "attempt": {
    "id": 1,
    "attemptNumber": 1,
    "startedAt": "2024-01-01T00:00:00Z",
    "timeLimit": 30
  },
  "questions": [ /* QuizQuestionForStudent[] */ ]
}
```

### POST /api/quizzes/[id]/attempts/[attemptId]/save
**Body:**
```json
{
  "answers": [
    { "questionId": 1, "answer": "a" },
    { "questionId": 2, "answer": "true" }
  ]
}
```
**Returns:** Success message

### POST /api/quizzes/[id]/attempts/[attemptId]/submit
**Body:** Same as save
**Returns:** Graded attempt with results
```json
{
  "success": true,
  "attempt": {
    "id": 1,
    "score": 85,
    "passed": true,
    "gradingStatus": "auto_graded"
  },
  "results": {
    "questions": [ /* With correct/incorrect info */ ]
  }
}
```

### GET /api/quizzes/[id]/attempts/[attemptId]
**Returns:** Attempt with questions and answers
```json
{
  "attempt": { /* QuizAttempt */ },
  "questions": [ /* With answers */ ],
  "quiz": { /* Quiz */ }
}
```

---

## Question Types

| Type | Input | Auto-Grade | Max Length |
|------|-------|------------|------------|
| Multiple Choice | Radio buttons | ✅ Yes | N/A |
| True/False | Radio buttons | ✅ Yes | N/A |
| Short Answer | Text input | ✅ Yes | 500 chars |
| Essay | Textarea | ❌ Manual | 10,000 chars |
| Fill in Blank | Text input | ✅ Yes | 500 chars |

---

## User Flows

### Take Quiz Flow
```
Lesson Page
  → Click "Start Quiz"
    → Instructions Modal
      → Click "Start Quiz"
        → Quiz Taking Page (/quizzes/[id]/take)
          → Answer questions
          → Auto-save every 30s
          → Click "Submit Quiz"
            → Confirmation Modal
              → Click "Yes, Submit"
                → Results Page (/quizzes/[id]/results/[attemptId])
```

### Review Results Flow
```
Results Page
  → Click "Review Answers"
    → Scroll through questions
    → See correct/incorrect
    → Read explanations
```

### Retake Flow
```
Results Page
  → Click "Retake Quiz"
    → New attempt created
    → Quiz Taking Page (new attemptId)
```

### View History Flow
```
Results Page or Lesson Page
  → Click "View All Attempts"
    → Attempts History Page (/quizzes/[id]/attempts)
      → See all attempts
      → Click "View Results" on any
        → Results Page for that attempt
```

---

## Key Features

✅ All 5 question types supported
✅ Timed quizzes with countdown
✅ Progress tracking and navigation
✅ Auto-save (30s) + manual save
✅ Draft resumption
✅ Submit confirmation
✅ Navigation prevention
✅ Results with pass/fail
✅ Question review
✅ Attempt history
✅ Retake support
✅ Max attempts enforcement

---

## Integration Example

```typescript
// In lesson page
async function loadQuizzes() {
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id')
    .eq('lesson_id', currentLesson.id)
    .eq('published', true);

  if (quizzes && quizzes.length > 0) {
    // Render QuizCard component
    import('../../components/QuizCard').then(({ QuizCard }) => {
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(document.getElementById('quiz-root'));
        root.render(
          QuizCard({
            quizId: quizzes[0].id,
            lessonId: currentLesson.id,
          })
        );
      });
    });
  }
}
```

---

## Testing Checklist

- [ ] Quiz card displays in lesson
- [ ] Start quiz creates attempt
- [ ] Questions render correctly
- [ ] All question types work
- [ ] Timer counts down
- [ ] Progress updates
- [ ] Draft saves
- [ ] Submit works
- [ ] Results display correctly
- [ ] Review shows answers
- [ ] Attempt history works
- [ ] Retake creates new attempt
- [ ] Max attempts enforced
- [ ] Navigation prevented during quiz

---

## Common Issues & Solutions

**Q: Quiz doesn't show in lesson**
- Check quiz is published
- Verify quiz.lesson_id matches lesson.id
- Check browser console for errors

**Q: Can't start quiz**
- Verify user is enrolled in course
- Check available_from/available_until dates
- Verify attempts remaining

**Q: Timer not showing**
- Quiz must have time_limit > 0
- Check QuizTimer component rendered

**Q: Answers not saving**
- Check network connectivity
- Verify attempt not already submitted
- Check API rate limits

---

## Quick Commands

```bash
# Check if quiz exists
SELECT * FROM quizzes WHERE lesson_id = [LESSON_ID];

# Check quiz attempts
SELECT * FROM quiz_attempts WHERE user_id = '[USER_ID]' AND quiz_id = [QUIZ_ID];

# Check quiz questions
SELECT * FROM quiz_questions WHERE quiz_id = [QUIZ_ID] ORDER BY order_index;

# Reset attempts for testing (use carefully!)
DELETE FROM quiz_attempts WHERE user_id = '[USER_ID]' AND quiz_id = [QUIZ_ID];
```

---

## Next Steps

1. Implement test suite with real data
2. Manual testing across browsers
3. Mobile testing
4. Accessibility audit
5. Performance testing
6. Deploy to staging
7. User acceptance testing
8. Production deployment

---

**Status:** ✅ COMPLETE - Ready for testing
**Last Updated:** 2024
**Total Lines of Code:** 2,477 lines
