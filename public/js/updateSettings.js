/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//type is either password or data

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'https:/127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'https:/127.0.0.1:8000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success')
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
