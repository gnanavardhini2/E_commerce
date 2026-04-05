import React from 'react';
import { Container, Typography } from '@mui/material';

const WishlistPage: React.FC = () => {
  // TODO: Fetch wishlist items from API and display
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Wishlist</Typography>
      {/* Wishlist items will go here */}
    </Container>
  );
};

export default WishlistPage;
