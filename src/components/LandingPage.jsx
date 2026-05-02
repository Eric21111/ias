import { useEffect, useMemo, useState } from 'react'
import CardSwap, { Card } from './CardSwap'
import { lessonCards, moduleInfo } from '../data/lessonContent'
import CardDetailModal from './CardDetailModal'
import './LandingPage.css'

const StepDots = ({ active, isQuizCompleted = false, onStepClick }) => (
  <div className="lesson-steps" aria-label={`Step ${active} of 5`}>
    {[1, 2, 3, 4, 5].map((step) => (
      <button
        key={step}
        type="button"
        className={`step-dot ${step === active ? 'active' : ''} ${step === 5 && isQuizCompleted ? 'completed' : ''}`}
        onClick={() => onStepClick && onStepClick(step)}
        aria-pressed={step === active}
        aria-label={`Go to step ${step}`}
      >
        <span className="step-dot-label">{step}</span>
      </button>
    ))}
  </div>
)

const CORRECT_ANSWERS = {
  1: 'C',
  2: 'A',
  3: 'D',
  4: 'B',
}

const getOptionLetter = (optionText) => optionText.split(':')[0].trim()

const QuizOption = ({ text, name, checked, onChange, disabled }) => (
  <label
    className="quiz-option"
    onClick={(event) => {
      event.stopPropagation()
    }}
  >
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
      }}
    />
    <span>{text}</span>
  </label>
)

function LandingPage({ onLogout, currentUser }) {
  const [activeCardIndex, setActiveCardIndex] = useState(null)
  const [answers, setAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const activeCard = useMemo(
    () => (activeCardIndex === null ? null : lessonCards[activeCardIndex]),
    [activeCardIndex],
  )
  const quizStorageKey = useMemo(() => {
    const userKey = currentUser?.uid || currentUser?.email || 'guest'
    return `ia_cia_quiz_${userKey}`
  }, [currentUser?.uid, currentUser?.email])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(quizStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setQuizResult(parsed)
      setAnswers(parsed.answers || {})
      setQuizCompleted(Boolean(parsed.completed))
    } catch {
      localStorage.removeItem(quizStorageKey)
    }
  }, [quizStorageKey])

  const handleAnswerChange = (questionNumber, optionText) => {
    const selectedLetter = optionText.split(':')[0].trim()
    if (quizResult?.completed) {
      setQuizResult(null)
    }
    setAnswers((prev) => ({ ...prev, [questionNumber]: selectedLetter }))
  }

  const submitQuiz = () => {
    const quizSlide = lessonCards.find((card) => card.title === 'Quiz')
    if (!quizSlide) return

    const checkedResults = quizSlide.questions.map((question) => {
      const selected = answers[question.number] || ''
      const correct = CORRECT_ANSWERS[question.number]
      return {
        number: question.number,
        selected,
        correct,
        isCorrect: selected === correct,
      }
    })

    const score = checkedResults.filter((item) => item.isCorrect).length
    const payload = {
      completed: true,
      score,
      total: checkedResults.length,
      submittedAt: new Date().toISOString(),
      answers,
      checkedResults,
    }
    setQuizResult(payload)
    setQuizCompleted(true)
    localStorage.setItem(quizStorageKey, JSON.stringify(payload))
  }

  const handleQuizAction = () => {
    // If a previous result is showing, first switch to retake mode.
    if (quizResult?.completed) {
      setQuizResult(null)
      return
    }
    submitQuiz()
  }

  const renderSlideContent = (slide) => (
    <div className="lesson-card-content">
      {slide.title !== 'Quiz' ? (
        <>
          <h2>{slide.title}</h2>
          {slide.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {slide.bulletSections?.map((section) => (
            <div key={section.heading}>
              <h3>{section.heading}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      ) : (
        <>
          <p>{slide.intro}</p>
          <p>{slide.description}</p>
          <div className="quiz-list">
            {slide.questions.map((question) => (
              <article
                className={`quiz-card ${
                  quizResult?.completed
                    ? quizResult.checkedResults?.find((item) => item.number === question.number)?.isCorrect
                      ? 'quiz-correct'
                      : 'quiz-wrong'
                    : ''
                }`}
                key={question.number}
              >
                <h3>
                  {question.number}. {question.question}
                </h3>
                {quizResult?.completed ? (
                  <div
                    className={`quiz-result-line ${
                      quizResult.checkedResults?.find((item) => item.number === question.number)?.isCorrect
                        ? 'line-correct'
                        : 'line-wrong'
                    }`}
                  />
                ) : null}
                <div className="quiz-options">
                  {question.options.map((option) => {
                    const optionLetter = getOptionLetter(option)
                    const checkedResult = quizResult?.checkedResults?.find((item) => item.number === question.number)
                    const selectedLetter = checkedResult?.selected
                    const correctLetter = checkedResult?.correct
                    const isUserSelected = selectedLetter === optionLetter
                    const isCorrectAnswer = correctLetter === optionLetter

                    return (
                      <div
                        key={option}
                        className={`quiz-option-wrap ${
                          quizResult?.completed
                            ? isCorrectAnswer
                              ? 'option-correct'
                              : isUserSelected
                                ? 'option-wrong'
                                : ''
                            : answers[question.number] === optionLetter
                              ? 'option-selected'
                              : ''
                        }`}
                      >
                        <QuizOption
                          text={option}
                          name={`question-${question.number}`}
                          checked={answers[question.number] === optionLetter}
                          onChange={() => handleAnswerChange(question.number, option)}
                          disabled={false}
                        />
                      </div>
                    )
                  })}
                </div>
                {quizResult?.completed ? (
                  <p className="quiz-answer-note">
                    Your answer: {quizResult.checkedResults?.find((item) => item.number === question.number)?.selected || '-'} | Correct answer:{' '}
                    {quizResult.checkedResults?.find((item) => item.number === question.number)?.correct}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <button type="button" className="submit-btn" onClick={handleQuizAction}>
            {quizResult?.completed
              ? 'Start retake quiz'
              : quizCompleted
                ? 'Submit retake answers'
                : 'Submit answers'}
          </button>
          {quizResult?.completed ? (
            <p className="quiz-status success">
              Lesson complete. Step 5 stays green even after refresh. Click "Start retake quiz" to answer again.
            </p>
          ) : quizCompleted ? (
            <p className="quiz-status success">
              Retake mode is active. Answer the questions, then click "Submit retake answers".
            </p>
          ) : (
            <p className="quiz-status">Submit your answers to complete the lesson.</p>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className="lesson-shell">
      <header className="lesson-topbar">
        <div className="lesson-brand">
          <div className="lesson-brand-mark">
            <span />
          </div>
          <p>INFORMATION ASSURANCE</p>
        </div>
        <button onClick={onLogout} className="lesson-logout">
          LOGOUT
        </button>
      </header>

      <main className="lesson-main">
        <section className="lesson-panel">
          <div className="lesson-header-row">
            <div className="module-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3 5 6v6c0 4 2.7 7.6 7 9 4.3-1.4 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="11" r="1.2" fill="currentColor" />
                <path d="M12 8v1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1>{moduleInfo.title}</h1>
              <p className="module-description">
                introduces the three core principles of information security: Confidentiality, Integrity, and
                Availability. In this lesson, users learn how these concepts protect sensitive data from unauthorized
                access, ensure that information remains accurate and unaltered, and guarantee that systems and data are
                accessible when needed.
              </p>
            </div>
          </div>

          <div className="card-stage">
            <aside className="card-instruction" aria-label="Card interaction help">
              <strong>Tip</strong>
              <p>Hover and click a card to open it in the center.</p>
            </aside>
            <CardSwap
              width={840}
              height={560}
              cardDistance={34}
              verticalDistance={24}
              delay={2000}
              pauseOnHover={true}
              easing="linear"
              onCardClick={setActiveCardIndex}
            >
              {lessonCards.map((slide) => (
                <Card key={slide.step} customClass="lesson-card">
                  <StepDots
                    active={slide.step}
                    isQuizCompleted={quizCompleted}
                    onStepClick={(n) => setActiveCardIndex(lessonCards.findIndex((s) => s.step === n))}
                  />
                  <hr />
                  {renderSlideContent(slide)}
                </Card>
              ))}
            </CardSwap>
          </div>
        </section>
      </main>

      <CardDetailModal
        open={activeCard !== null}
        title={activeCard?.title || 'Card'}
        step={activeCard?.step || 1}
        onClose={() => setActiveCardIndex(null)}
      >
        {activeCard ? (
          <>
            <StepDots
              active={activeCard.step}
              isQuizCompleted={quizCompleted}
              onStepClick={(n) => setActiveCardIndex(lessonCards.findIndex((s) => s.step === n))}
            />
            <hr />
            {renderSlideContent(activeCard)}
          </>
        ) : null}
      </CardDetailModal>
    </div>
  )
}

export default LandingPage
