import ngCookies from 'angular-cookies'

import factory from './ssoAuth-interceptor/ovh-angular-sso-auth-interceptor.service'
import ssoAuthProvider from './ovh-angular-sso-auth.service';

export default angular
  .module("ovh-angular-sso-auth", [ngCookies])
  .provider("ssoAuthentication", ssoAuthProvider)
  .factory("ssoAuthInterceptor", factory)
  .name;
