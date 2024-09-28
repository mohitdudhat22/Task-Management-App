import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import Todo from './Todo';
import Tasks from './Tasks';
import { useTheme } from '@mui/material/styles';
import SendNotificationForm from './SendNotificationForm';

// Create a theme for the app
const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Component for demo page content
function DemoPageContent({ pathname }) {
  const theme = useTheme();
  console.log(pathname);
  
  const renderContent = () => {
    switch (pathname) {
      case '/dashboard/tasks':
        return <Tasks />;
      case '/dashboard/todo':
        return <Todo />;
      case '/dashboard/send-notification':
        return <SendNotificationForm />;
      default:
        return <Typography>Dashboard content for {pathname}</Typography>;
    }
  };

  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
      }}
    >
      {renderContent()}  
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutNavigationLinks(props) {
  const { window } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const router = React.useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path) => {
        navigate(`/dashboard${path}`);
      },
    };
  }, [location, navigate]);

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={[
        {
          segment: 'tasks',
          title: 'Tasks',
          icon: <DescriptionIcon />,
        },
        {
          segment: 'todo',
          title: 'Todo',
          icon: <DescriptionIcon />,
        },
        {
          segment: 'send-notification',
          title: 'Send Notification',
          icon: <DescriptionIcon />,
        }
      ]}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={location.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutNavigationLinks.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutNavigationLinks;
