/* eslint-disable */

//index is for calls
import { login, logout } from './login';
import { displayMap } from './mapbox';

//dom elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('nav__el--logout');

//values
loginForm &&
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

//delegation
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  displayMap(locations);
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
