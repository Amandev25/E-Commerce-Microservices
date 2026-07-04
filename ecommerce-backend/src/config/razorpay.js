import Razorpay from 'razorpay';
import config from './env.js';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export default razorpay;