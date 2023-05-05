import { init as initHomePage } from './home-page';
import { init as initLoginPage } from './login-page';
import { init as initIframePage } from './iframe-page';
import { init as initNewSolutionPage } from './new-solution-page';

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
  case '/new-solution': {
    initNewSolutionPage();
    break;
  }
  default: {
    throw new Error('page not found');
    break;
  }
}
