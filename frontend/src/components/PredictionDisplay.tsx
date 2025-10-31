"use client";

import { Box, Badge, Text, VStack, Heading, Flex } from "@chakra-ui/react";
import React from "react";

// Shared Prediction type
export interface Prediction {
  sign: string; // always a string
  confidence: number;
}

interface PredictionDisplayProps {
  predictions: Prediction[];
}

export default function PredictionDisplay({ predictions }: PredictionDisplayProps) {
  // Get badge color based on confidence value
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "green";
    if (confidence >= 70) return "yellow";
    return "red";
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" shadow="sm">
      <Heading size="md" mb={4}>
        Live Predictions
      </Heading>

      {predictions.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={4}>
          No predictions yet
        </Text>
      ) : (
        <VStack spacing={2} align="stretch">
          {predictions.map((prediction, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              p={2}
              borderWidth="1px"
              borderRadius="md"
            >
              <Text fontWeight="medium">{prediction.sign}</Text>
              <Badge colorScheme={getConfidenceColor(prediction.confidence)}>
                {prediction.confidence.toFixed(1)}%
              </Badge>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}
