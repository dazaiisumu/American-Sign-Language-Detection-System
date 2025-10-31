"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Box, Spinner, Text, Center } from "@chakra-ui/react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if user is not logged in and not loading
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Center minH="100vh" bg="gray.50">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center minH="100vh" bg="gray.50">
        <Text color="gray.500">Redirecting to login...</Text>
      </Center>
    );
  }

  return <>{children}</>;
}
