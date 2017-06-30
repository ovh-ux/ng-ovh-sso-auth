"use strict";

describe("sso-auth interceptor service", function () {

    var loginUrl = "https://www.ovh.com/auth";
    var logoutUrl = "https://www.ovh.com/auth?action=disconnect";

    var config = [
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
    ];

    var $httpBackend;
    var $http;

    beforeEach(module("ovh-angular-sso-auth"));
    beforeEach(module(function (ssoAuthenticationProvider, $httpProvider) {
        ssoAuthenticationProvider.setConfig(config);
        $httpProvider.interceptors.push("ssoAuthInterceptor");
    }));

    beforeEach(inject(function (_$httpBackend_, _$http_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
    }));

    afterEach(inject(function (_$httpBackend_, _$cookies_) {
        _$httpBackend_.verifyNoOutstandingExpectation();
        _$httpBackend_.verifyNoOutstandingRequest();
        localStorage.clear();
        sessionStorage.clear();
        var cookies = _$cookies_.getAll();
        angular.forEach(cookies, function (v, k) {
            _$cookies_.remove(k);
        });
    }));

    // --- Utils

    function getRandomString () {
        return Math.random().toString(36).substr(2, 5) || "test";
    }

    // --- Tests

    describe("requests being logged", function () {

        beforeEach(inject(function (ssoAuthentication) {
            spyOn($, "ajax").and.callFake(function () {
                var d = $.Deferred();
                d.resolve();
                return d.promise();
            });

            ssoAuthentication.login();
        }));

        it("should perform a GET request with good prefix", inject(function () {

            var value = getRandomString();

            $httpBackend.expectGET(config[2].urlPrefix + "/me").respond(200, {
                name: value
            });

            $http.get("/me", {
                serviceType: "apiv6"
            }).then(function (data) {
                expect(data.data.name).toBe(value);
            });

            $httpBackend.flush();
        }));

        it("should perform a GET request with good prefix, without specifying a serviceType (should take the first)", inject(function () {

            var value = getRandomString();

            $httpBackend.expectGET(config[0].urlPrefix + "/me").respond(200, {
                name: value
            });

            $http.get("/me").then(function (data) {
                expect(data.data.name).toBe(value);
            });

            $httpBackend.flush();
        }));

        it("should perform a GET request (beggining with https) without put a prefix (prevent it)", inject(function () {

            var value = getRandomString();

            $httpBackend.expectGET("https://www.example.com/me").respond(200, {
                name: value
            });

            $http.get("https://www.example.com/me", {
                serviceType: "apiv6"
            }).then(function (data) {
                expect(data.data.name).toBe(value);
            });

            $httpBackend.flush();
        }));

        it("should perform a GET request with overrided headers", inject(function () {

            var headerValue = getRandomString();

            $httpBackend.expectGET(config[0].urlPrefix + "/me", {
                Accept: "application/json, text/plain, */*",
                "X-Ovh-Titi": headerValue
            }).respond(200, {});

            $http.get("/me", {
                headers: {
                    "X-Ovh-Titi": headerValue
                }
            });

            $httpBackend.flush();
        }));

        it("should not touch to html and trads requests", inject(function () {

            var value = getRandomString();

            $httpBackend.expectGET("lol.html").respond(200, value);
            $httpBackend.expectGET("lol/Messages_fr_FR.json").respond(200, value);

            $http.get("lol.html").then(function (data) {
                expect(data.data).toBe(value);
            });
            $http.get("lol/Messages_fr_FR.json").then(function (data) {
                expect(data.data).toBe(value);
            });

            $httpBackend.flush();
        }));

        it("should perform a GET request and being logged out with a 401", inject(function (ssoAuthentication, $timeout, $window, $location) {

            var value = getRandomString();

            spyOn($window.location, "assign");

            $httpBackend.expectGET(config[0].urlPrefix + "/me").respond(401, {
                message: value
            });

            $http.get("/me").catch(function (err) {
                expect(err.data.message).toBe(value);
            });

            $httpBackend.flush();
            $timeout.flush();

            ssoAuthentication.isLogged().then(function (isLogged) {
                expect(isLogged).toBe(false);    // Must be disconnected
                expect($window.location.assign).toHaveBeenCalledWith(logoutUrl + (logoutUrl.indexOf("?") === -1 ? "?" : "&") + "onsuccess=" + encodeURIComponent($location.absUrl()));
            });

        }));

        it("should perform a GET request with 471, be redirected to loginPage without being delogged", inject(function (ssoAuthentication, $timeout, $window, $location) {

            var value = getRandomString();

            spyOn($window.location, "assign");

            $httpBackend.expectGET(config[0].urlPrefix + "/me").respond(471, {
                message: value
            });

            $http.get("/me").catch(function (err) {
                expect(err.data.message).toBe(value);
            });

            $httpBackend.flush();
            $timeout.flush();

            ssoAuthentication.isLogged().then(function (isLogged) {
                expect(isLogged).toBe(true);    // Must be connected
                expect($window.location.assign).toHaveBeenCalledWith(loginUrl + (loginUrl.indexOf("?") === -1 ? "?" : "&") + "onsuccess=" + encodeURIComponent($location.absUrl()));
            });

        }));

        it("should perform a GET request with a timeout and be cancelled", inject(function ($q, $timeout) {

            var deferredObj = $q.defer();

            $httpBackend.expectGET(config[0].urlPrefix + "/me").respond(200, {});

            $http.get("/me", {
                timeout: deferredObj.promise
            }).catch(function (err) {
                expect(err.status).toBe(-1);
            });

            deferredObj.resolve();

            $timeout.flush();
        }));


    });

    // ---

    describe("requests being NOT logged", function () {

        beforeEach(inject(function (ssoAuthentication) {
            spyOn($, "ajax").and.callFake(function () {
                var d = $.Deferred();
                d.reject();
                return d.promise();
            });

            ssoAuthentication.login();
        }));

        it("should perform a GET request, should cancel the request", inject(function (ssoAuthentication, $timeout, $window) {

            var value = getRandomString();

            spyOn($window.location, "assign");

            $httpBackend.expectGET(config[0].urlPrefix + "/me").respond(400, {
                message: value
            });

            $http.get("/me").then(function (err) {
                expect(err.data.message).toBe(value);
            });

            $timeout.flush();

            ssoAuthentication.isLogged().then(function (isLogged) {
                expect(isLogged).toBe(false);    // Must stay disconnected
            });

        }));

        it("should perform a GET request (noAuthenticate), be rejected, and not be redirected to logout", inject(function (ssoAuthentication, $timeout, $window) {

            var value = getRandomString();

            spyOn($window.location, "assign");

            $httpBackend.expectGET(config[0].urlPrefix + "/me").respond(400, {
                message: value
            });

            $http.get("/me", {
                noAuthenticate: true
            }).catch(function (err) {
                expect(err.data.message).toBe(value);
            });

            $httpBackend.flush();
            $timeout.flush();

            ssoAuthentication.isLogged().then(function (isLogged) {
                expect(isLogged).toBe(false);    // Must stay disconnected
                expect($window.location.assign).not.toHaveBeenCalled();
            });

        }));

    });

});
