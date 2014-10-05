/**
 * Contains functions that are added to the root AngularJs scope.
 */
angular.module('loginApp').run(function($rootScope, $state, Auth, AUTH_EVENTS) {
	
	//before each state change, check if the user is logged in
	//and authorized to move onto the next state
	$rootScope.$on('$stateChangeStart', function (event, next) {
	    var authorizedRoles = next.data.authorizedRoles;
	    if (!Auth.isAuthorized(authorizedRoles)) {
	      event.preventDefault();
	      if (Auth.isAuthenticated()) {
	        // user is not allowed
	        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
	      } else {
	        // user is not logged in
	        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
	      }
	    }
	  });
	
	/* To show current active state on menu */
	$rootScope.getClass = function(path) {
		if ($state.current.name == path) {
			return "active";
		} else {
			return "";
		}
	}
	
	$rootScope.logout = function(){
		Auth.logout();
	};

});