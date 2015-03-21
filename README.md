ng-login
========

Plunker: http://plnkr.co/edit/Mvrte4

This code was created to sum all authentication suggestions I gathered from my research. I also added the $modal service of UI Bootstrap, for the login procedure to be smoother for the end-user. A login/authentication logic on an Angular JS application is provided, along with authorization per route given some user roles. It is mainly based on those 3 articles (mostly the 1st), with my addition of a modal login window, using the UI Bootstrap $modal service: 

1) https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec

2) http://www.sitepoint.com/implementing-authentication-angular-applications/

3) http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/

To store the data locally for the user to be able to refresh the page I use $window.sessionStorage, which is provided by every browser(even IE9!) and is erased when the browser is closed. Logic goes like this:

**(1) app.js:** Creation of authentication constants on app definition
```javascript
var loginApp = angular.module('loginApp', ['ui.router', 'ui.bootstrap'])
/*Constants regarding user login defined here*/
.constant('USER_ROLES', {
	all : '*',
	admin : 'admin',
	editor : 'editor',
	guest : 'guest'
}).constant('AUTH_EVENTS', {
	loginSuccess : 'auth-login-success',
	loginFailed : 'auth-login-failed',
	logoutSuccess : 'auth-logout-success',
	sessionTimeout : 'auth-session-timeout',
	notAuthenticated : 'auth-not-authenticated',
	notAuthorized : 'auth-not-authorized'
})
```
**(2) Auth Service:** All following functions are implemented in auth.js service. The $http service is used to communicate with the server for the authentication procedures. Also contains functions on authorization, that is if the user is allowed to perform a certain action.
```javascript
angular.module('loginApp')
.factory('Auth', [ '$http', '$rootScope', '$window', 'Session', 'AUTH_EVENTS', 
function($http, $rootScope, $window, Session, AUTH_EVENTS) {

authService.login() = [...]
authService.isAuthenticated() = [...]
authService.isAuthorized() = [...]
authService.logout() = [...]

return authService;
} ]);
```
**(3) Session:** A singleton to keep user data. The implementation here depends on you. 
```javascript
angular.module('loginApp').service('Session', function($rootScope, USER_ROLES) {

	this.create = function(user) {
		this.user = user;
		this.userRole = user.userRole;
	};
	this.destroy = function() {
		this.user = null;
		this.userRole = null;
	};
	return this;
});
```
**(4) Parent controller:** Consider this as the "main" function of your application, all controllers inherit from this controller, and it's the backbone of the authentication of this app. 
```html
<body ng-controller="ParentController">
[...]
</body>
```
**(5) Access control:** To deny access on certain routes 2 steps have to be implemented:

a) Add data of the roles allowed to access each route, on ui router's $stateProvider service as can be seen below (same can work for ngRoute). 
```javascript
.config(function ($stateProvider, USER_ROLES) {
  $stateProvider.state('dashboard', {
    url: '/dashboard',
    templateUrl: 'dashboard/index.html',
    data: {
      authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
    }
  });
})
```
b) On $rootScope.$on('$stateChangeStart') add the function to prevent state change if the user is not authorized. 
```javascript
$rootScope.$on('$stateChangeStart', function (event, next) {
    var authorizedRoles = next.data.authorizedRoles;
    if (!Auth.isAuthorized(authorizedRoles)) {
      event.preventDefault();
      if (Auth.isAuthenticated()) {
        // user is not allowed
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      } else {d
        // user is not logged in
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
});
```
**(6) Auth interceptor:** This is implemented, but can't be checked on the scope of this code. After each $http request, this interceptor checks the status code, if one of the below is returned, then it broadcasts an event to force the user to log-in again.
```javascript
angular.module('loginApp')
.factory('AuthInterceptor', [ '$rootScope', '$q', 'Session', 'AUTH_EVENTS',
function($rootScope, $q, Session, AUTH_EVENTS) {
	return {
		responseError : function(response) {
			$rootScope.$broadcast({
				401 : AUTH_EVENTS.notAuthenticated,
				403 : AUTH_EVENTS.notAuthorized,
				419 : AUTH_EVENTS.sessionTimeout,
				440 : AUTH_EVENTS.sessionTimeout
			}[response.status], response);
			return $q.reject(response);
		}
	};
} ]);
```

**P.S.** A bug with the form data autofill as stated on the 1st article can be easily avoided by adding the directive that is included in directives.js. 

**P.S.2** This code can be easily tweaked by the user, to allow different routes to be seen, or display content that was not meant to be displayed. The logic MUST be implemented server-side, this is just a way to show things properly on your ng-app.
