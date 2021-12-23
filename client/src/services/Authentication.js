import https from './http-common';

class AuthenticationServices {
  login(user) {
    return https.post('/login', user);
  }

  changeName(user) {
    return https.post('/change', user);
  }
}

export default new AuthenticationServices();
