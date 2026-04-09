"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface SpeechBubbleProps {
  text: string
  typing?: boolean
  children?: React.ReactNode
  className?: string
}

export function SpeechBubble({ text, typing = false, children, className = "" }: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    if (!typing) {
      setDisplayedText(text)
      setIsTypingComplete(true)
      return
    }

    setDisplayedText("")
    setIsTypingComplete(false)
    let index = 0

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsTypingComplete(true)
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [text, typing])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-card border border-border rounded-2xl rounded-bl-sm p-4 shadow-lg ${className}`}
    >
      {/* Tail */}
      <div className="absolute -left-2 bottom-4 w-4 h-4 bg-card border-l border-b border-border transform rotate-45" />
      
      <div className="relative z-10">
        <p className="text-foreground leading-relaxed">
          {displayedText}
          {typing && !isTypingComplete && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
            />
          )}
        </p>
        {isTypingComplete && children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
