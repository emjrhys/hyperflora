var videoRef = new Firebase('http://hyperflora.firebaseio.com');

videoRef.once("value", function(snapshot) {
  console.log(snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

