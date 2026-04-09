"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { InterviewAvatar } from "./avatar"
import { SpeechBubble } from "./speech-bubble"
import { useState, useEffect, useCallback, useRef } from "react"
import { Clock, ArrowRight, Send, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react"
import Image from "next/image"
import { ExitDialog } from "./exit-dialog"
import type { InterviewType, DifficultyLevel } from "./landing-page"

interface InterviewSessionProps {
  config: {
    name: string
    role: string
    type: InterviewType
    difficulty: DifficultyLevel
  }
  onComplete: (results: QuestionResult[]) => void
  onExit: () => void
}

export interface QuestionResult {
  question: string
  answer: string
  score: number
  feedback: {
    good: string
    improve: string
    suggestion: string
  }
}

const generateQuestions = (type: InterviewType, role: string, difficulty: DifficultyLevel): string[] => {
  const technicalQuestions: Record<DifficultyLevel, string[]> = {
    junior: [
      `For a ${role} position, can you explain the difference between var, let, and const in JavaScript?`,
      `What is responsive design and how do you implement it in your projects?`,
      `Explain what an API is and how you would consume one in a web application.`,
      `What is version control and why is it important for development teams?`,
      `Can you describe the box model in CSS and how padding, margin, and border work together?`,
    ],
    mid: [
      `For a ${role} role, how would you optimize the performance of a web application?`,
      `Explain the concept of state management and when you would use different solutions.`,
      `How do you approach debugging a complex issue in production?`,
      `Describe your experience with testing and what testing strategies you prefer.`,
      `How would you design a component library that is both reusable and maintainable?`,
    ],
    senior: [
      `As a ${role}, how would you architect a large-scale application for scalability?`,
      `Describe a challenging technical decision you made and its long-term impact.`,
      `How do you approach mentoring junior developers while maintaining your own productivity?`,
      `What strategies do you use for managing technical debt in a fast-paced environment?`,
      `How would you lead a migration from a legacy system to modern architecture?`,
    ],
  }

  const behaviouralQuestions: Record<DifficultyLevel, string[]> = {
    junior: [
      `Tell me about a time you had to learn something new quickly for a project.`,
      `Describe a situation where you received constructive feedback. How did you respond?`,
      `How do you prioritize your tasks when working on multiple assignments?`,
      `Tell me about a team project you worked on. What was your role?`,
      `Describe a challenging problem you solved. What was your approach?`,
    ],
    mid: [
      `Describe a time when you had a disagreement with a team member. How did you resolve it?`,
      `Tell me about a project that failed or didn't meet expectations. What did you learn?`,
      `How do you handle tight deadlines while maintaining quality?`,
      `Describe a situation where you had to influence others without direct authority.`,
      `Tell me about a time you had to make a decision with incomplete information.`,
    ],
    senior: [
      `Describe a time you led a team through a significant change or challenge.`,
      `How do you balance business needs with technical excellence?`,
      `Tell me about a time you had to push back on a stakeholder's request.`,
      `Describe how you've built and maintained high-performing teams.`,
      `Share an example of how you've driven innovation in your organization.`,
    ],
  }

  const generalQuestions: Record<DifficultyLevel, string[]> = {
    junior: [
      `Why are you interested in this ${role} position?`,
      `What do you know about our company and what interests you about working here?`,
      `Where do you see yourself in 3-5 years?`,
      `What are your greatest strengths and how do they apply to this role?`,
      `Do you have any questions about the role or the team?`,
    ],
    mid: [
      `What motivates you to apply for this ${role} position at this stage of your career?`,
      `How do you stay current with industry trends and technologies?`,
      `What's your ideal work environment and team culture?`,
      `Describe your approach to continuous learning and professional development.`,
      `What unique perspective would you bring to our team?`,
    ],
    senior: [
      `What strategic impact do you expect to make in this ${role} position?`,
      `How do you measure success in your role and for your team?`,
      `What's your philosophy on leadership and team development?`,
      `How do you balance innovation with delivering consistent results?`,
      `What questions would you ask to evaluate if this is the right opportunity?`,
    ],
  }

  const questionSets = {
    technical: technicalQuestions,
    behavioural: behaviouralQuestions,
    general: generalQuestions,
  }

  return questionSets[type][difficulty]
}

const generateFeedback = (answer: string, question: string): { score: number; good: string; improve: string; suggestion: string } => {
  const lowerAnswer = answer.toLowerCase().trim()
  const wordCount = answer.trim().split(/\s+/).filter(w => w.length > 0).length
  const questionLower = question.toLowerCase()
  
  // Detect non-answers and "I don't know" responses
  const nonAnswerPatterns = [
    /i\s*(don'?t|do\s*not)\s*know/i,
    /no\s*idea/i,
    /not\s*sure/i,
    /can'?t\s*(answer|say|tell)/i,
    /i'?m\s*not\s*familiar/i,
    /never\s*(heard|learned|used|worked)/i,
    /pass/i,
    /skip/i,
    /next\s*question/i,
    /^(no|nope|idk|dunno|um+|uh+|hmm+)[\s.,!?]*$/i,
  ]
  
  const isNonAnswer = nonAnswerPatterns.some(pattern => pattern.test(lowerAnswer))
  const isVeryShort = wordCount < 10
  const isTooShort = wordCount < 5
  
  // If they admit they don't know or give a non-answer
  if (isNonAnswer || isTooShort) {
    return {
      score: isTooShort ? 1 : 2,
      good: "Being honest about knowledge gaps shows integrity.",
      improve: "This question requires a substantive answer. Even if you're unsure, try to reason through the problem or share related knowledge.",
      suggestion: "Research this topic before your actual interview. Try to provide at least a partial answer showing your thought process.",
    }
  }
  
  // Determine if this is a technical question
  const isTechnical = questionLower.includes("explain") || 
    questionLower.includes("difference between") ||
    questionLower.includes("how would you") ||
    questionLower.includes("what is") ||
    questionLower.includes("optimize") ||
    questionLower.includes("architect") ||
    questionLower.includes("debug") ||
    questionLower.includes("design") ||
    questionLower.includes("implement") ||
    questionLower.includes("testing") ||
    questionLower.includes("api") ||
    questionLower.includes("component") ||
    questionLower.includes("state management") ||
    questionLower.includes("performance")
  
  // Technical keyword detection for technical questions
  const technicalKeywords = [
    // JavaScript/Programming
    "function", "variable", "scope", "hoisting", "closure", "async", "await", "promise",
    "callback", "event loop", "prototype", "inheritance", "class", "object", "array",
    "const", "let", "var", "block scope", "temporal dead zone", "immutable",
    // Web Development
    "responsive", "media query", "flexbox", "grid", "viewport", "breakpoint",
    "mobile first", "desktop first", "css", "html", "dom", "component",
    // API/Backend
    "rest", "graphql", "endpoint", "http", "request", "response", "json", "fetch",
    "authentication", "authorization", "token", "header", "status code",
    // Testing
    "unit test", "integration test", "e2e", "mock", "stub", "coverage", "tdd", "bdd",
    "jest", "cypress", "playwright", "assertion",
    // Architecture/Performance
    "caching", "lazy loading", "code splitting", "bundle", "tree shaking", "minification",
    "cdn", "compression", "indexing", "query optimization", "database",
    "microservice", "monolith", "scalability", "load balancing",
    // Version Control
    "git", "branch", "merge", "commit", "pull request", "code review", "ci/cd",
    // State Management
    "state", "redux", "context", "zustand", "recoil", "props", "lifting state",
  ]
  
  // Behavioral/STAR method indicators
  const starIndicators = [
    /situation|context|background/i,
    /task|goal|objective|challenge/i,
    /action|approach|decided|implemented|did/i,
    /result|outcome|impact|achieved|learned/i,
  ]
  
  // Scoring logic
  let score = 3 // Start at baseline for attempting an answer
  let goodPoints: string[] = []
  let improvePoints: string[] = []
  let suggestions: string[] = []
  
  // Check answer length (but don't reward length alone)
  if (isVeryShort) {
    score -= 1
    improvePoints.push("Your answer is too brief to demonstrate understanding")
  } else if (wordCount >= 30 && wordCount <= 200) {
    score += 1
    goodPoints.push("Good answer length - concise but thorough")
  } else if (wordCount > 200) {
    goodPoints.push("Detailed response")
  }
  
  // Technical question analysis
  if (isTechnical) {
    const technicalTermsUsed = technicalKeywords.filter(keyword => 
      lowerAnswer.includes(keyword.toLowerCase())
    )
    
    if (technicalTermsUsed.length >= 5) {
      score += 3
      goodPoints.push("Strong use of technical terminology showing deep knowledge")
    } else if (technicalTermsUsed.length >= 3) {
      score += 2
      goodPoints.push("Good technical vocabulary demonstrating understanding")
    } else if (technicalTermsUsed.length >= 1) {
      score += 1
      improvePoints.push("Consider using more specific technical terms")
    } else {
      score -= 1
      improvePoints.push("Your answer lacks technical depth - use specific terminology")
      suggestions.push("Include relevant technical concepts, tools, or methodologies in your answer")
    }
    
    // Check for concrete examples in technical answers
    if (/for example|such as|like when|in my project|i built|i implemented|i used/i.test(lowerAnswer)) {
      score += 1
      goodPoints.push("Good use of concrete examples")
    } else {
      improvePoints.push("Add specific examples from your experience")
    }
    
    // Check for explanation of "why" not just "what"
    if (/because|reason|this allows|this helps|benefit|advantage|trade-?off/i.test(lowerAnswer)) {
      score += 1
      goodPoints.push("Good explanation of reasoning and trade-offs")
    } else {
      suggestions.push("Explain WHY you would choose an approach, not just what it is")
    }
  } else {
    // Behavioral/General question analysis
    const starCount = starIndicators.filter(pattern => pattern.test(lowerAnswer)).length
    
    if (starCount >= 3) {
      score += 3
      goodPoints.push("Excellent use of structured storytelling (STAR method)")
    } else if (starCount >= 2) {
      score += 2
      goodPoints.push("Good structure with situation and actions described")
    } else if (starCount >= 1) {
      score += 1
      improvePoints.push("Use the STAR method: Situation, Task, Action, Result")
    } else {
      suggestions.push("Structure your answer using STAR: describe the Situation, your Task, Actions you took, and Results achieved")
    }
    
    // Check for specific details and metrics
    if (/\d+%|\$\d+|\d+\s*(people|team|members|users|customers|months|years|weeks)/i.test(lowerAnswer)) {
      score += 1
      goodPoints.push("Great use of specific metrics and numbers")
    } else {
      improvePoints.push("Quantify your impact with specific numbers when possible")
    }
    
    // Check for reflection/learning
    if (/learned|realized|improved|grew|developed|taught me/i.test(lowerAnswer)) {
      score += 1
      goodPoints.push("Good reflection on lessons learned")
    }
  }
  
  // Check for red flags
  const redFlags = [
    { pattern: /we did|the team/i, issue: "Focus more on YOUR specific contributions" },
    { pattern: /^(yes|no)[,.\s]/i, issue: "Start with context, not just yes/no" },
    { pattern: /hate|terrible|awful|worst/i, issue: "Avoid overly negative language about past experiences" },
  ]
  
  for (const flag of redFlags) {
    if (flag.pattern.test(lowerAnswer) && !improvePoints.includes(flag.issue)) {
      improvePoints.push(flag.issue)
    }
  }
  
  // Cap score between 1-10
  score = Math.max(1, Math.min(10, score))
  
  // Generate final feedback
  const good = goodPoints.length > 0 
    ? goodPoints.slice(0, 2).join(". ") + "."
    : "You attempted to answer the question."
  
  const improve = improvePoints.length > 0
    ? improvePoints.slice(0, 2).join(". ") + "."
    : "Continue practicing to refine your delivery."
    
  const suggestion = suggestions.length > 0
    ? suggestions[0]
    : score >= 7 
      ? "Keep practicing this style of answer for consistency."
      : "Practice answering similar questions with more specific examples and technical depth."
  
  return { score, good, improve, suggestion }
}

type SessionPhase = "asking" | "answering" | "feedback" | "transitioning"

// Speech recognition type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function InterviewSession({ config, onComplete, onExit }: InterviewSessionProps) {
  const [questions] = useState(() => generateQuestions(config.type, config.role, config.difficulty))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [phase, setPhase] = useState<SessionPhase>("asking")
  const [results, setResults] = useState<QuestionResult[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<QuestionResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  
  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / questions.length) * 100

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for speech synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
        setSpeechSupported(true)
      }
      
      // Check for speech recognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        setRecognitionSupported(true)
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ""
          let interimText = ""
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript + " "
            } else {
              interimText += result[0].transcript
            }
          }
          
          if (finalTranscript) {
            setAnswer((prev) => prev + finalTranscript)
            setInterimTranscript("")
          } else {
            setInterimTranscript(interimText)
          }
        }
        
        recognition.onerror = () => {
          setIsListening(false)
          setInterimTranscript("")
        }
        
        recognition.onend = () => {
          setIsListening(false)
          setInterimTranscript("")
        }
        
        recognitionRef.current = recognition
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Speak the question when in asking phase
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current || !voiceEnabled) {
      onEnd?.()
      return
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    
    // Select an American female voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(
      // Samantha is the default US female voice on macOS/iOS
      (voice) => voice.name.includes("Samantha") && voice.lang === "en-US"
    ) || voices.find(
      // Google US English female voice
      (voice) => voice.name.includes("Google US English") && voice.name.includes("Female")
    ) || voices.find(
      // Microsoft Zira is US female on Windows
      (voice) => voice.name.includes("Zira")
    ) || voices.find(
      // Any US English female voice
      (voice) => voice.lang === "en-US" && (
        voice.name.toLowerCase().includes("female") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Zira") ||
        voice.name.includes("Ava") ||
        voice.name.includes("Allison") ||
        voice.name.includes("Susan")
      )
    ) || voices.find(
      // Fallback to any US English voice
      (voice) => voice.lang === "en-US"
    )
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    utterance.lang = "en-US"
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    
    synthRef.current.speak(utterance)
  }, [voiceEnabled])

  const handleSubmitAnswer = useCallback(() => {
    // Stop listening if active
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    
    setAnswer((currentAnswer) => {
      const finalAnswer = (currentAnswer + " " + interimTranscript).trim()
      if (!finalAnswer) return currentAnswer

      const feedback = generateFeedback(finalAnswer, currentQuestion)
      const result: QuestionResult = {
        question: currentQuestion,
        answer: finalAnswer,
        score: feedback.score,
        feedback: {
          good: feedback.good,
          improve: feedback.improve,
          suggestion: feedback.suggestion,
        },
      }

      setCurrentFeedback(result)
      setPhase("feedback")
      setInterimTranscript("")
      
      // Speak the feedback
      setTimeout(() => {
        const feedbackText = `You scored ${feedback.score} out of 10. ${feedback.good} ${feedback.improve}`
        speakText(feedbackText)
      }, 500)
      
      return finalAnswer
    })
  }, [currentQuestion, interimTranscript, isListening, speakText])

  // Timer logic
  useEffect(() => {
    if (phase !== "answering") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitAnswer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, handleSubmitAnswer])

  const handleQuestionDisplayed = useCallback(() => {
    // Speak the question first, then start the answering phase
    if (voiceEnabled && speechSupported) {
      speakText(currentQuestion, () => {
        setPhase("answering")
        setTimeLeft(120)
      })
    } else {
      setTimeout(() => {
        setPhase("answering")
        setTimeLeft(120)
      }, 2000)
    }
  }, [currentQuestion, voiceEnabled, speechSupported, speakText])

  useEffect(() => {
    if (phase === "asking") {
      handleQuestionDisplayed()
    }
  }, [phase, handleQuestionDisplayed])

  const handleNextQuestion = () => {
    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    
    if (currentFeedback) {
      const newResults = [...results, currentFeedback]
      setResults(newResults)

      if (currentQuestionIndex >= questions.length - 1) {
        onComplete(newResults)
        return
      }
    }

    setPhase("transitioning")
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1)
      setAnswer("")
      setCurrentFeedback(null)
      setPhase("asking")
    }, 500)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        // Recognition might already be running
        setIsListening(false)
      }
    }
  }

  const toggleVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsSpeaking(false)
    setVoiceEnabled(!voiceEnabled)
  }

  const getAvatarExpression = () => {
    if (phase === "asking") return "neutral"
    if (phase === "answering") return "nodding"
    if (phase === "feedback") {
      if (currentFeedback && currentFeedback.score >= 7) return "happy"
      if (currentFeedback && currentFeedback.score >= 5) return "encouraging"
      return "encouraging"
    }
    return "neutral"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleExitClick = () => {
    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    // Stop listening
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    setShowExitDialog(true)
  }

  const handleConfirmExit = () => {
    setShowExitDialog(false)
    onExit()
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Exit Dialog */}
      <ExitDialog
        isOpen={showExitDialog}
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitDialog(false)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="InterviewPrep AI"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitClick}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            title="Exit interview"
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Interview Session</h2>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Voice Toggle */}
          {speechSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={`rounded-full ${voiceEnabled ? "text-primary" : "text-muted-foreground"}`}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          )}
          
          {phase === "answering" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                timeLeft <= 30 ? "bg-destructive/20 text-destructive" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <Progress value={progress} className="h-2" />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-1/3 flex flex-col items-center"
        >
          <div className="relative w-32 h-40 lg:w-48 lg:h-60 mb-4">
            <InterviewAvatar
              expression={getAvatarExpression()}
              speaking={phase === "asking" || isSpeaking}
              className="w-full h-full"
            />
            {/* Speaking indicator */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
          <p className="text-sm font-medium text-foreground">Alex — AI Interviewer</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`bubble-${currentQuestionIndex}-${phase}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mt-4"
            >
              {phase === "asking" && (
                <SpeechBubble text={currentQuestion} typing />
              )}
              {phase === "answering" && (
                <SpeechBubble text={currentQuestion} />
              )}
              {phase === "feedback" && currentFeedback && (
                <SpeechBubble text={`Score: ${currentFeedback.score}/10`}>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-[oklch(0.7_0.18_145)]">What was good:</p>
                      <p className="text-muted-foreground">{currentFeedback.feedback.good}</p>
                    </div>
                    <div>
                      <p className="font-medium text-[oklch(0.75_0.15_60)]">To improve:</p>
                      <p className="text-muted-foreground">{currentFeedback.feedback.improve}</p>
                    </div>
                    <div>
                      <p className="font-medium text-primary">Suggestion:</p>
                      <p className="text-muted-foreground">{currentFeedback.feedback.suggestion}</p>
                    </div>
                  </div>
                </SpeechBubble>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Answer Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-2/3 flex flex-col"
        >
          <div className="flex-1 bg-card border border-border rounded-2xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {config.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{config.name}</p>
                  <p className="text-xs text-muted-foreground">{config.role}</p>
                </div>
              </div>
              
              {/* Listening indicator */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/20"
                >
                  <motion.div
                    className="w-2 h-2 bg-destructive rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-sm text-destructive font-medium">Listening...</span>
                </motion.div>
              )}
            </div>

            {phase === "feedback" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-secondary/50 rounded-xl"
              >
                <p className="text-foreground whitespace-pre-wrap">{answer}</p>
              </motion.div>
            ) : (
              <div className="relative">
                <Textarea
                  value={answer + (interimTranscript ? " " + interimTranscript : "")}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={isListening ? "Speak your answer..." : "Type or speak your answer..."}
                  className="min-h-[200px] lg:min-h-[300px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground pr-4"
                  disabled={phase !== "answering"}
                />
                {interimTranscript && (
                  <span className="absolute bottom-4 left-4 text-muted-foreground/50 italic">
                    {interimTranscript}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-between items-center">
            {/* Microphone Button */}
            <div>
              {recognitionSupported && phase === "answering" && (
                <Button
                  variant={isListening ? "destructive" : "secondary"}
                  size="lg"
                  onClick={toggleListening}
                  className={`rounded-full w-14 h-14 p-0 ${
                    isListening 
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              {phase === "answering" && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() && !interimTranscript.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              )}
              {phase === "feedback" && (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {currentQuestionIndex >= questions.length - 1 ? "View Results" : "Next Question"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Voice hint */}
          {recognitionSupported && phase === "answering" && !isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-muted-foreground mt-3"
            >
              Click the microphone to speak your answer
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
