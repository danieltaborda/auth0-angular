var myApp = angular.module('myApp', [
  'ngCookies', 'auth0-redirect', 'ngRoute', 'authInterceptor'
]);

myApp.run(function ($rootScope, $location, $route, AUTH_EVENTS, $timeout, parseHash) {
  $rootScope.$on('$routeChangeError', function () {
    var otherwise = $route.routes && $route.routes.null && $route.routes.null.redirectTo;
    // Access denied to a route, redirect to otherwise
    $timeout(function () {
      $location.path(otherwise);
    });
  });

  $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
    // TODO Handle when login succeeds
    $location.path('/');
  });
  $rootScope.$on(AUTH_EVENTS.loginFailure, function () {
    // TODO Handle when login fails
    window.alert('login failed');
  });

  parseHash();
});

function isAuthenticated($q, auth) {
  var deferred = $q.defer();
  auth.loaded.then(function () {
    if (auth.isAuthenticated) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  });
  return deferred.promise;
}

myApp.config(function ($routeProvider, authProvider, $httpProvider) {
  $routeProvider
  .when('/logout',  {
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .when('/login',   {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    /* isAuthenticated will prevent user access to forbidden routes */
    resolve: { isAuthenticated: isAuthenticated }
  })
  .otherwise({ redirectTo: '/login' });

  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    // TODO Replace with your callback URL, i.e. http://localhost:1337/widget
    callbackURL: document.location.href
  });

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might 
  // want to check the delegation-token example
  $httpProvider.interceptors.push('authInterceptor');
});
