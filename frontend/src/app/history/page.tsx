"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionHistory, SessionHistoryItem } from "@/api/detectionApi";
import { Box, Flex, Text, Badge, Spinner, Button, Stack } from "@chakra-ui/react";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchHistory = async (pageNumber: number = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await getSessionHistory(pageNumber, limit);

      if (response.success && response.data) {
        setSessions(response.data.sessions || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setSessions([]);
        setError(response.error || "Failed to load history");
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setSessions([]);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Detection History</h1>
            <p className="text-gray-600">
              Review and analyze your past sign language detection sessions.
            </p>
          </div>

          {loading ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : sessions.length === 0 ? (
            <Text>No sessions found.</Text>
          ) : (
            <Stack spacing={4}>
              {sessions.map((session) => {
                const duration = session.duration ?? 0;
                const avgConfidence = session.averageConfidence ?? 0;

                return (
                  <Flex
                    key={session.id}
                    justify="space-between"
                    align="center"
                    p={4}
                    bg="white"
                    borderRadius="md"
                    shadow="sm"
                  >
                    <Box>
                      <Text fontWeight="bold">{session.userName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(session.startTime).toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Duration: {Math.floor(duration / 60)} min {duration % 60} sec
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="sm" fontWeight="medium">
                        {session.totalPredictions ?? 0} predictions
                      </Text>
                      <Badge colorScheme={avgConfidence >= 95 ? "green" : "yellow"}>
                        {avgConfidence.toFixed(1)}% accuracy
                      </Badge>
                    </Box>
                  </Flex>
                );
              })}
            </Stack>
          )}

          {sessions.length > 0 && totalPages > 1 && (
            <Flex justify="center" mt={6} gap={2}>
              <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                Previous
              </Button>
              <Text alignSelf="center">
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </Flex>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
