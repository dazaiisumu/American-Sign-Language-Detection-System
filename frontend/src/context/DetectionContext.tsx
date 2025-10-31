"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type {
  StartSessionResponse,
  EndSessionResponse,
  SessionHistoryResponse,
} from "@/api/detectionApi"
import {
  startDetectionSession,
  endDetectionSession,
  getSessionHistory,
} from "@/api/detectionApi"

interface Prediction {
  sign: string
  confidence: number
}

interface DetectionSession {
  id: number
  sessionType: "practice" | "assessment" | "live"
  startTime: string
  predictions: Prediction[]
  status: "active" | "ended"
}

interface DetectionContextType {
  currentSession: DetectionSession | null
  sessionHistory: DetectionSession[]
  startSession: (sessionType: "practice" | "assessment" | "live") => Promise<boolean>
  endSession: () => Promise<void>
  loadSessionHistory: () => Promise<void>
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined)

export const useDetection = () => {
  const context = useContext(DetectionContext)
  if (!context) {
    throw new Error("useDetection must be used within a DetectionProvider")
  }
  return context
}

interface DetectionProviderProps {
  children: ReactNode
}

export const DetectionProvider: React.FC<DetectionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<DetectionSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<DetectionSession[]>([])

  // Start a new session
  const startSession = async (sessionType: "practice" | "assessment" | "live"): Promise<boolean> => {
    try {
      const response = await startDetectionSession()
      if (response.success && response.data) {
        setCurrentSession({
          id: response.data.sessionId,
          sessionType,
          startTime: response.data.startTime,
          predictions: [],
          status: "active",
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to start session:", error)
      return false
    }
  }

  // End the current session
  const endSession = async () => {
    if (!currentSession) return
    try {
      const response = await endDetectionSession()
      if (response.success && response.data) {
        setCurrentSession(prev =>
          prev ? { ...prev, status: "ended" } : prev
        )
        await loadSessionHistory()
      }
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  // Load session history
  const loadSessionHistory = async () => {
    try {
      const response = await getSessionHistory(1, 50) // fetch first page with 50 sessions
      if (response.success && response.data) {
        const sessions: DetectionSession[] = response.data.sessions.map(s => ({
          id: s.id,
          sessionType: "practice", // or map according to your backend if you have sessionType
          startTime: s.startTime,
          predictions: [], // predictions are fetched separately if needed
          status: "ended", // assume history sessions are ended
        }))
        setSessionHistory(sessions)
      }
    } catch (error) {
      console.error("Failed to load session history:", error)
    }
  }

  const value: DetectionContextType = {
    currentSession,
    sessionHistory,
    startSession,
    endSession,
    loadSessionHistory,
  }

  return <DetectionContext.Provider value={value}>{children}</DetectionContext.Provider>
}
