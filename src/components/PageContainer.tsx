// components/PageContainer.tsx
import React from 'react';
import { Container, Box } from '@mui/material';


interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ paddingTop: '1rem'}}>
        {children}
      </Box>
    </Container>
  );
};

export default PageContainer;
