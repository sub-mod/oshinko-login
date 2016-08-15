(function () {
    'use strict';

    angular
        .module('app', [
            'ngRoute',
            'ngCookies',
        ])
        .constant("API_CFG", _.get(window.OPENSHIFT_CONFIG, "api", {}))
        .constant("APIS_CFG", _.get(window.OPENSHIFT_CONFIG, "apis", {}))
        .constant("AUTH_CFG", _.get(window.OPENSHIFT_CONFIG, "auth", {}))
        .config(['$locationProvider', function($locationProvider) {

            $locationProvider.html5Mode(true);

        }])
        .config(['$routeProvider', '$locationProvider',function ($routeProvider, $locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
            });
            $routeProvider
                .when('/', {
                    controller: 'HomeController',
                    templateUrl: 'home/home.view.html',
                    controllerAs: 'vm'
                })

                .when('/login', {
                    controller: 'LoginController',
                    templateUrl: function(params) {
                        return 'login/login.view.html';
                    },
                    controllerAs: 'vm'
                })
                .when('/oauth', {
                    templateUrl: function(params) {
                        return 'controllers/oauth.html';
                    },
                    controller: 'OAuthController'
                })
                .when('/register', {
                    controller: 'RegisterController',
                    templateUrl: function(params) {
                        return 'register/register.view.html';
                    },
                    controllerAs: 'vm'
                })

                .otherwise({ redirectTo: '/' });


        }])
        .config(function($httpProvider, AuthServiceProvider, RedirectLoginServiceProvider, AUTH_CFG, API_CFG) {
            $httpProvider.interceptors.push('AuthInterceptor');

            AuthServiceProvider.LoginService('RedirectLoginService');
            AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
            // TODO: fall back to cookie store when localStorage is unavailable (see known issues at http://caniuse.com/#feat=namevalue-storage)
            AuthServiceProvider.UserStore('LocalStorageUserStore');

            RedirectLoginServiceProvider.OAuthClientID(AUTH_CFG.oauth_client_id);
            RedirectLoginServiceProvider.OAuthAuthorizeURI(AUTH_CFG.oauth_authorize_uri);
            console.log(AUTH_CFG.oauth_redirect_base);
            RedirectLoginServiceProvider.OAuthRedirectURI(URI(AUTH_CFG.oauth_redirect_base).segment("oauth").toString());


            // Configure the container terminal
            //kubernetesContainerSocketProvider.WebSocketFactory = "ContainerWebSocket";
        })
        .run(function run($rootScope, $location, $cookieStore, $http) {
            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};
            if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
            }

            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
                var loggedIn = $rootScope.globals.currentUser;
                if (restrictedPage && !loggedIn) {
                    $location.path('/login');
                }
            });
        });

    //config1.$inject = ['$routeProvider', '$locationProvider'];
    // function config1($routeProvider, $locationProvider) {
    //     $routeProvider
    //         .when('/', {
    //             controller: 'HomeController',
    //             templateUrl: 'home/home.view.html',
    //             controllerAs: 'vm'
    //         })
    //
    //         .when('/login', {
    //             controller: 'LoginController',
    //             templateUrl: 'login/login.view.html',
    //             controllerAs: 'vm'
    //         })
    //
    //         .when('/register', {
    //             controller: 'RegisterController',
    //             templateUrl: 'register/register.view.html',
    //             controllerAs: 'vm'
    //         })
    //
    //         .otherwise({ redirectTo: '/login' });
    // }
    //
    // function constants1() {
    //     "AUTH_CFG", _.get(window.OPENSHIFT_CONFIG, "auth", {})
    // }
    //
    // run1.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    // function run1($rootScope, $location, $cookieStore, $http) {
    //     // keep user logged in after page refresh
    //     $rootScope.globals = $cookieStore.get('globals') || {};
    //     if ($rootScope.globals.currentUser) {
    //         $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    //     }
    //
    //     $rootScope.$on('$locationChangeStart', function (event, next, current) {
    //         // redirect to login page if not logged in and trying to access a restricted page
    //         var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
    //         var loggedIn = $rootScope.globals.currentUser;
    //         if (restrictedPage && !loggedIn) {
    //             $location.path('/login');
    //         }
    //     });
    // }

})();