# ovh-angular-sso-auth

![OVH component](https://user-images.githubusercontent.com/3379410/27423240-3f944bc4-5731-11e7-87bb-3ff603aff8a7.png)

[![NPM](https://nodei.co/npm/ovh-angular-sso-auth.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ovh-angular-sso-auth/)

[![Maintenance](https://img.shields.io/maintenance/yes/2018.svg)]() [![Chat on gitter](https://img.shields.io/gitter/room/ovh/ux.svg)](https://gitter.im/ovh/ux) [![Build Status](https://travis-ci.org/ovh/ovh-angular-sso-auth.svg)](https://travis-ci.org/ovh/ovh-angular-sso-auth)

OVH $http interceptor working with sso.
Can be used with $resource!

# Installation

## Bower

    bower install ovh-angular-sso-auth --save

## NPM

    npm install ovh-angular-sso-auth --save

## Get the sources

```bash
    git clone https://github.com/ovh-ux/ovh-angular-sso-auth.git
    cd ovh-angular-sso-auth
    npm install
    bower install
```

You've developed a new cool feature ? Fixed an annoying bug ? We'd be happy
to hear from you !

Have a look in [CONTRIBUTING.md](https://github.com/ovh-ux/ovh-angular-sso-auth/blob/master/CONTRIBUTING.md)

# Usage

```javascript
.config(["ssoAuthenticationProvider", '$httpProvider', 'constants',
    function (authentication, $httpProvider, constants) {
        "use strict";

        authentication.setLoginUrl(constants.prodMode ? constants.loginUrl : "auth.html");
        authentication.setLogoutUrl(constants.prodMode ? "/engine/api/auth/logout" : "api/proxypass/auth/logout");
        authentication.setUserUrl(constants.prodMode ? "/engine/api/me" : "api/user");

        authentication.setConfig([
            {
                serviceType: "api",
                urlPrefix: "api"
            },
            {
                serviceType: "aapi",
                urlPrefix: constants.prodMode ? "../2api-m" : "2api-m"
            },
            {
                serviceType: "apiv6",
                urlPrefix: "apiv6"
            }
        ]);

        $httpProvider.interceptors.push("ssoAuthInterceptor");
    }
])
.run(['ssoAuthentication', function (authentication) {
    "use strict";
    authentication.login().then(function () {
        // Do what you want after login
    });
}])
```

# Related links

 * Contribute: https://github.com/ovh-ux/ovh-angular-sso-auth/blob/master/CONTRIBUTING.md
 * Report bugs: https://github.com/ovh-ux/ovh-angular-sso-auth/issues
 * Get latest version: https://github.com/ovh-ux/ovh-angular-sso-auth

# License

See https://github.com/ovh-ux/ovh-angular-sso-auth/blob/master/LICENSE
