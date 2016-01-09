var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 1500 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var svg = d3.select(".tweets-freq-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var formatDateUtc = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");

d3.json('data.json', function(error, data) {
    //console.log(data);

    var count = {};
    //var count2 = [];
    data.forEach(function(d) {
        //var t = d.created_at.split(/[-T:]/);
        //var date = new Date(t[0], t[1], t[2], t[3], t[4]);

        var datetime = formatDateUtc.parse(d.created_at);
        var date = formatDateUtc(datetime).split('T')[0]
            + ' '
            + formatDateUtc(datetime).split('T')[1].split(':')[0]
            + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];
        //+ ':' + formatDateUtc(datetime).split('T')[1].split(':')[2];
        //count2.push(date);

        //console.log(date);
        count[date] = (count[date]||0) + 1;
    });

    /*console.log(count);

     count2 = count2.sort(function(a, b) {
     return new Date(a) - new Date(b);
     });

     var minDate = new Date(count2[0]).getTime();
     var maxDate = new Date(count2[count2.length - 1]).getTime();

     var count3 = [];
     var currentDate = minDate;
     var d;

     while (currentDate <= maxDate) {
     d = new Date(currentDate);
     count3.push(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes());
     currentDate += (60 * 1000);
     }*/

    var freq_data = [];
    for (var date in count) {
        if (count.hasOwnProperty(date)) {
            freq_data.push({
                date: new Date(date),
                frequency: count[date]
            })
        }
    }

    freq_data = freq_data.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    console.log(freq_data);

    var tweet_texts = [];
    data.forEach(function(d) {
        var body = d.body;
        var retweets = d.retweet_count;
        var favs = d.favorite_count;

        if (tweet_texts.indexOf(body) == -1) {
            tweet_texts.push({
                body: body,
                retweets: retweets,
                favs: favs
            });
        }
    });

    d3.select('.tweets-log').append('ul').selectAll('li')
        .data(tweet_texts)
        .enter()
        .append('li')
        .html(function(d) {
            return d.body + " " + d.favs + " " + d.retweets;
        });

    x.domain(freq_data.map(function (d) {
        return d.date;
    }));
    y.domain([0, d3.max(freq_data, function (d) {
        return d.frequency;
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(freq_data)
        .enter().append("rect")
        .attr("class", "bar")
        /*.attr("fill", function(d) {
         console.log(d.sentiment);
         if (d.sentiment === "POSITIVE") {
         return "green";
         } else if (d.sentiment === "NEUTRAL") {
         return "yellow";
         } else if (d.sentiment === "NEGATIVE") {
         return "red";
         } else {
         return "blue";
         }
         })*/
        .attr("x", function (d) {
            return x(d.date);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.frequency);
        })
        .attr("height", function (d) {
            return height - y(d.frequency);
        });

    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }
});
