/* /something is not a url route of the API, it is the implementation
 * of socket.io namespaces.
 * http://socket.io/docs/#restricting-yourself-to-a-namespace
*/
var api = 'http://localhost:8080';
var socket = io(api);
//var tweets = io(api + '/tweets');
//var freq = io(api + '/freq');
//var trends = io(api + '/trends');

socket.on('connect', function() {
  console.log("Connected");
});

socket.on('tweets', function(data) {
  makeGraphsTweets(data);
  // Workaround used because the NodeJS driver
  // for Cassandra is not really streaming data
  socket.emit('tweets-next', 'next');
});

socket.on('freq', function(data) {
  makeFreqGraph(data);
  socket.emit('freq-next', 'next');
});

socket.on('trends', function(data) {
  makeListTrends(data);
  socket.emit('trends-next', 'next');
});
