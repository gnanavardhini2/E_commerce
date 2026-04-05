import React from 'react';
import { Container, Typography } from '@mui/material';

const OrderPage: React.FC = () => {
  // TODO: Fetch orders from API and display
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      {/* Order list/history will go here */}
    </Container>
  );
};

export default OrderPage;
