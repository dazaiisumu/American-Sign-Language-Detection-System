"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  AlertDescription,
  Heading,
  Text,
  VStack,
  Center,
} from "@chakra-ui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading, user } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Invalid email or password");
    }
  };

  return (
    <Center minH="100vh" bg="gray.50" p={4}>
      <Box w="full" maxW="md" bg="white" shadow="md" rounded="md" p={6}>
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center" size="lg">
            Sign Language Detection
          </Heading>
          <Text textAlign="center" color="gray.500">
            Sign in to access your dashboard
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  autoFocus
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" w="full" isLoading={loading}>
                Sign In
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm" color="gray.500">
            Don't have an account?{" "}
            <Link href="/signup">
              <Text as="span" color="blue.500" textDecoration="underline">
                Sign up
              </Text>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Center>
  );
}
