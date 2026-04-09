"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LandingPage, type InterviewType, type DifficultyLevel } from "@/components/interview/landing-page"
import { InterviewSession, type QuestionResult } from "@/components/interview/interview-session"
import { ResultsPage } from "@/components/interview/results-page"
import { ReportsHistory, type InterviewReport } from "@/components/interview/reports-history"

type AppScreen = "landing" | "interview" | "results" | "reports"

interface InterviewConfig {
  name: string
  role: string
  type: InterviewType
  difficulty: DifficultyLevel
}

// Local storage key for reports
const REPORTS_STORAGE_KEY = "interview-prep-reports"

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function loadReports(): InterviewReport[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveReports(reports: InterviewReport[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports))
  } catch {
    // Silently fail if storage is full
  }
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("landing")
  const [config, setConfig] = useState<InterviewConfig | null>(null)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [reports, setReports] = useState<InterviewReport[]>([])
  const [selectedReport, setSelectedReport] = useState<InterviewReport | null>(null)

  // Load reports from localStorage on mount
  useEffect(() => {
    setReports(loadReports())
  }, [])

  const handleStartInterview = (interviewConfig: InterviewConfig) => {
    setConfig(interviewConfig)
    setScreen("interview")
  }

  const handleInterviewComplete = (interviewResults: QuestionResult[]) => {
    setResults(interviewResults)
    
    // Save report
    if (config) {
      const averageScore = interviewResults.reduce((acc, r) => acc + r.score, 0) / interviewResults.length
      const newReport: InterviewReport = {
        id: generateId(),
        date: new Date().toISOString(),
        config,
        results: interviewResults,
        averageScore,
      }
      const updatedReports = [newReport, ...reports]
      setReports(updatedReports)
      saveReports(updatedReports)
    }
    
    setScreen("results")
  }

  const handleTryAgain = () => {
    setResults([])
    setScreen("interview")
  }

  const handleChangeType = () => {
    setConfig(null)
    setResults([])
    setSelectedReport(null)
    setScreen("landing")
  }

  const handleExitInterview = () => {
    setConfig(null)
    setResults([])
    setScreen("landing")
  }

  const handleViewReports = () => {
    setScreen("reports")
  }

  const handleViewReport = (report: InterviewReport) => {
    setSelectedReport(report)
    setConfig(report.config)
    setResults(report.results)
    setScreen("results")
  }

  const handleDeleteReport = (id: string) => {
    const updatedReports = reports.filter((r) => r.id !== id)
    setReports(updatedReports)
    saveReports(updatedReports)
  }

  const handleBackFromReports = () => {
    setScreen("landing")
  }

  return (
    <main className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage 
              onStart={handleStartInterview} 
              onViewReports={handleViewReports}
              reportsCount={reports.length}
            />
          </motion.div>
        )}

        {screen === "interview" && config && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <InterviewSession 
              config={config} 
              onComplete={handleInterviewComplete}
              onExit={handleExitInterview}
            />
          </motion.div>
        )}

        {screen === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsPage
              results={results}
              onTryAgain={selectedReport ? undefined : handleTryAgain}
              onChangeType={handleChangeType}
            />
          </motion.div>
        )}

        {screen === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReportsHistory
              reports={reports}
              onBack={handleBackFromReports}
              onViewReport={handleViewReport}
              onDeleteReport={handleDeleteReport}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
