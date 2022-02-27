/* eslint-disable */
import '@babel/polyfill'; //to polly fill some of the js features to work in all browsers
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'https://127.0.0.1:8000//api/v1/users/login',
      data: { email, password }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Successfully logged in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:127.0.0.1:8000/api/v1/users/logout'
    });

    if ((res.data.status = 'success')) location.reload(true); //reload page after request sent
  } catch (error) {
    showAlert('error', 'Eroor logging out');
  }
};
