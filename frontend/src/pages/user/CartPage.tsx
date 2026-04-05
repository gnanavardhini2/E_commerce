import React from 'react';
import { Container, Typography } from '@mui/material';

const CartPage: React.FC = () => {
  // TODO: Fetch cart items from API and display
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Cart</Typography>
      {/* Cart items will go here */}
    </Container>
  );
};

export default CartPage;
