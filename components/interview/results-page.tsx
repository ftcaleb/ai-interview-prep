"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewAvatar } from "./avatar"
import { SpeechBubble } from "./speech-bubble"
import { RefreshCw, Settings2, TrendingUp, TrendingDown } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import type { QuestionResult } from "./interview-session"

interface ResultsPageProps {
  results: QuestionResult[]
  onTryAgain?: () => void
  onChangeType: () => void
}

function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([])

  useEffect(() => {
    const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899"]
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            opacity: [1, 1, 0],
            rotate: 360,
          }}
          transition={{
            duration: 3,
            delay: particle.delay,
            ease: "linear",
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  )
}

function CircularProgress({ value, size = 160 }: { value: number; size?: number }) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 10) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={value >= 7 ? "var(--success)" : value >= 5 ? "var(--warning)" : "var(--destructive)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-foreground"
        >
          {value.toFixed(1)}
        </motion.span>
        <span className="text-sm text-muted-foreground">out of 10</span>
      </div>
    </div>
  )
}

export function ResultsPage({ results, onTryAgain, onChangeType }: ResultsPageProps) {
  const averageScore = results.reduce((acc, r) => acc + r.score, 0) / results.length
  const showConfetti = averageScore >= 8

  // Analyze strengths and areas to improve
  const strengths = results.filter(r => r.score >= 7).map(r => r.feedback.good)
  const improvements = results.filter(r => r.score < 7).map(r => r.feedback.improve)

  const getCongratMessage = () => {
    if (averageScore >= 8) return "Excellent performance! You're interview-ready!"
    if (averageScore >= 6) return "Great effort! A few more practice sessions and you'll be ready."
    return "Good start! Keep practicing to build your confidence."
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="InterviewPrep AI"
            width={250}
            height={250}
            className="h-32 w-auto"
          />
        </div>

        {/* Header with Avatar */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-32"
          >
            <InterviewAvatar
              expression={averageScore >= 7 ? "happy" : "encouraging"}
              className="w-full h-full"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <SpeechBubble text={getCongratMessage()} />
          </motion.div>
        </div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Card className="bg-card border-border">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <CircularProgress value={averageScore} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Strengths and Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.slice(0, 3).map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-success mt-1">•</span>
                      {strength}
                    </motion.li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">Keep practicing to build your strengths!</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-warning" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {improvements.length > 0 ? (
                  improvements.slice(0, 3).map((improvement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-warning mt-1">•</span>
                      {improvement}
                    </motion.li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">Great job! Keep up the excellent work.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground">Question Breakdown</h2>
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                          Q{index + 1}: {result.question}
                        </p>
                        <p className="text-xs text-muted-foreground">{result.feedback.good}</p>
                      </div>
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        result.score >= 7 
                          ? "bg-success/20 text-success" 
                          : result.score >= 5 
                            ? "bg-warning/20 text-warning" 
                            : "bg-destructive/20 text-destructive"
                      }`}>
                        {result.score}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          {onTryAgain && (
            <Button
              onClick={onTryAgain}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button
            onClick={onChangeType}
            variant={onTryAgain ? "outline" : "default"}
            className={onTryAgain 
              ? "flex-1 border-border text-foreground hover:bg-secondary"
              : "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            }
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {onTryAgain ? "Change Interview Type" : "Back to Home"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
