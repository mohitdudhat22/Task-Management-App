import TodoIcon from '@mui/icons-material/Description';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { demoTheme } from './config';
import Todo from './Todo';
import { useMemo } from 'react';

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
  
    const router = useMemo(() => {
      return {
        pathname: location.pathname,
        searchParams: new URLSearchParams(location.search),
        navigate: (path) => navigate(path),
      };
    }, [location, navigate]);
  
    return (
      <AppProvider
        title="Dashboard"
        navigation={[
          {
            segment: 'todo',
            title: 'Todo',
            icon: <TodoIcon />,
          }
        ]}
        router={router}
        theme={demoTheme}
      >
        <DashboardLayout>
          <Routes>
            <Route path="todo" element={<Todo />} />
          </Routes>
        </DashboardLayout>
      </AppProvider>
    );
  }
  
  export default Dashboard;