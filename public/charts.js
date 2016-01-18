var w = 825;
var h = 240;
var padding = {top: 20, right: 40, bottom: 30, left: 20};

var formatDateUtc = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");

d3.json('data.json', function(error, data) {
  /*var color_hash = {
		0: ["Neutral","#3182BD"],
		1: ["Positive","#31A354"],
		2: ["Negative","#D61B1D"]
	};*/

  // material colors
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

  //Set up scales
	var xScale = d3.time.scale()
		  .domain([new Date(dataset[0][0].key), d3.time.minute.offset(new Date(dataset[0][dataset[0].length - 1].key), 8)])
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
				      .ticks(d3.time.minute, 2);

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
		  		.attr("x", w - padding.right - 65)
		  		.attr("y", i*25 + 10)
		  		.attr("width", 10)
		  		.attr("height",10)
		  		.style("fill",color_hash[String(i)][1]);

		  	g.append("text")
		  	 .attr("x", w - padding.right - 50)
		  	 .attr("y", i*25 + 20)
		  	 .attr("height",30)
		  	 .attr("width",100)
		  	 .style("fill",color_hash[String(i)][1])
		  	 .text(color_hash[String(i)][0]);
		  });

  var freq_data = [];
  for (var date in count) {
    if (count.hasOwnProperty(date)) {
      freq_data.push({
        date: new Date(date),
        frequency: count[date],
        sentiment: sentimentDict[date]
      })
    }
  }

  freq_data = freq_data.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  var tweet_texts = [];
  data.forEach(function(d) {
    var body = d.body;
    var retweets = d.retweet_count;
    var sentiment = d.sentiment;

    if (tweet_texts.indexOf(body) == -1) {
      tweet_texts.push({
        body: body,
        retweets: retweets,
        sentiment: sentiment
      });
    }
  });

  d3.select('.tweets-log').append('ul').selectAll('li')
      .data(tweet_texts)
      .enter()
      .append('li')
      .html(function(d) {
          return d.body + " " + d.sentiment  + " " + d.retweets;
      });

  d3.select('.tweets-body').selectAll('th')
      .data(tweet_texts).enter()
      .append('ul')
      .html(function(d) {
          return "<table class=\"mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp\"><thead><tr><th class=\"mdl-data-table__cell--non-numeric\">Text</th><th>Sentiment</th><th>Retweets</th></tr></thead><tbody><tr><td class=\"mdl-data-table__cell--non-numeric\">" + d.body + "</td><td>" + d.sentiment + "</td><td>" + d.retweets + "</td></tr></tbody></table>";
      });

  /* x.domain(freq_data.map(function (d) {
      return d.date;
  }));
  y.domain([0, d3.max(freq_data, function (d) {
      return d.frequency;
  })]); */

  function type(d) {
    d.frequency = +d.frequency;
    return d;
  }
});
