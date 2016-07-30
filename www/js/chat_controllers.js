angular.module('starter.controllers')

.controller('ChatsCtrl', function($scope, $ionicPopup, Voting) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //});

	$scope.code   = [];
	$scope.data   = [];
	$scope.chats  = Voting.all();

	$scope.remove = function (channel) {
		Voting.remove(channel);
	}

   $scope.showPopup = function() {
      
      // Custom popup
      var myPopup = $ionicPopup.show({
         template: '<input type = "text" name="code" ng-model = "data.code">',
         title: 'Votação',
         subTitle: 'Digite o nome da votação:',
         scope: $scope,
			
         buttons: [
            { text: 'Cancelar' }, {
               text: '<b>inscrever-se</b>',
               type: 'button-positive',
                  onTap: function(e) {
						
                     if (!$scope.data.code) {
                        //don't allow the user to close unless he enters model...
                           e.preventDefault();
                     } else {
						 var res = $scope.data.code;
						 
						 // se inscreve na votação
						 console.log("/Coletivo_"+res);
						 $scope.mqtt_client.subscribe("/Coletivo_"+res);
						 Voting.add(res);

						 // avisa ao mestre
						 message = new Paho.MQTT.Message("p:new_v:" + res);
						 console.log(message.payloadString);
						 message.destinationName = "Coletivo_" + res;
						 $scope.mqtt_client.send(message);

                     	 return $scope.data.code;
                     }
                  }
            }
         ]
      });
   };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicPopup, Voting) {
	$scope.chat = Voting.get($stateParams.chatId);

	$scope.vote = function (option) {
		if ($scope.chat.vote === true) {
			var message = new Paho.MQTT.Message("p:" + $scope.chat.name + ":" + option);
			message.destinationName = "/Coletivo_" + $scope.chat.name;
			$scope.mqtt_client.send(message);	
			$scope.chat.vote = false;
			console.log("votou!");
		}
	}

	$scope.showConfirm = function(option) {
	   var confirmPopup = $ionicPopup.confirm({
		 title: option,
		 template: 'tem certeza de que deseja votar nessa opção?'
	   });

	   confirmPopup.then(function(res) {
		 if(res)
			 $scope.vote(option);
	   });
	 };
});
