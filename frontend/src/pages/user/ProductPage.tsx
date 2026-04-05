import React from 'react';
import { Container, Typography } from '@mui/material';

const ProductPage: React.FC = () => {
  // TODO: Fetch products from API and display
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Products</Typography>
      {/* Product list will go here */}
    </Container>
  );
};

export default ProductPage;
