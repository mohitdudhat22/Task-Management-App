import PropTypes from 'prop-types';
import { Box} from '@mui/material';

function Layout({  children }) {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;