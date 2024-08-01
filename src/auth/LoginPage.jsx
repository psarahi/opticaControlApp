import { Box, Button } from '@mui/material'
import React from 'react'
import LoginIcon from '@mui/icons-material/Login';
import { NavLink } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <>
      <Box >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              p: 3,
              borderRadius: 3,
              boxShadow: 1,
            }}
          >
            <h2>Login</h2>
            <Button variant="contained" component={NavLink} to="/info" startIcon={<LoginIcon />} >
              Login
            </Button>   
             </Box>
        </Box>
      </Box>

    </>
  )
}
