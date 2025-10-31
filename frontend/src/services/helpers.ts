// detectionHelpers.ts
// Helper functions for SignDetect dashboard (no live camera)

export interface DetectionResult {
  sign: string
  confidence: number
  timestamp: Date
}

export interface SessionData {
  id: string
  startTime: Date
  endTime?: Date
  predictions: DetectionResult[]
  averageConfidence: number
  totalSigns: number
}

/**
 * Format duration from milliseconds to readable string
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
}

/**
 * Calculate average confidence from predictions
 */
export const calculateAverageConfidence = (predictions: DetectionResult[]): number => {
  if (predictions.length === 0) return 0
  const sum = predictions.reduce((acc, pred) => acc + pred.confidence, 0)
  return Math.round((sum / predictions.length) * 10) / 10
}

/**
 * Group predictions by sign
 */
export const groupPredictionsBySign = (predictions: DetectionResult[]): Record<string, DetectionResult[]> => {
  return predictions.reduce((acc, pred) => {
    if (!acc[pred.sign]) acc[pred.sign] = []
    acc[pred.sign].push(pred)
    return acc
  }, {} as Record<string, DetectionResult[]>)
}

/**
 * Get most frequent signs from predictions
 */
export const getMostFrequentSigns = (
  predictions: DetectionResult[],
  limit = 10,
): Array<{ sign: string; count: number; avgConfidence: number }> => {
  const grouped = groupPredictionsBySign(predictions)
  return Object.entries(grouped)
    .map(([sign, preds]) => ({
      sign,
      count: preds.length,
      avgConfidence: calculateAverageConfidence(preds),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Generate session summary statistics
 */
export const generateSessionSummary = (session: SessionData) => {
  const duration = session.endTime
    ? session.endTime.getTime() - session.startTime.getTime()
    : Date.now() - session.startTime.getTime()

  const uniqueSigns = new Set(session.predictions.map((p) => p.sign)).size
  const mostFrequent = getMostFrequentSigns(session.predictions, 5)

  return {
    duration: formatDuration(duration),
    totalPredictions: session.predictions.length,
    uniqueSigns,
    averageConfidence: session.averageConfidence,
    mostFrequentSigns: mostFrequent,
    predictionsPerMinute: Math.round((session.predictions.length / (duration / 60000)) * 10) / 10,
  }
}

/**
 * Local storage helpers
 */
export const saveSessionToStorage = (session: SessionData): void => {
  try {
    const sessions = getSessionsFromStorage()
    sessions.push(session)
    localStorage.setItem("sign_detection_sessions", JSON.stringify(sessions))
  } catch (error) {
    console.error("Failed to save session to storage:", error)
  }
}

export const getSessionsFromStorage = (): SessionData[] => {
  try {
    const stored = localStorage.getItem("sign_detection_sessions")
    if (!stored) return []

    const sessions = JSON.parse(stored)
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      predictions: session.predictions.map((pred: any) => ({
        ...pred,
        timestamp: new Date(pred.timestamp),
      })),
    }))
  } catch (error) {
    console.error("Failed to load sessions from storage:", error)
    return []
  }
}

export const clearSessionsFromStorage = (): void => {
  try {
    localStorage.removeItem("sign_detection_sessions")
  } catch (error) {
    console.error("Failed to clear sessions from storage:", error)
  }
}
