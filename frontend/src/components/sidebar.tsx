"use client";

import Link from "next/link";
import { FC } from "react";
import { Home, Clock, Play } from "lucide-react";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";

interface SidebarProps {
  currentPath?: string;
}

export const Sidebar: FC<SidebarProps> = ({ currentPath }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeBg = useColorModeValue("teal.500", "teal.600");
  const activeColor = useColorModeValue("white", "white");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "History", href: "/history", icon: Clock },
    { name: "Live Detection", href: "/predictions", icon: Play },
  ];

  return (
    <Box
      w="64"
      h="100vh"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      p={4}
      display="flex"
      flexDirection="column"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6} color="teal.500">
        SignDetect
      </Text>
      <Box as="nav" display="flex" flexDirection="column" gap={2}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.href;
          return (
            <Link key={link.href} href={link.href} passHref>
              <Flex
                align="center"
                px={3}
                py={2}
                borderRadius="md"
                bg={isActive ? activeBg : "transparent"}
                color={isActive ? activeColor : textColor}
                _hover={{ bg: !isActive ? hoverBg : undefined }}
                cursor="pointer"
              >
                <Icon size={18} />
                <Text ml={2}>{link.name}</Text>
              </Flex>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
};
