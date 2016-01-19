var w = 825;
var h = 240;
var padding = {top: 10, right: 40, bottom: 20, left: 20};

var formatDateUtc = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");

function makeGraphsTweets(data) {
  var color_hash = {
    0: ["Neutral","#1E88E5"],
    1: ["Positive","#4CAF50"],
    2: ["Negative","#E53935"]
  };

  var countPos = {};
  var countNeg = {};
  var countNeu = {};
  data.forEach(function(d) {
    var datetime = formatDateUtc.parse(d.created_at);
    var date = formatDateUtc(datetime).split('T')[0]
        + ' '
        + formatDateUtc(datetime).split('T')[1].split(':')[0]
        + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];

    countNeg[date] = 0;
    countPos[date] = 0;
    countNeu[date] = 0;
  });

  var count = {};
  var sentimentDict = {};
  data.forEach(function(d) {
    //var t = d.created_at.split(/[-T:]/);
    //var date = new Date(t[0], t[1], t[2], t[3], t[4]);

    var datetime = formatDateUtc.parse(d.created_at);
    var date = formatDateUtc(datetime).split('T')[0]
        + ' '
        + formatDateUtc(datetime).split('T')[1].split(':')[0]
        + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];
        //+ ':' + formatDateUtc(datetime).split('T')[1].split(':')[2];
    count[date] = (count[date]||0) + 1;

    var sentiment = d.sentiment;
    if (sentiment === "POSITIVE") {
      countPos[date] = (countPos[date]||0) + 1;
    } else if (sentiment === "NEGATIVE") {
      countNeg[date] = (countNeg[date]||0) + 1;
    } else if (sentiment === "NEUTRAL") {
      countNeu[date] = (countNeu[date]||0) + 1;
    }
  });

  var dataset = [
    d3.entries(countNeu).sort(function(a, b) {
      return new Date(a.key) - new Date(b.key);
    }),
    d3.entries(countPos).sort(function(a, b) {
      return new Date(a.key) - new Date(b.key);
    }),
    d3.entries(countNeg).sort(function(a, b) {
      return new Date(a.key) - new Date(b.key);
    })
  ];

  d3.layout.stack(dataset);

  var now = new Date(dataset[0][dataset[0].length - 1].key);
  //Set up scales
  var xScale = d3.time.scale()
    .domain([now.setMinutes(now.getMinutes() - 20), d3.time.minute.offset(new Date(dataset[0][dataset[0].length - 1].key), 1)])
    .rangeRound([0, w - padding.left - padding.right]);

  var yScale = d3.scale.linear()
    .domain([0,
      d3.max(dataset, function(d) {
        return d3.max(d, function(d) {
          return d.value;
        });
      })
    ])
    .range([h - padding.bottom - padding.top, 0]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(d3.time.minute, 1);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickFormat(d3.format("d"))
    .ticks(10);

  //Create SVG element
  var svg = d3.select("#bar")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // Add a group for each row of data
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter()
    .append("g")
    .attr("class", "rgroups")
    .attr("transform", "translate("+ padding.left + "," + (h - padding.bottom) +")")
    .style("fill", function(d, i) {
      return color_hash[dataset.indexOf(d)][1];
    });

  /*var tooltip = d3.select("body")
    .data(dataset)
    .enter().append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text(function(d) {
      console.log(d);
      //console.log(d[i].value);
      return d.value + " tweets";
    });*/

  // Add a rect for each data value
  var rects = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter()
    .append("rect")
    .attr("width", 2)
    .style("fill-opacity", 1e-6);
    /*.on("mouseover", function(){return tooltip.style("visibility", "visible");})
    .on("mousemove", function(){return tooltip.style("top",
    (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});*/

  rects.transition()
    .duration(function(d, i) {
      return 5 * i;
    })
    .ease("linear")
    .attr("x", function(d) {
      return xScale(new Date(d.key));
    })
    .attr("y", function(d) {
      return -( - yScale(d.value) - 210 + (h - padding.top - padding.bottom) * 2);
    })
    .attr("height", function(d) {
      return - yScale(d.value) + (h - padding.top - padding.bottom);
    })
    .attr("width", 15)
    .style("fill-opacity", 1);

  svg.append("g")
    .attr("class","x axis")
    .attr("transform","translate(20," + (h - padding.bottom) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class","y axis")
    .attr("transform","translate(" + padding.left + "," + padding.top + ")")
    .call(yAxis);

  // Add legend
  var legend = svg.append("g")
    .attr("class","legend")
    .attr("x", w - padding.right - 65)
    .attr("y", 25)
    .attr("height", 100)
    .attr("width", 100);

  legend.selectAll("g").data(dataset)
    .enter()
    .append('g')
    .each(function(d,i) {
      var g = d3.select(this);
      g.append("rect")
        .attr("x", w - padding.right - 90)
        .attr("y", i*25 + 10)
        .attr("width", 10)
        .attr("height",10)
        .style("fill",color_hash[String(i)][1]);

      g.append("text")
        .attr("x", w - padding.right - 75)
        .attr("y", i*25 + 20)
        .attr("height",30)
        .attr("width",100)
        .style("fill",color_hash[String(i)][1])
        .text(color_hash[String(i)][0]);
    });

  var log = [];
  for (var date in count) {
    if (count.hasOwnProperty(date)) {
      log.push({
        date: new Date(date),
        frequency: count[date],
        sentiment: sentimentDict[date]
      })
    }
  }

  log = log.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  var tweet_texts = [];
  data.forEach(function(d) {
    var datetime = formatDateUtc.parse(d.created_at);
    var date = formatDateUtc(datetime).split('T')[0]
        + ' '
        + formatDateUtc(datetime).split('T')[1].split(':')[0]
        + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];

    var body = d.body;
    var retweets = d.retweet_count;
    var sentiment = d.sentiment;

    if (tweet_texts.indexOf(body) == -1) {
      tweet_texts.push({
        body: body,
        date: new Date(date),
        retweets: retweets,
        sentiment: sentiment
      });
    }
  });

  tweet_texts = tweet_texts.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  /*d3.select('.tweets-log').append('ul').selectAll('li')
      .data(tweet_texts)
      .enter()
      .append('li')
      .html(function(d) {
          return d.body + " " + d.sentiment  + " " + d.retweets;
      });*/

  d3.select('.tweets-body').selectAll()
    .data(tweet_texts).enter()
    .append('tr')
    .html(function(d) {
      return '<td class="log-text mdl-data-table__cell--non-numeric">' + d.body + "</td><td>" + d.sentiment + "</td><td>" + d.retweets + "</td>";
    });

  /* x.domain(log.map(function (d) {
      return d.date;
  }));
  y.domain([0, d3.max(log, function (d) {
      return d.frequency;
  })]); */

  function type(d) {
    d.frequency = +d.frequency;
    return d;
  }
}

function makeListTrends(data) {
  var count = {};
  data.forEach(function(d) {
    var datetime = formatDateUtc.parse(d.date);
    var date = formatDateUtc(datetime).split('T')[0]
        + ' '
        + formatDateUtc(datetime).split('T')[1].split(':')[0]
        + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];
        //+ ':' + formatDateUtc(datetime).split('T')[1].split(':')[2];
    count[date] = (count[date]||0) + 1;
  });

  var hashtagsList = [];
  data.forEach(function(d) {
    var datetime = formatDateUtc.parse(d.date);
    var date = formatDateUtc(datetime).split('T')[0]
        + ' '
        + formatDateUtc(datetime).split('T')[1].split(':')[0]
        + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];

    var hashtags = [];
    for (var key in d.hashtags) {
      hashtags.push(key);
    }

    hashtagsList.push({
      hashtags: hashtags.toString().replace(/,/g, ' '),
      date: new Date(date)
    });
  });

  hashtagsList = hashtagsList.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  d3.select('.hashtags-list').selectAll()
    .data(hashtagsList).enter()
    .append('tr')
    .html(function(d) {
      return '<td class="log-text mdl-data-table__cell--non-numeric">' + d.hashtags + "</td><td>" + new Date(d.date).getHours() + ":" + (new Date(d.date).getMinutes()<10?'0':'') + new Date(d.date).getMinutes() + "</td>";
    });
}

function makeFreqGraph(data) {
  //var connectedHour = new Date("January 14, 2016 08:39:00 GMT+0100");
  var connectedHour = new Date().toISOString();
  var datetime = formatDateUtc.parse(connectedHour);
  var connectedHour = new Date(formatDateUtc(datetime).split('T')[0]
      + ' '
      + formatDateUtc(datetime).split('T')[1].split(':')[0]
      + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1]);

  var freqList = [];
  data.forEach(function(d) {
    var datetime = formatDateUtc.parse(d.date);
    var date = formatDateUtc(datetime).split('T')[0]
        + ' '
        + formatDateUtc(datetime).split('T')[1].split(':')[0]
        + ':' + formatDateUtc(datetime).split('T')[1].split(':')[1];

    freqList.push({
      freq: d.count,
      date: new Date(date)
    });
  });

  freqList = freqList.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var keyAtConnectedHour;
  for (var key in freqList) {
    if (connectedHour.getTime() <= freqList[key].date.getTime()) {
      keyAtConnectedHour = key;
    }
  }

  var countAtConnectedHour = +freqList[keyAtConnectedHour].freq;
  var lastCount = countAtConnectedHour;
  for (var i = 0; i < keyAtConnectedHour; i++) {
    lastCount += +freqList[i].freq;
  }

  d3.select('#freq').html(lastCount);
}
