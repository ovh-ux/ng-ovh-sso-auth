# ng-ovh-sso-auth

![OVH component](https://user-images.githubusercontent.com/3379410/27423240-3f944bc4-5731-11e7-87bb-3ff603aff8a7.png)

[![NPM](https://nodei.co/npm/ng-ovh-sso-auth.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ng-ovh-sso-auth/)

[![Maintenance](https://img.shields.io/maintenance/yes/2018.svg)]() [![Chat on gitter](https://img.shields.io/gitter/room/ovh/ux.svg)](https://gitter.im/ovh/ux) [![Build Status](https://travis-ci.org/ovh/ng-ovh-sso-auth.svg)](https://travis-ci.org/ovh/ng-ovh-sso-auth)

OVH $http interceptor working with sso.
Can be used with $resource!

# Installation

## Bower

    bower install ng-ovh-sso-auth --save

## NPM

    npm install ng-ovh-sso-auth --save

## Get the sources

```bash
    git clone https://github.com/ovh-ux/ng-ovh-sso-auth.git
    cd ng-ovh-sso-auth
    npm install
    bower install
```

You've developed a new cool feature ? Fixed an annoying bug ? We'd be happy
to hear from you !

Have a look in [CONTRIBUTING.md](https://github.com/ovh-ux/ng-ovh-sso-auth/blob/master/CONTRIBUTING.md)

# Usage

```js
import angular from 'angular';
import ngOvhSsoAuth from '@ovh-ux/ng-ovh-sso-auth';

angular
  .module('myApp', [ngOvhSsoAuth])
  .config(/* @ngInject */ (ssoAuthenticationProvider, $httpProvider, constants) => {
    ssoAuthenticationProvider
      .setLoginUrl(constants.prodMode ? constants.loginUrl : 'auth.html');
    ssoAuthenticationProvider
      .setLogoutUrl(constants.prodMode ? '/engine/api/auth/logout' : 'api/proxypass/auth/logout');
    ssoAuthenticationProvider
      .setUserUrl(constants.prodMode ? '/engine/api/me' : 'api/user');
    ssoAuthenticationProvider.setConfig([
      {
        serviceType: 'api',
        urlPrefix: 'api',
      },
      {
        serviceType: 'aapi',
        urlPrefix: constants.prodMode ? '../2api-m' : '2api-m',
      },
      {
        serviceType: 'apiv6',
        urlPrefix: 'apiv6',
      },
    ]);

    $httpProvider.interceptors.push('OvhSsoAuthInterceptor');
  })
  .run(/* @ngInject */(ssoAuthentication) => {
    ssoAuthentication.login().then(() => {
      // Do what you want after login
    });
  });
```

# Related links

 * Contribute: https://github.com/ovh-ux/ng-ovh-sso-auth/blob/master/CONTRIBUTING.md
 * Report bugs: https://github.com/ovh-ux/ng-ovh-sso-auth/issues
 * Get latest version: https://github.com/ovh-ux/ng-ovh-sso-auth

# License

See https://github.com/ovh-ux/ng-ovh-sso-auth/blob/master/LICENSE
