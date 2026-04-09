"use client"

import { motion } from "framer-motion"

type AvatarExpression = "neutral" | "thinking" | "happy" | "encouraging" | "nodding"

interface InterviewAvatarProps {
  expression?: AvatarExpression
  speaking?: boolean
  className?: string
}

export function InterviewAvatar({ 
  expression = "neutral", 
  speaking = false,
  className = "" 
}: InterviewAvatarProps) {
  const getEyeAnimation = () => {
    if (expression === "thinking") {
      return { y: [-1, 1, -1], transition: { duration: 2, repeat: Infinity } }
    }
    return {}
  }

  const getMouthPath = () => {
    switch (expression) {
      case "happy":
        return "M 35 52 Q 50 62 65 52"
      case "encouraging":
        return "M 38 52 Q 50 58 62 52"
      case "thinking":
        return "M 40 54 Q 50 52 60 54"
      default:
        return "M 38 52 Q 50 56 62 52"
    }
  }

  const getHeadAnimation = () => {
    if (expression === "nodding") {
      return {
        rotate: [0, 3, -3, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }
    }
    return {
      rotate: [0, 1, -1, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <motion.svg
        viewBox="0 0 100 120"
        className="w-full h-full"
        animate={getHeadAnimation()}
      >
        {/* Background glow */}
        <defs>
          <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4A574" />
            <stop offset="100%" stopColor="#C49A6C" />
          </linearGradient>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A3728" />
            <stop offset="100%" stopColor="#3A2718" />
          </linearGradient>
          <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="100%" stopColor="#1A202C" />
          </linearGradient>
          <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E0" />
          </linearGradient>
        </defs>

        {/* Glow effect */}
        <circle cx="50" cy="50" r="45" fill="url(#avatarGlow)" />

        {/* Body/Blazer */}
        <path
          d="M 25 95 Q 25 80 35 75 L 50 72 L 65 75 Q 75 80 75 95 L 75 120 L 25 120 Z"
          fill="url(#blazerGradient)"
        />

        {/* Shirt collar */}
        <path
          d="M 42 75 L 50 82 L 58 75 L 55 72 L 50 76 L 45 72 Z"
          fill="url(#shirtGradient)"
        />

        {/* Neck */}
        <ellipse cx="50" cy="70" rx="8" ry="6" fill="url(#skinGradient)" />

        {/* Head */}
        <ellipse cx="50" cy="45" rx="28" ry="30" fill="url(#skinGradient)" />

        {/* Hair */}
        <path
          d="M 22 40 Q 22 15 50 15 Q 78 15 78 40 Q 78 30 70 25 Q 60 20 50 20 Q 40 20 30 25 Q 22 30 22 40 Z"
          fill="url(#hairGradient)"
        />

        {/* Side hair */}
        <path d="M 22 40 Q 20 50 24 55 Q 22 48 24 42 Z" fill="url(#hairGradient)" />
        <path d="M 78 40 Q 80 50 76 55 Q 78 48 76 42 Z" fill="url(#hairGradient)" />

        {/* Ears */}
        <ellipse cx="22" cy="48" rx="4" ry="6" fill="url(#skinGradient)" />
        <ellipse cx="78" cy="48" rx="4" ry="6" fill="url(#skinGradient)" />

        {/* Eyebrows */}
        <motion.path
          d="M 33 34 Q 38 32 43 34"
          stroke="#4A3728"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          animate={expression === "thinking" ? { d: "M 33 32 Q 38 30 43 32" } : {}}
        />
        <motion.path
          d="M 57 34 Q 62 32 67 34"
          stroke="#4A3728"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          animate={expression === "thinking" ? { d: "M 57 32 Q 62 30 67 32" } : {}}
        />

        {/* Eyes */}
        <g>
          <motion.g animate={getEyeAnimation()}>
            {/* Left eye */}
            <ellipse cx="38" cy="42" rx="5" ry="4" fill="white" />
            <motion.circle
              cx="38"
              cy="42"
              r="2.5"
              fill="#2D3748"
              animate={expression === "thinking" ? { cx: 40 } : { cx: 38 }}
            />
            <circle cx="37" cy="41" r="1" fill="white" />

            {/* Right eye */}
            <ellipse cx="62" cy="42" rx="5" ry="4" fill="white" />
            <motion.circle
              cx="62"
              cy="42"
              r="2.5"
              fill="#2D3748"
              animate={expression === "thinking" ? { cx: 64 } : { cx: 62 }}
            />
            <circle cx="61" cy="41" r="1" fill="white" />
          </motion.g>

          {/* Blinking animation */}
          <motion.rect
            x="32"
            y="38"
            width="12"
            height="8"
            fill="url(#skinGradient)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
            style={{ transformOrigin: "center" }}
          />
          <motion.rect
            x="56"
            y="38"
            width="12"
            height="8"
            fill="url(#skinGradient)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
            style={{ transformOrigin: "center" }}
          />
        </g>

        {/* Nose */}
        <path
          d="M 50 44 L 48 50 Q 50 52 52 50 L 50 44"
          fill="#C49A6C"
          opacity="0.6"
        />

        {/* Mouth */}
        <motion.path
          d={getMouthPath()}
          stroke="#8B5A5A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={speaking ? {
            d: [getMouthPath(), "M 40 52 Q 50 60 60 52", getMouthPath()],
          } : {}}
          transition={speaking ? { duration: 0.3, repeat: Infinity } : {}}
        />

        {/* Cheeks (for happy/encouraging) */}
        {(expression === "happy" || expression === "encouraging") && (
          <>
            <circle cx="30" cy="50" r="4" fill="#E8B4B4" opacity="0.4" />
            <circle cx="70" cy="50" r="4" fill="#E8B4B4" opacity="0.4" />
          </>
        )}
      </motion.svg>
    </div>
  )
}
