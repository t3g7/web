/* /something is not a url route of the API, it is the implementation
 * of socket.io namespaces.
 * http://socket.io/docs/#restricting-yourself-to-a-namespace
*/
var api = 'http://localhost:8080';
var tweets = io(api + '/tweets');
var freq = io(api + '/freq');
var trends = io(api + '/trends');

tweets.on('connect', function() {
  console.log("Connected");
});

tweets.on('tweets', function(data) {
  makeGraphsTweets(data);
});

freq.on('freq', function(data) {
  makeFreqGraph(data);
});

trends.on('trends', function(data) {
  makeListTrends(data);
});
