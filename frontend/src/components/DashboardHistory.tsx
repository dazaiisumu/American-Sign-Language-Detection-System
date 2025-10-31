"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Badge,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { Activity, Calendar, Clock, TrendingUp, Filter, Download, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DetectionSession {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  accuracy: number;
  signsDetected: number;
  totalSigns: number;
  status: "completed" | "interrupted" | "processing";
  sessionType: "practice" | "assessment" | "live";
}

export default function DashboardHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DetectionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.id) return; // Wait until user is loaded
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/dashboard/user/${user.id}`, {
          method: "GET",
          credentials: "include", // ✅ important for session-based auth
        });

        if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.status}`);

        const data = await response.json();

        const mappedData: DetectionSession[] = data.map((s: any) => ({
          id: s.id,
          date: new Date(s.startTime).toLocaleDateString(),
          startTime: new Date(s.startTime).toLocaleTimeString(),
          duration: s.duration || "N/A",
          accuracy: s.averageConfidence || 0,
          signsDetected: s.totalPredictions || 0,
          totalSigns: s.uniqueSigns || 0,
          status: s.status,
          sessionType: s.sessionType,
        }));

        setSessions(mappedData);
      } catch (error) {
        console.error("API request failed for /dashboard/user/:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.date.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || session.status === filterStatus;
    const matchesType = filterType === "all" || session.sessionType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge colorScheme="green">Completed</Badge>;
      case "interrupted":
        return <Badge colorScheme="red">Interrupted</Badge>;
      case "processing":
        return <Badge colorScheme="yellow">Processing</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "practice":
        return <Badge colorScheme="blue">Practice</Badge>;
      case "assessment":
        return <Badge colorScheme="purple">Assessment</Badge>;
      case "live":
        return <Badge colorScheme="orange">Live</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "green.500";
    if (accuracy >= 90) return "yellow.500";
    return "red.500";
  };

  if (loading) return <Spinner size="xl" mt={10} />;

  return (
    <VStack spacing={6} align="stretch">
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <HStack spacing={3}>
              <Activity />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm">Total Sessions</Text>
                <Heading size="md">{sessions.length}</Heading>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack spacing={3}>
              <TrendingUp />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm">Avg. Accuracy</Text>
                <Heading size="md">
                  {sessions.length > 0
                    ? (sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length).toFixed(1)
                    : 0}
                  %
                </Heading>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack spacing={3}>
              <Clock />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm">Total Time</Text>
                <Heading size="md">23h 28m</Heading>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack spacing={3}>
              <Calendar />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm">Signs Detected</Text>
                <Heading size="md">{sessions.reduce((acc, s) => acc + s.signsDetected, 0)}</Heading>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card>
        <CardHeader>
          <HStack spacing={3}>
            <Filter />
            <Heading size="md">Filter Sessions</Heading>
          </HStack>
          <Text>Search and filter your detection history</Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Input placeholder="Search by ID or date..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="interrupted">Interrupted</option>
              <option value="processing">Processing</option>
            </Select>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="practice">Practice</option>
              <option value="assessment">Assessment</option>
              <option value="live">Live</option>
            </Select>
            <Button leftIcon={<Download />} variant="outline">
              Export Data
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Detection Sessions</Heading>
          <Text>
            Showing {filteredSessions.length} of {sessions.length} sessions
          </Text>
        </CardHeader>
        <CardBody>
          {filteredSessions.length === 0 ? (
            <Text>No sessions found matching your criteria.</Text>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Session ID</Th>
                  <Th>Date & Time</Th>
                  <Th>Duration</Th>
                  <Th>Type</Th>
                  <Th>Signs Detected</Th>
                  <Th>Accuracy</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSessions.map((session) => (
                  <Tr key={session.id}>
                    <Td fontWeight="medium">{session.id}</Td>
                    <Td>
                      <Text fontWeight="medium">{session.date}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {session.startTime}
                      </Text>
                    </Td>
                    <Td>{session.duration}</Td>
                    <Td>{getTypeBadge(session.sessionType)}</Td>
                    <Td>
                      {session.signsDetected}/{session.totalSigns}
                    </Td>
                    <Td color={getAccuracyColor(session.accuracy)} fontWeight="semibold">
                      {session.accuracy}%
                    </Td>
                    <Td>{getStatusBadge(session.status)}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="outline" leftIcon={<Play />}>
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          Details
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
