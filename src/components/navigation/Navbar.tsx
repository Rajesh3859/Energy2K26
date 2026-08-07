'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const NAV_ITEMS = [
  { label: 'Events', href: '#events' },
  { label: 'Packages', href: '#packages' },
  { label: 'Live scores', href: '#live-scores' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Blog', href: '#blog' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

// Custom Logo SVG based on visual image
export const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('');

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 20,
        zIndex: 1100,
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderRadius: '10px',
            px: { xs: 2.5, sm: 3, md: 4 },
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `
              0px 10px 30px rgba(0, 0, 0, 0.06),
              0px 4px 12px rgba(217, 119, 6, 0.08),
              inset 0px 1px 1px rgba(255, 255, 255, 0.9)
            `,
            border: '1px solid rgba(243, 230, 218, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `
                0px 14px 36px rgba(0, 0, 0, 0.09),
                0px 6px 16px rgba(217, 119, 6, 0.12),
                inset 0px 1px 1px rgba(255, 255, 255, 0.95)
              `,
            },
          }}
        >
          {/* Logo Section */}
          <Box
            component="a"
            href="#"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.15rem', sm: '1.25rem' },
                letterSpacing: '0.04em',
                color: '#1E293B',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ENERGY
              <Box
                component="span"
                sx={{
                  color: '#16A34A',
                  ml: '2px',
                  fontWeight: 900,
                }}
              >
                2K26
              </Box>
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Stack
              direction="row"
              spacing={{ md: 2.5, lg: 3.5 }}
              component="nav"
              sx={{ alignItems: 'center' }}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeItem === item.label;
                return (
                  <Typography
                    key={item.label}
                    component="a"
                    href={item.href}
                    onClick={() => setActiveItem(item.label)}
                    sx={{
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#0F172A' : '#475569',
                      textDecoration: 'none',
                      position: 'relative',
                      transition: 'color 0.2s ease-in-out',
                      py: 0.5,
                      px: 0.5,
                      '&:hover': {
                        color: '#0F172A',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: isActive ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                        width: '80%',
                        height: '2px',
                        backgroundColor: '#D97706',
                        borderRadius: '2px',
                        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                      '&:hover::after': {
                        transform: 'translateX(-50%) scaleX(1)',
                      },
                    }}
                  >
                    {item.label}
                  </Typography>
                );
              })}
            </Stack>
          )}

          {/* Right Action Button & Mobile Toggle */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="contained"
              disableElevation
              sx={{
                background: 'linear-gradient(135deg, #E05A10 0%, #D97706 100%)',
                color: '#FFFFFF',
                borderRadius: '50px',
                px: { xs: 2.5, sm: 3.25 },
                py: { xs: 0.85, sm: 1.1 },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '0.925rem' },
                letterSpacing: '0.01em',
                boxShadow: '0px 6px 18px rgba(224, 90, 16, 0.35)',
                transition: 'all 0.25s ease-in-out',
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: 'linear-gradient(135deg, #CC4E0A 0%, #C26805 100%)',
                  boxShadow: '0px 8px 22px rgba(224, 90, 16, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Book a call
            </Button>

            {isMobile && (
              <IconButton
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  color: '#334155',
                  ml: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        keepMounted
        slotProps={{
          paper: {
            sx: {
              width: 280,
              borderRadius: '24px 0 0 24px',
              px: 2,
              py: 3,
              backgroundColor: '#FFFFFF',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>
              ENERGY<span style={{ color: '#16A34A' }}>2K26</span>
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component="a"
                href={item.href}
                onClick={() => {
                  setActiveItem(item.label);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  py: 1.25,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(217, 119, 6, 0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: activeItem === item.label ? 700 : 500,
                        color: activeItem === item.label ? '#D97706' : '#334155',
                        fontSize: '0.95rem',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', pt: 2, px: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            sx={{
              background: 'linear-gradient(135deg, #E05A10 0%, #D97706 100%)',
              color: '#FFFFFF',
              borderRadius: '50px',
              py: 1.25,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0px 6px 18px rgba(224, 90, 16, 0.35)',
            }}
          >
            Book a call
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
