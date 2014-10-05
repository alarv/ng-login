'use strict';

angular.module('loginApp')
.controller('LoginCtrl', [ '$scope', '$state', '$modalInstance' , '$window', 'Auth', 
function($scope, $state, $modalInstance, $window, Auth ) {
	$scope.credentials = {};
	$scope.loginForm = {};
	$scope.error = false;
	
	//when the form is submitted
	$scope.submit = function() {
		$scope.submitted = true;
		if (!$scope.loginForm.$invalid) {
			$scope.login($scope.credentials);
		} else {
			$scope.error = true;
			return;
		}
	};

	//Performs the login function, by sending a request to the server with the Auth service
	$scope.login = function(credentials) {
		$scope.error = false;
		Auth.login(credentials, function(user) {
			//success function
			$modalInstance.close();
			$state.go('home');
		}, function(err) {
			console.log("error");
			$scope.error = true;
		});
	};
	
	// if a session exists for current user (page was refreshed)
	// log him in again
	if ($window.sessionStorage["userInfo"]) {
		var credentials = JSON.parse($window.sessionStorage["userInfo"]);
		$scope.login(credentials);
	}

} ]);
