import axios from 'axios';

export default axios.create({
  // baseURL: `${window.location.protocol}//${window.location.host}`,
  baseURL: `${window.location.protocol}//localhost:3000`,
  headers: {
    'Content-type': 'application/json'
  }
});