import { init as initHomePage } from './home-page';
import { init as initLoginPage } from './login-page';
import { init as initIframePage } from './iframe-page';

switch(location.pathname) {
  case '/': {
    initHomePage();
    break;
  }
  case '/login': {
    initLoginPage();
    break;
  }
  case '/iframe': {
    initIframePage();
    break;
  }
  default: {
    throw new Error('page not found');
    break;
  }
}