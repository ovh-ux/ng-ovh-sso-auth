import angular from 'angular';
import ngCookies from 'angular-cookies';

import factory from './ssoAuth-interceptor/ovh-angular-sso-auth-interceptor.service';
import ssoAuthProvider from './ovh-angular-sso-auth.service';

const moduleName = 'ovh-angular-sso-auth';

angular
  .module('ovh-angular-sso-auth', [ngCookies])
  .provider('ssoAuthentication', ssoAuthProvider)
  .factory('ssoAuthInterceptor', factory);

export default moduleName;
