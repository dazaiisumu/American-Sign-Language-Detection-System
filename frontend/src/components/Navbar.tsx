"use client";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarBadge, AvatarGroup, Box, Button, Flex, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { ChevronDownIcon, SettingsIcon, UnlockIcon, ViewIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login"); // prevent back navigation
  };

  return (
    <Box bg="gray.50" borderBottom="1px" borderColor="gray.200" px={6} py={3}>
      <Flex maxW="7xl" mx="auto" align="center" justify="space-between">
        {/* Logo and Links */}
        <HStack spacing={8} align="center">
          <Link href="/dashboard">
            <Text fontSize="xl" fontWeight="bold" color="teal.500" cursor="pointer">
              SignDetect
            </Text>
          </Link>
          <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/history">History</Link>
            <Link href="/predictions">Live Detection</Link>
          </HStack>
        </HStack>

        {/* User Menu */}
        {user ? (
          <Menu>
            <MenuButton as={Button} variant="ghost" px={2} py={1} rounded="full" cursor="pointer">
              <Avatar size="sm" name={user.name} />
            </MenuButton>
            <MenuList>
              <Box px={4} py={2}>
                <Text fontWeight="bold">{user.name}</Text>
                <Text fontSize="sm" color="gray.500">{user.email}</Text>
              </Box>
              <MenuItem icon={<ViewIcon />}>Profile</MenuItem>
              <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
              <MenuItem icon={<UnlockIcon />} onClick={handleLogout}>Log out</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <HStack spacing={2}>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button colorScheme="teal">Sign Up</Button>
            </Link>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
