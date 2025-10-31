"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Box, Flex, Grid, Heading, Text, Button, Badge, Progress, Stack, Spinner, Link as ChakraLink
} from "@chakra-ui/react";
import { Activity, Clock, TrendingUp, Users, Play, TimerIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { getSessionHistory, getTotalUsers, SessionHistoryResponse } from "@/api/detectionApi";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionHistoryResponse["sessions"]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [totalSessionsFromBackend, setTotalSessionsFromBackend] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch session history
        const res = await getSessionHistory(1, 10);
        if (res.success && res.data) {
          setSessions(res.data.sessions);
          setTotalSessionsFromBackend(res.data.totalSessions ?? res.data.sessions.length);
        }

        // Fetch total users
        const usersRes = await getTotalUsers();
        if (usersRes.success && usersRes.data) {
          setTotalUsers(usersRes.data.totalUsers);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute stats
  const stats = {
    totalSessions: totalSessionsFromBackend,
    accuracyRate: sessions.length
      ? sessions.reduce((sum, s) => sum + (s.averageConfidence || 0), 0) / sessions.length
      : 0,
    detectedSigns: sessions.reduce((sum, s) => sum + (s.totalPredictions || 0), 0),
    totalUsers,
  };

  return (
    <ProtectedRoute>
      <Flex direction="column" minH="100vh" bg="gray.50">
        <Navbar />

        <Box flex="1" maxW="7xl" mx="auto" w="full" px={4} py={8}>
          <Box mb={8}>
            <Heading size="xl" mb={2}>Welcome to your Dashboard</Heading>
            <Text color="gray.600">Monitor your sign language detection sessions and track your progress over time.</Text>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={8}>
            <ChakraLink as={Link} href="/predictions" _hover={{ textDecor: "none" }}>
              <Box p={6} bg="white" borderRadius="md" boxShadow="sm" _hover={{ shadow: "md" }}>
                <Flex align="center">
                  <Box bg="blue.100" p={3} borderRadius="md" mr={4}><Play size={24} color="#3182ce" /></Box>
                  <Box>
                    <Text fontWeight="semibold">Start Detection</Text>
                    <Text fontSize="sm" color="gray.500">Begin live sign detection</Text>
                  </Box>
                </Flex>
              </Box>
            </ChakraLink>

            <ChakraLink as={Link} href="/history" _hover={{ textDecor: "none" }}>
              <Box p={6} bg="white" borderRadius="md" boxShadow="sm" _hover={{ shadow: "md" }}>
                <Flex align="center">
                  <Box bg="teal.100" p={3} borderRadius="md" mr={4}><TimerIcon size={24} color="#319795" /></Box>
                  <Box>
                    <Text fontWeight="semibold">View History</Text>
                    <Text fontSize="sm" color="gray.500">Browse past sessions</Text>
                  </Box>
                </Flex>
              </Box>
            </ChakraLink>

            <ChakraLink as={Link} href="/settings" _hover={{ textDecor: "none" }}>
              <Box p={6} bg="white" borderRadius="md" boxShadow="sm" _hover={{ shadow: "md" }}>
                <Flex align="center">
                  <Box bg="gray.100" p={3} borderRadius="md" mr={4}><SettingsIcon size={24} color="#718096" /></Box>
                  <Box>
                    <Text fontWeight="semibold">Settings</Text>
                    <Text fontSize="sm" color="gray.500">Configure preferences</Text>
                  </Box>
                </Flex>
              </Box>
            </ChakraLink>
          </Grid>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Total Sessions</Text>
                <Activity size={16} color="#A0AEC0" />
              </Flex>
              <Text fontSize="2xl" fontWeight="bold">{stats.totalSessions}</Text>
            </Box>

            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Accuracy Rate</Text>
                <TrendingUp size={16} color="#A0AEC0" />
              </Flex>
              <Text fontSize="2xl" fontWeight="bold">{Math.round(stats.accuracyRate)}%</Text>
              <Progress value={stats.accuracyRate} size="sm" mt={2} />
            </Box>

            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Signs Detected</Text>
                <Clock size={16} color="#A0AEC0" />
              </Flex>
              <Text fontSize="2xl" fontWeight="bold">{stats.detectedSigns}</Text>
            </Box>

            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Total Users</Text>
                <Users size={16} color="#A0AEC0" />
              </Flex>
              <Text fontSize="2xl" fontWeight="bold">{stats.totalUsers}</Text>
            </Box>
          </Grid>

          <Box bg="white" borderRadius="md" shadow="sm" p={4}>
            <Text fontWeight="semibold" mb={2}>Recent Sessions</Text>
            {loading ? (
              <Flex justify="center" py={10}><Spinner size="lg" /></Flex>
            ) : (
              <Stack spacing={4}>
                {sessions.length > 0 ? sessions.map(session => (
                  <Flex key={session.id} justify="space-between" align="center" p={4} borderWidth="1px" borderRadius="md">
                    <Flex align="center" gap={4}>
                      <Box bg="blue.100" p={2} borderRadius="md"><Activity size={16} color="#3182ce" /></Box>
                      <Box>
                        {/* Display user name here */}
                       <Text fontWeight="medium">{session.userName}</Text>

                        <Text fontSize="sm" color="gray.500">{new Date(session.startTime).toLocaleDateString()}</Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={4}>
                      <Box textAlign="right">
                        <Text fontSize="sm" fontWeight="medium">{session.duration || "-"}</Text>
                        <Text fontSize="xs" color="gray.500">{session.totalPredictions ?? 0} signs</Text>
                      </Box>
                      <Badge colorScheme={session.averageConfidence >= 95 ? "green" : "yellow"}>
                        {Math.round(session.averageConfidence ?? 0)}% accuracy
                      </Badge>
                    </Flex>
                  </Flex>
                )) : (
                  <Text textAlign="center" py={10} color="gray.500">
                    No sessions found.
                  </Text>
                )}
              </Stack>
            )}
            <Flex justify="center" mt={6}>
              <Button as={Link} href="/history" variant="outline">View All Sessions</Button>
            </Flex>
          </Box>
        </Box>

        <Footer />
      </Flex>
    </ProtectedRoute>
  );
}
