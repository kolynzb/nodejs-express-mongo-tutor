/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = stripe()(
  'pk_test_51JlmPdL0GHtiFEs1m9cmODwJ4HEElWwPowcslyG1s0hofu4WYH1SwIUtFoWBFT8esp1uhWpI27bfGwKdF25Fbe8M00K12iznWs'
); //public key

export const bookTour = async tourId => {
  try {
    // get checkout session from the Server
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //use stripe object to create a check out form
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert('error', err);
  }
};
