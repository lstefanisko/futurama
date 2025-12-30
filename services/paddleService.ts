import Paddle from '@paddle/paddle-js';

// Initialize Paddle
let isInitialized = false;

export const initializePaddle = async () => {
  if (isInitialized) return;
  
  try {
    // Use sandbox environment for testing
    await Paddle.Initialize({
      environment: 'sandbox',
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '',
    });
    isInitialized = true;
    console.log('Paddle initialized');
  } catch (error) {
    console.error('Failed to initialize Paddle:', error);
  }
};

export const openCheckout = async (priceId: string, email?: string) => {
  try {
    await initializePaddle();
    
    // Open Paddle checkout
    Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: email ? { email } : undefined,
    });
  } catch (error) {
    console.error('Failed to open checkout:', error);
  }
};
