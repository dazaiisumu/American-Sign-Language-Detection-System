"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  VStack,
  HStack,
  Container,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Activity, Shield, Zap, Users } from "lucide-react";
import Footer from "@/components/Footer";
import CountUp from "react-countup";

// Define an indexable type for statLabels to resolve the TypeScript error
const statLabels: { [key: string]: string } = {
  accuracyRate: "Accuracy Rate",
  activeUsers: "Active Users",
  signsDetected: "Signs Detected",
  uptime: "Uptime",
};

export default function LandingPage() {
  const [platformStats, setPlatformStats] = useState({
    accuracyRate: 0,
    activeUsers: 0,
    signsDetected: 0,
    uptime: 0,
  });

  const features = [
    {
      icon: Activity,
      title: "Real-time Detection",
      description:
        "AI-powered sign language recognition with instant feedback and high accuracy rates.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Data stays secure with end-to-end encryption and HIPAA-compliant infrastructure.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized algorithms deliver results in milliseconds for smooth real-time interaction.",
    },
    {
      icon: Users,
      title: "Accessibility Focused",
      description:
        "Designed for the deaf and hard-of-hearing community for maximum usability.",
    },
  ];

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/platform/stats`);
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const stats = await response.json();
        setPlatformStats(stats);
      } catch (error) {
        console.error("Failed to fetch platform stats:", error);
      }
    };
    fetchPlatformStats();
  }, []);

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Box minH="100vh" bg={bg}>
      {/* Navigation */}
      <Flex
        as="nav"
        bg={cardBg}
        borderBottomWidth={1}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        py={4}
        px={8}
        align="center"
        justify="space-between"
        shadow="sm"
      >
        <Heading size="md" color="teal.500">
          SignDetect
        </Heading>
        <HStack spacing={4}>
          <Link href="/login" passHref>
            <Button as="a" variant="ghost" _hover={{ bg: hoverBg }}>
              Sign In
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button as="a" colorScheme="teal" _hover={{ transform: "scale(1.05)" }}>
              Get Started
            </Button>
          </Link>
        </HStack>
      </Flex>

      {/* Hero Section */}
      <Box textAlign="center" py={28} px={6} bgGradient="linear(to-r, teal.50, teal.100)">
        <Heading as="h1" fontSize={["2xl", "3xl", "4xl"]} mb={6} lineHeight="short">
          Advanced Sign Language{" "}
          <Text as="span" color="teal.500">
            Detection Platform
          </Text>
        </Heading>
        <Text fontSize={["md", "lg"]} color={textColor} maxW="3xl" mx="auto" mb={8}>
          Empower communication with our AI-powered sign language detection system. Built for
          healthcare professionals, accessibility advocates, and the deaf community.
        </Text>
        <Stack direction={["column", "row"]} spacing={6} justify="center">
          <Link href="/signup" passHref>
            <Button
              as="a"
              size="lg"
              colorScheme="teal"
              rightIcon={<ArrowForwardIcon />}
              _hover={{ transform: "scale(1.05)" }}
            >
              Let's Start
            </Button>
          </Link>
        </Stack>
      </Box>

      {/* Features Section */}
      <Box py={20} px={6} bg={useColorModeValue("gray.100", "gray.800")}>
        <Container maxW="7xl" centerContent>
          <VStack spacing={6} textAlign="center" mb={16}>
            <Heading size="2xl">Why Choose SignDetect?</Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl">
              Our platform combines cutting-edge AI with accessibility-first design to deliver unmatched performance.
            </Text>
          </VStack>
          <SimpleGrid columns={[1, 2, 4]} spacing={8} w="full">
            {features.map((feature, idx) => (
              <Box
                key={idx}
                textAlign="center"
                p={6}
                bg={cardBg}
                borderRadius="xl"
                boxShadow="md"
                _hover={{ transform: "translateY(-6px)", shadow: "xl" }}
                transition="all 0.3s ease-in-out"
              >
                <Box mb={4} display="inline-flex" p={4} borderRadius="full" bg="teal.50" color="teal.500">
                  <Icon as={feature.icon} w={8} h={8} />
                </Box>
                <Heading size="md" mb={2}>
                  {feature.title}
                </Heading>
                <Text color={textColor}>{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Platform Statistics */}
      <Box py={20} px={6}>
        <Container maxW="4xl" textAlign="center">
          <Heading size="2xl" mb={6}>
            Platform Statistics
          </Heading>
          <Text fontSize="lg" color={textColor} mb={12}>
            Real-time insights into our platform's performance and usage.
          </Text>
          <SimpleGrid columns={[2, 4]} spacing={6}>
            {Object.entries(platformStats).map(([key, value]) => (
              <Box
                key={key}
                textAlign="center"
                p={6}
                bg={cardBg}
                borderRadius="xl"
                boxShadow="sm"
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s ease"
              >
                <Heading size="lg" color={key === "uptime" ? "teal.500" : "teal.600"} mb={2}>
                  {typeof value === "number" ? (
                    <CountUp
                      end={value}
                      separator=","
                      decimals={key === "accuracyRate" ? 1 : 0}
                      suffix={key === "accuracyRate" ? "%" : key === "signsDetected" ? "+" : ""}
                    />
                  ) : (
                    value
                  )}
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  {statLabels[key]}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} px={6} bg="teal.50">
        <Container maxW="4xl" textAlign="center">
          <Heading size="2xl" mb={6}>
            Ready to Transform Communication?
          </Heading>
          <Text fontSize="lg" color={textColor} mb={8}>
            Join thousands of healthcare professionals and accessibility advocates using SignDetect.
          </Text>
          <Stack direction={["column", "row"]} spacing={6} justify="center">
            <Link href="/signup" passHref>
              <Button as="a" size="lg" colorScheme="teal" _hover={{ transform: "scale(1.05)" }}>
                Let's Start
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}