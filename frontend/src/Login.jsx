import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 0) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            Email: email,
            Password: password
        });
        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
    } catch (error) {
        console.error('Login failed:', error);
     
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
            Sign in
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
              />
            </Box>
              <Link href="#" variant="body2" sx={{ alignSelf: 'baseline' }}>
                Forgot password?
              </Link>
            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />

            <Button type="submit" fullWidth variant="contained">
              Sign in
            </Button>

            <Typography sx={{ textAlign: 'center' }}>
              Don&apost have an account?{' '}
              <Link href="/register" variant="body2">
                Sign up
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
              onClick={() => alert('Sign in with Google')}
            >
              Sign in with Google
            </Button>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => alert('Sign in with Facebook')}
            >
              Sign in with Facebook
            </Button>
          </Box>

          <Copyright sx={{ mt: 4 }} />
        </Card>
      </SignInContainer>
    </ThemeProvider>
  );
}

export default Login;
