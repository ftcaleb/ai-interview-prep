"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, MessageSquare, Briefcase, FileText } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export type InterviewType = "technical" | "behavioural" | "general"
export type DifficultyLevel = "junior" | "mid" | "senior"

interface LandingPageProps {
  onStart: (config: {
    name: string
    role: string
    type: InterviewType
    difficulty: DifficultyLevel
  }) => void
  onViewReports: () => void
  reportsCount: number
}

const interviewTypes = [
  {
    id: "technical" as const,
    title: "Technical",
    description: "Coding problems, system design, and technical concepts",
    icon: Code2,
  },
  {
    id: "behavioural" as const,
    title: "Behavioural",
    description: "Situational questions about past experiences",
    icon: MessageSquare,
  },
  {
    id: "general" as const,
    title: "General",
    description: "Common interview questions and professional scenarios",
    icon: Briefcase,
  },
]

const difficultyLevels = [
  { id: "junior" as const, label: "Junior" },
  { id: "mid" as const, label: "Mid" },
  { id: "senior" as const, label: "Senior" },
]

export function LandingPage({ onStart, onViewReports, reportsCount }: LandingPageProps) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("mid")

  const canStart = name.trim() && role.trim() && selectedType

  const handleStart = () => {
    if (canStart) {
      onStart({
        name: name.trim(),
        role: role.trim(),
        type: selectedType,
        difficulty,
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Top Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <Image
          src="/logo.png"
          alt="InterviewPrep AI"
          width={250}
          height={250}
          className="h-32 w-auto pl-6"
        />
        <Button
          variant="outline"
          onClick={onViewReports}
          className="group relative rounded-full border border-border/50 bg-background/50 backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 px-6"
        >
          <FileText className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">My Reports</span>
          {reportsCount > 0 && (
            <span className="ml-3 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-bold rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/40 transition-all duration-300">
              {reportsCount}
            </span>
          )}
        </Button>
      </motion.div>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              InterviewPrep AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Practice smarter. Interview better.
            </motion.p>
          </div>

          {/* Interview Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground">Select Interview Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    className={`h-full cursor-pointer flex flex-col transition-all duration-200 hover:border-primary/50 ${selectedType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                      }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${selectedType === type.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }`}>
                        <type.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">{type.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Your Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-foreground">
                  Role You&apos;re Preparing For
                </label>
                <Input
                  id="role"
                  placeholder="e.g. Junior Frontend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </motion.div>

          {/* Difficulty Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground">Difficulty Level</h2>
            <div className="flex gap-3">
              {difficultyLevels.map((level) => (
                <Button
                  key={level.id}
                  variant={difficulty === level.id ? "default" : "outline"}
                  onClick={() => setDifficulty(level.id)}
                  className={`flex-1 ${difficulty === level.id
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-secondary"
                    }`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              Start Interview
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
