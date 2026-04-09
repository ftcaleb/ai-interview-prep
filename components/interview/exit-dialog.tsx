"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ExitDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ExitDialog({ isOpen, onConfirm, onCancel }: ExitDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Exit Interview?</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your progress will be lost. Are you sure you want to exit this interview session?
                </p>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 border-border text-foreground hover:bg-secondary"
                  >
                    Continue
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
