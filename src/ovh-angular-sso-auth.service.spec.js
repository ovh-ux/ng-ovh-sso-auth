"use strict";

describe("sso-auth service", function () {

    var loginUrl = "https://www.ovh.com/auth";
    var loginUrlWithSGOvhSubsidiary = "https://www.ovh.com/auth?ovhSubsidiary=SG";
    var logoutUrl = "https://www.ovh.com/auth?action=disconnect";
    var urlPrefix = "";
    var userUrl = "/engine/api/me";

    beforeEach(module("ovh-angular-sso-auth"));
    beforeEach(module(function (ssoAuthenticationProvider) {
        ssoAuthenticationProvider.setConfig([
            {
                serviceType: "api",
                urlPrefix: "api"
            },
            {
                serviceType: "aapi",
                urlPrefix: "../2api-m"
            },
            {
                serviceType: "apiv6",
                urlPrefix: "https://www.ovh.com/engine/api"
            }
        ]);

    }));

    afterEach(inject(function ($httpBackend, $cookies) {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        localStorage.clear();
        sessionStorage.clear();
        var cookies = $cookies.getAll();
        angular.forEach(cookies, function (v, k) {
            $cookies.remove(k);
        });
    }));

    // --- Utils

    function getRandomString () {
        return Math.random().toString(36).substr(2, 5) || "test";
    }

    // --- Tests

    describe("General configuration", function () {

        it("should load the service with default values", inject(function (ssoAuthentication) {
            expect(ssoAuthentication.getLoginUrl()).toBe(loginUrl);
            expect(ssoAuthentication.getLogoutUrl()).toBe(logoutUrl);
            expect(ssoAuthentication.getUrlPrefix()).toBe("api");
            expect(ssoAuthentication.getUserUrl()).toBe(userUrl);
            expect(ssoAuthentication.getHeaders()).toEqual({
                "Content-Type": "application/json;charset=utf-8",
                Accept: "application/json"
            });
        }));

        it("should change the general config", function () {

            var randomLoginUrl = getRandomString();
            var randomLogoutUrl = getRandomString();
            var randomUserUrl = getRandomString();

            module(function (ssoAuthenticationProvider) {
                ssoAuthenticationProvider.setLoginUrl(randomLoginUrl);
                ssoAuthenticationProvider.setLogoutUrl(randomLogoutUrl);
                ssoAuthenticationProvider.setUserUrl(randomUserUrl);
            });

            inject(function (ssoAuthentication) {
                expect(ssoAuthentication.getLoginUrl()).toBe(randomLoginUrl);
                expect(ssoAuthentication.getLogoutUrl()).toBe(randomLogoutUrl);
                expect(ssoAuthentication.getUserUrl()).toBe(randomUserUrl);
            });
        });

        it("should get urlprefix by serviceType", inject(function (ssoAuthentication) {
            expect(ssoAuthentication.getUrlPrefix("api")).toBe("api");
            expect(ssoAuthentication.getUrlPrefix("aapi")).toBe("../2api-m");
            expect(ssoAuthentication.getUrlPrefix("apiv6")).toBe("https://www.ovh.com/engine/api");
        }));

        it("should get default urlprefix cause no config", function () {

            module(function (ssoAuthenticationProvider) {
                ssoAuthenticationProvider.setConfig(null);
            });

            inject(function (ssoAuthentication) {
                expect(ssoAuthentication.getUrlPrefix()).toBe(urlPrefix);
            });
        });

        it("should get login url with SG OVH subsidiary setted as parameter", function () {

            module(function (ssoAuthenticationProvider) {
                ssoAuthenticationProvider.setOvhSubsidiary("SG");
            });

            inject(function (ssoAuthentication) {
                expect(ssoAuthentication.getLoginUrl()).toBe(loginUrlWithSGOvhSubsidiary);
            });
        });
    });

    // ---

    describe("Login", function () {

        it("should connect from API", inject(function ($cookies, ssoAuthentication) {
            var name = getRandomString();

            spyOn($, "ajax").and.callFake(function () {
                var d = $.Deferred();
                d.resolve({
                    name: name
                });
                return d.promise();
            });

            $cookies.put("SESSION", "SESSION");
            $cookies.put("USERID", "USERID");

            ssoAuthentication.login().then(function () {
                ssoAuthentication.isLogged().then(function (isLogged) {
                    expect(isLogged).toBe(true);
                    expect(ssoAuthentication.user.name).toBe(name);
                    expect(ssoAuthentication.userId).toBe("USERID");
                });
            });

        }));

        it("should cannot connect", inject(function (ssoAuthentication) {
            spyOn($, "ajax").and.callFake(function () {
                var d = $.Deferred();
                d.reject();
                return d.promise();
            });

            ssoAuthentication.login().finally(function () {
                ssoAuthentication.isLogged().then(function (isLogged) {
                    expect(isLogged).toBe(false);
                });
            });
        }));

        it("should force login (tests only)", inject(function (ssoAuthentication) {

            ssoAuthentication.setIsLoggedIn();

            ssoAuthentication.isLogged().then(function (isLogged) {
                expect(isLogged).toBe(true);
            });
        }));
    });

    // ---

    describe("Operations", function () {

        beforeEach(inject(function ($cookies, ssoAuthentication) {
            spyOn($, "ajax").and.callFake(function () {
                var d = $.Deferred();
                d.resolve({
                    name: "toto",
                    firstname: "tata"
                });
                return d.promise();
            });

            $cookies.put("SESSION", "SESSION");
            $cookies.put("USERID", "USERID");

            ssoAuthentication.login();
        }));

        it("should go to login page (without delog)", inject(function (ssoAuthentication, $timeout, $window, $location) {

            spyOn($window.location, "assign");

            ssoAuthentication.goToLoginPage();

            ssoAuthentication.isLogged().then(function (isLogged) {
                expect(isLogged).toBe(true);    // Must stay logged
                expect($window.location.assign).toHaveBeenCalledWith(loginUrl + "?onsuccess=" + encodeURIComponent($location.absUrl()));
            });

            $timeout.flush();
        }));

        it("should test sessionCheckOrGoLogin, as connected, do nothing", inject(function (ssoAuthentication, $timeout) {

            spyOn(ssoAuthentication, "goToLoginPage");

            ssoAuthentication.sessionCheckOrGoLogin().then(function () {
                expect(ssoAuthentication.goToLoginPage).not.toHaveBeenCalled();
            });

            $timeout.flush();
        }));

        it("should get request promise cause user logged in", inject(function (ssoAuthentication, $timeout) {
            expect(ssoAuthentication.getRequestPromise().then).toBeDefined();
            $timeout.flush();
        }));

        it("should get pending promise", inject(function (ssoAuthentication) {
            expect(ssoAuthentication.getSsoAuthPendingPromise().then).toBeDefined();
        }));

        it("should get cookie USERID", inject(function (ssoAuthentication) {
            expect(ssoAuthentication.getUserIdCookie()).toBe("USERID");
        }));

        describe("handleSwitchSession", function () {

            it("should reload the location", inject(function ($window, ssoAuthentication) {
                spyOn($window.location, "reload");

                ssoAuthentication.handleSwitchSession();

                expect($window.location.reload).toHaveBeenCalled();
            }));

            it("from connected to connected with other", inject(function ($cookies, $timeout, ssoAuthentication) {
                var userId = getRandomString();

                spyOn(ssoAuthentication, "handleSwitchSession");

                $cookies.put("USERID", userId);
                ssoAuthentication.getSsoAuthPendingPromise();

                $timeout.flush();

                expect(ssoAuthentication.handleSwitchSession).toHaveBeenCalledWith(userId);
            }));

            it("from connected to disconnected", inject(function ($cookies, $timeout, ssoAuthentication) {
                spyOn(ssoAuthentication, "handleSwitchSession");

                $cookies.remove("USERID");
                ssoAuthentication.getSsoAuthPendingPromise();

                $timeout.flush();

                expect(ssoAuthentication.handleSwitchSession).toHaveBeenCalledWith(undefined);
            }));

            it("from disconnected to connected", inject(function ($cookies, $timeout, ssoAuthentication) {
                var userId = getRandomString();

                spyOn(ssoAuthentication, "handleSwitchSession");

                ssoAuthentication.userId = undefined;
                $cookies.put("USERID", userId);
                ssoAuthentication.getSsoAuthPendingPromise();

                $timeout.flush();

                expect(ssoAuthentication.handleSwitchSession).toHaveBeenCalledWith(userId);
            }));

        });
    });

    // ---

    describe("Logout", function () {

        beforeEach(inject(function ($cookies, ssoAuthentication) {
            spyOn($, "ajax").and.callFake(function () {
                var d = $.Deferred();
                d.resolve({
                    name: "toto",
                    firstname: "tata"
                });
                return d.promise();
            });

            $cookies.put("SESSION", "SESSION");
            $cookies.put("USERID", "USERID");

            ssoAuthentication.login();
        }));

        it("should disconnect via API", function () {

            inject(function (ssoAuthentication, $timeout, $window, $location) {

                spyOn($window.location, "assign");

                ssoAuthentication.logout();

                ssoAuthentication.isLogged().then(function (isLogged) {
                    expect(isLogged).toBe(false);    // Must be disconnected
                    expect($window.location.assign).toHaveBeenCalledWith(logoutUrl + (logoutUrl.indexOf("?") === -1 ? "?" : "&") + "onsuccess=" + encodeURIComponent($location.absUrl()));
                });

                $timeout.flush();

            });
        });

    });

});
