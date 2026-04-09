"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Trash2, ChevronRight, FileText } from "lucide-react"
import Image from "next/image"
import type { InterviewType, DifficultyLevel } from "./landing-page"
import type { QuestionResult } from "./interview-session"

export interface InterviewReport {
  id: string
  date: string
  config: {
    name: string
    role: string
    type: InterviewType
    difficulty: DifficultyLevel
  }
  results: QuestionResult[]
  averageScore: number
}

interface ReportsHistoryProps {
  reports: InterviewReport[]
  onBack: () => void
  onViewReport: (report: InterviewReport) => void
  onDeleteReport: (id: string) => void
}

function getTypeLabel(type: InterviewType): string {
  switch (type) {
    case "technical":
      return "Technical"
    case "behavioural":
      return "Behavioural"
    case "general":
      return "General"
  }
}

function getDifficultyLabel(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "junior":
      return "Junior"
    case "mid":
      return "Mid-Level"
    case "senior":
      return "Senior"
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-success"
  if (score >= 5) return "text-warning"
  return "text-destructive"
}

function getScoreBg(score: number): string {
  if (score >= 7) return "bg-success/20"
  if (score >= 5) return "bg-warning/20"
  return "bg-destructive/20"
}

export function ReportsHistory({ reports, onBack, onViewReport, onDeleteReport }: ReportsHistoryProps) {
  return (
    <div className="min-h-screen p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Top Bar with Logo */}
        <div className="flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="InterviewPrep AI"
            width={250}
            height={250}
            className="h-32 w-auto pl-4"
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Reports</h1>
            <p className="text-sm text-muted-foreground">Review your past interview practice sessions</p>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No Reports Yet</h2>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Complete your first interview practice session to see your reports here.
            </p>
            <Button onClick={onBack} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Practicing
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => onViewReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Score Badge */}
                      <div
                        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${getScoreBg(report.averageScore)}`}
                      >
                        <span className={`text-xl font-bold ${getScoreColor(report.averageScore)}`}>
                          {report.averageScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/10</span>
                      </div>

                      {/* Report Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {getTypeLabel(report.config.type)} Interview
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {getDifficultyLabel(report.config.difficulty)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{report.config.role}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(report.date)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.results.length} questions
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteReport(report.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
