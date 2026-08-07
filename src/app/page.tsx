'use client';

import React from 'react';
import Navbar from '@/components/navigation/Navbar';
import { Box, Container, Typography, Button, Stack, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StarIcon from '@mui/icons-material/Star';

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F9F5F0 0%, #F3ECE4 40%, #EFE5D9 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient warm lighting blur behind navbar */}
      <Box
        sx={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(224, 90, 16, 0.14) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: 10, position: 'relative', zIndex: 1 }}>
        <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Chip
            icon={<StarIcon sx={{ fontSize: '1rem !important', color: '#D97706 !important' }} />}
            label="The #1 Field & Event Management Platform"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              color: '#78350F',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 2.2,
              px: 1,
              borderRadius: '30px',
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.75rem', md: '4.5rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0F172A',
              lineHeight: 1.15,
              maxWidth: '900px',
            }}
          >
            Organize Unforgettable{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #E05A10 0%, #15803D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sports & Field Days
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              color: '#475569',
              maxWidth: '650px',
              lineHeight: 1.6,
            }}
          >
            Streamline event bookings, live score tracking, custom packages, and gallery showcases — all in one modern platform.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<CalendarMonthIcon />}
              sx={{
                background: 'linear-gradient(135deg, #E05A10 0%, #D97706 100%)',
                color: '#FFFFFF',
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0px 8px 24px rgba(224, 90, 16, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #CC4E0A 0%, #C26805 100%)',
                  boxShadow: '0px 10px 28px rgba(224, 90, 16, 0.45)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Explore Packages
            </Button>
            <Button
              variant="outlined"
              startIcon={<SportsSoccerIcon />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#1E293B',
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  borderColor: '#94A3B8',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              View Live Scores
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
