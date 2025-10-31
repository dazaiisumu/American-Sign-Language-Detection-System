"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PredictionDisplay, { Prediction } from "@/components/PredictionDisplay";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import {
  startDetectionSession,
  getLatestPrediction,
  endDetectionSession,
} from "@/api/detectionApi";

import type { StartSessionResponse } from "@/api/detectionApi";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null); // <-- corrected type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Start a new detection session
  const startSession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await startDetectionSession();
      if (response.success && response.data) {
        setSessionActive(true);
        setPredictions([]);
        // Capture numeric sessionId returned from backend
        setSessionId((response.data as StartSessionResponse).sessionId ?? null);
      } else {
        setError(response.error || "Failed to start session");
      }
    } catch (err) {
      console.error(err);
      setError("Error starting session");
    } finally {
      setLoading(false);
    }
  }, []);

  // Stop the detection session
  const stopSession = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await endDetectionSession();
      if (response.success) {
        setSessionActive(false);
        setPredictions([]);
        setSessionId(null);
      } else {
        setError(response.error || "Failed to stop session");
      }
    } catch (err) {
      console.error(err);
      setError("Error stopping session");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch latest predictions from backend
  const fetchPredictions = useCallback(async () => {
    if (!sessionActive) return;

    try {
      const response = await getLatestPrediction();
      if (response.success && response.data) {
        setPredictions([
          {
            sign: response.data.prediction ?? "Uncertain",
            confidence: response.data.confidence ?? 100,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch predictions", err);
    }
  }, [sessionActive]);

  // Poll predictions every 2 seconds when session is active
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(fetchPredictions, 2000);
    return () => clearInterval(interval);
  }, [sessionActive, fetchPredictions]);

  return (
    <ProtectedRoute>
      <Flex
        minH="100vh"
        flexDir="column"
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Navbar />

        <Box
          flex="1"
          maxW="7xl"
          mx="auto"
          w="full"
          px={{ base: 4, md: 8 }}
          py={{ base: 8, md: 12 }}
        >
          <VStack spacing={2} mb={8} alignItems="flex-start">
            <Heading as="h1" fontSize="3xl" fontWeight="bold" color="teal.500">
              Live Sign Detection
            </Heading>
            <Text fontSize="lg" color="gray.500">
              Real-time sign language detection. Predictions update automatically
              every few seconds.
            </Text>
          </VStack>

          <Flex mb={4} gap={4}>
            <Button
              onClick={startSession}
              colorScheme="green"
              isDisabled={sessionActive || loading}
            >
              Start Detection
            </Button>
            <Button
              onClick={stopSession}
              colorScheme="red"
              isDisabled={!sessionActive || loading}
            >
              Stop Detection
            </Button>
            {loading && <Spinner ml={4} />}
          </Flex>

          {error && <Text color="red.500">{error}</Text>}

          <PredictionDisplay predictions={predictions} />
        </Box>

        <Footer />
      </Flex>
    </ProtectedRoute>
  );
}
