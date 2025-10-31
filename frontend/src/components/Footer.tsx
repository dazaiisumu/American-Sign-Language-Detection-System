"use client"

import { Box, Container, Grid, GridItem, Heading, Text, Link, Divider, VStack } from "@chakra-ui/react"
import NextLink from "next/link"

export default function Footer() {
  return (
    <Box as="footer" bg="gray.50" borderTop="1px" borderColor="gray.200" mt="auto">
      <Container maxW="7xl" py={10}>
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={8}>
          {/* Brand Section */}
          <GridItem>
            <Heading as="h3" size="md" color="blue.600" mb={4}>
              SignDetect
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Professional sign language detection platform designed to enhance accessibility and communication for the
              deaf and hard-of-hearing community.
            </Text>
          </GridItem>

          {/* Platform Links */}
          <GridItem>
            <Heading as="h4" size="sm" mb={4}>
              Platform
            </Heading>
            <VStack align="start" spacing={2} fontSize="sm">
              <Link as={NextLink} href="/dashboard" color="gray.600" _hover={{ color: "blue.600" }}>
                Dashboard
              </Link>
              <Link as={NextLink} href="/history" color="gray.600" _hover={{ color: "blue.600" }}>
                Detection History
              </Link>
              <Link as={NextLink} href="/predictions" color="gray.600" _hover={{ color: "blue.600" }}>
                Live Detection
              </Link>
            </VStack>
          </GridItem>

          {/* Support Links */}
          <GridItem>
            <Heading as="h4" size="sm" mb={4}>
              Support
            </Heading>
            <VStack align="start" spacing={2} fontSize="sm">
              <Link as={NextLink} href="/help" color="gray.600" _hover={{ color: "blue.600" }}>
                Help Center
              </Link>
              <Link as={NextLink} href="/contact" color="gray.600" _hover={{ color: "blue.600" }}>
                Contact Us
              </Link>
              <Link as={NextLink} href="/privacy" color="gray.600" _hover={{ color: "blue.600" }}>
                Privacy Policy
              </Link>
            </VStack>
          </GridItem>
        </Grid>

        <Divider my={8} />

        <Text textAlign="center" fontSize="sm" color="gray.500">
          © 2024 SignDetect. All rights reserved. Built with accessibility in mind.
        </Text>
      </Container>
    </Box>
  )
}
