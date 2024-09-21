import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MuiCard from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { GoogleIcon, FacebookIcon } from './CustomIcons'; // Custom icons
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundImage:
    'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
}));

const defaultTheme = createTheme();

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateInputs = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 0) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        Name: formData.name,
        Email: formData.email,
        Password: formData.password,
        Role: formData.role,
      });
      console.log('Registration successful:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration error (e.g., show error message)
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <SignInContainer>
        <Card>
          <Avatar sx={{ m: 'auto', bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ textAlign: 'center' }}>
            Register
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              error={!!errors.name}
              helperText={errors.name}
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              required
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              error={!!errors.email}
              helperText={errors.email}
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              required
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              error={!!errors.password}
              helperText={errors.password}
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              required
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              required
              fullWidth
              value={formData.confirmPassword}
              onChange={handleInputChange}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <Button type="submit" fullWidth variant="contained">
              Register
            </Button>

            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }}>or</Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => alert('Register with Google')}
            >
              Register with Google
            </Button>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => alert('Register with Facebook')}
            >
              Register with Facebook
            </Button>
          </Box>

          <Copyright sx={{ mt: 4 }} />
        </Card>
      </SignInContainer>
    </ThemeProvider>
  );
}

export default Registration;