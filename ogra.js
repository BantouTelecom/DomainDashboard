/*

OGRA JS library

Author: Opi Danihelka (jan.danihelka@nic.cz)

Developed by: CZ.NIC Labs 2013 (https://labs.nic.cz)

*/

function OGRA () {
    
    this.URL_JQUERY = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
    this.URL_GOOGLE = "https://www.google.com/jsapi";
    this.URL_DYGRAPHS = "http://dygraphs.com/dygraph-combined.js";
    this.URL_HIGH = "http://code.highcharts.com/highcharts.src.js";
    //this.URL_FLOT = "https://raw.github.com/flot/flot/master/jquery.flot.js";
    this.URL_FLOT = "https://raw.github.com/paradoxxxzero/flot/28f2377382b3af97c82cb3ebc081140b49fa9579/jquery.flot.js";
    this.URL_FLOT_PIE = "https://raw.github.com/flot/flot/master/jquery.flot.pie.js";

    // TODO
    //this.URL_FLOT = "http://www.benjaminbuffet.com/public/js/jquery.flot.js";
    //this.URL_FLOT_BAR = "http://www.benjaminbuffet.com/public/js/jquery.flot.orderBars.js";

    
    // list of already imported libraries
    this.imported = {};
    
    if (typeof(google) == 'undefined') {
        this.imported["google"] = false;
    } else {
        this.imported["google"] = true;
    }

    if (typeof(Dygraph) == 'undefined') {
        this.imported["dygraphs"] = false;
    } else {
        this.imported["dygraphs"] = true;
    }
    
    if (typeof(Highcharts) == 'undefined') {
        this.imported["high"] = false;
    } else {
        this.imported["high"] = true;
    }
    
    this.imported["flot"] = false;
    
    // check if jQuery is imported
    if (typeof(jQuery) == 'undefined') {
        this.imported["jquery"] = false;
    } else {
        this.imported["jquery"] = true;
        if (typeof(jQuery.plot) != 'undefined') {
            this.imported["flot"] = true;
        }
    }
        

    this.retry_time = 50;
    
    // graphs waiting for importing of graphics library
    this.waiting = [];
    
}

// Something goes wrong...
OGRA.prototype.error = function(msg, elem_id) {
    //console.log("OGRA Error: " + msg);
    
    if (elem_id == null) {
        return;
    }
    
    var element = document.getElementById(elem_id);
    var message = document.createElement('p');
    message.style.color = '#fff';
    message.style.background = '#c00';
    message.style.position = 'relative';
    message.style.top = '0px';
    message.style.textAlign = 'left'; 
    message.appendChild(document.createTextNode("OGRA Error: " + msg));
    
    element.insertBefore(message, element.firstChild);
    
    this.remove_loading(element);
}

// Importing external libraries, requested for creating graphs.
OGRA.prototype.import = function(type) {
    if (type == null) {
        this.import_google();
    } else if (type == "google") {
        this.import_google();
    } else if (type == "dygraphs") {
        this.import_dygraphs();
    } else if (type == "high") {
        this.import_high();
    } else if (type == "flot") {
        this.import_flot();
    } else if (type == "jquery") {
        this.import_jquery();
    } else {
        return false;
    }
}

OGRA.prototype.import_google = function() {
    
    if (this.imported["google"]) {
        return true;
    }
    
    //console.log("Loading: Google API");
    
    var script = document.createElement('script');
    script.setAttribute('src', this.URL_GOOGLE);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);
    
    var that = this;
    
    var run_import_google = function() {
        if (typeof(google) == 'undefined') {
            setTimeout( run_import_google, this.retry_time);
        } else {
            for (i = 0; i < that.waiting.length; i++) {
                that.graph_google(that.waiting[i][0], that.waiting[i][1], that.waiting[i][2], that.waiting[i][3]);
            }
            that.waiting = [];
        }
    }
    
    run_import_google();
    
    this.imported["google"] = true;
}

OGRA.prototype.import_google_lib = function(args) {
    
    //console.log("Loading: ", args);
    
    var that = this;

    // callback to fix google bug
    args[2]["callback"] = function() { for (i = 0; i < that.waiting.length; i++) { that.graph_google(that.waiting[i][0], that.waiting[i][1], that.waiting[i][2], that.waiting[i][3]);} that.waiting = [];};
    google.load.apply(null, args);

    // just for sure check 
    setTimeout(function() {
        for (i = 0; i < that.waiting.length; i++) { that.graph_google(that.waiting[i][0], that.waiting[i][1], that.waiting[i][2], that.waiting[i][3]);} that.waiting = [];
    }, this.retry_time);
    
    this.imported[String(args)] = true; 

}

OGRA.prototype.import_dygraphs = function() {
    
    if (this.imported["dygraphs"]) {
        return true;
    }

    //console.log("Loading: Dygraphs API");

    var script = document.createElement('script');
    script.setAttribute('src', this.URL_DYGRAPHS);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);
    
    this.imported["dygraphs"] = true;
}

OGRA.prototype.import_high = function() {

    if (this.imported["high"]) {
        return true;
    }
    
    // import jQuery
    if (this.imported["jquery"] == false) {
        this.import("jquery");
    }
    
    if (typeof(jQuery) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.import_high();
        }, this.retry_time);
        return;
    }
    
    //console.log("Loading: HighCharts API");
    
    var script = document.createElement('script');
    script.setAttribute('src', this.URL_HIGH);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);
    
    this.imported["high"] = true;
}

OGRA.prototype.import_flot = function() {

    if (this.imported["flot"]) {
        return true;
    }
    
    //console.log("Loading: Flot Charts API");
    
    // import jQuery
    if (this.imported["jquery"] == false) {
        this.import("jquery");
    }

    var script = document.createElement('script');
    script.setAttribute('src', this.URL_FLOT);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);
    
    var script = document.createElement('script');
    script.setAttribute('src', this.URL_FLOT_PIE);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);
    
    this.imported["flot"] = true;
}

// jQuery import
OGRA.prototype.import_jquery = function() {

    if (this.imported["jquery"]) {
        return true;
    }
    
    //console.log("Loading: jQuery");
    
    var script = document.createElement('script');
    script.setAttribute('src', this.URL_JQUERY);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);
    
    this.imported["jquery"] = true;
}

// Converts data from OGRA format to Google charts format.
OGRA.prototype.data_google = function(data) {
    
    var result = data;
    return result;
}

// Converts data from OGRA format to DyGraphs format.
OGRA.prototype.data_dygraphs = function(data) {
    
	// date data
	var dd = false;
	
	for (var c = 0; c < data["cols"].length; c++) {
		if (data["cols"][c]["type"] == "date") {
			dd = true;
			break;
		}
	}
	
	if (dd == false) {
		// no datetime series for Dygraphs -> wrong data
		return false;
	}
        
    var result = "";

    for (var c in data["cols"]) {
        result += data["cols"][c]["label"] + ",";
    }
    result += "\n";

    for (var r in data["rows"]) {
        for (var v in data["rows"][r]["c"]) {
			
			// datetime data
			if (dd && v == 0) {
				var myDate = data["rows"][r]["c"][v]["v"];
				if ( typeof(myDate) == 'string' ) {
					myDate = eval('new ' + myDate);
				}
				
				result += myDate + ",";
			} else {
				result += data["rows"][r]["c"][v]["v"] + ",";
			}
        }
        result += "\n";
    }
    
    return result;
}

// Converts data from OGRA format to Highcharts format.
OGRA.prototype.data_high = function(data, chart_type) {
    
    var result = [];
    var xLabels = [];
    xLabels.type = undefined;
    
    // exception for pie chart
    if (chart_type == "pie") {
        
        // check validity
        if (data["cols"].length > 2) {
            return false;
        }
        
        for (var c = 1; c < data["cols"].length; c++) {
            result.push({'name': data["cols"][c]["label"], 'data': []});
        }
        
        for (var r in data["rows"]) {
            result[0]['data'].push([])
            for (var v = 0; v < data["rows"][r]["c"].length; v++) {
                result[0]['data'][r].push(data["rows"][r]["c"][v]["v"]);
            }
        }
    } else {
        // date data
        var dd = false;
        
        for (var c = 0; c < data["cols"].length; c++) {
            if (data["cols"][c]["type"] != "date") {
                if (c != 0) {
                    result.push({'name': data["cols"][c]["label"], 'data': []});
                }
            } else {
                dd = true;
            }
        }
        
        for (var r in data["rows"]) {
            for (var v = 1; v < data["rows"][r]["c"].length; v++) {
                if ( dd == false && v == 1 ) {
                    xLabels.push( data["rows"][r]["c"][0]["v"] );
                }
                
                if (dd) {
                    xLabels.type = 'datetime';
					var myDate = data["rows"][r]["c"][0]["v"];
					if ( typeof(myDate) == 'string' ) {
						myDate = eval('new ' + myDate);
					}
					myDate = myDate.getTime()
					
                    result[v-1]['data'].push([ myDate, data["rows"][r]["c"][v]["v"] ]);
                } else {
                    result[v-1]['data'].push(data["rows"][r]["c"][v]["v"]);
                }
            }
        }
    }
    
    return {"result": result, "xLabels": xLabels};
}


// Converts data from OGRA format to Highcharts format.
OGRA.prototype.data_flot = function(data, chart_type) {
    
    var result = [];
    var xLabels = [];
    
    if (chart_type == "pie") {
        // check validity
        if (data["cols"].length > 2) {
            return false;
        }
        
        for (var r in data["rows"]) {
            result.push( {label: data["rows"][r]["c"][0]["v"], data: data["rows"][r]["c"][1]["v"]} );
        }
        
    } else {
        //
        for (var c = 1; c < data["cols"].length; c++) {
            result.push({'label': data["cols"][c]["label"], 'data': []});
        }

        
        for (var r in data["rows"]) {
            xLabels.push([r, data["rows"][r]["c"][0]["v"] ]);
            for (var v = 1; v < data["rows"][r]["c"].length; v++) {
                // good
                result[v-1]['data'].push([ r*1, data["rows"][r]["c"][v]["v"] ]);
            }
        }
    }

    return {"result": result, "xLabels": xLabels};
}


// New graph is created from given data and inserted into html element specified by id.
OGRA.prototype.graph = function(elem_id, data, chart_type, type, options) {
    
    // check existence of element - elem_id
    var element = document.getElementById(elem_id);
    if (element == null) {
        this.error('Invalid ID. Element "' + elem_id + '" not found.', null);
        return false;
    }
    
    // check if type of chart and chart library is supported
    var check = this.checkSupportedType(type, chart_type)
    
    if (check == 1) {
        this.error('Unsupported chart type "' + chart_type + '" for chart library "' + type + '".', elem_id);
        return false;
    } else if (check == 2) {
        this.error('Invalid name of chart library "' + type + '".', elem_id);
        return false;
    }
    
    // add loading gif
    this.add_loading(element);

    // OGRA data format / url for Ajax
    if (typeof(data) == "string") {
        this.graph_ajax(elem_id, data, chart_type, type, options);
        return true;
    } else if (typeof(data) != "object") {
        this.error("Bad data type of input data.", elem_id);
        return false;
    }
    
    // options
    if (options == undefined) {
        options = {};
    }
    
    if (options.width == undefined) {
        element.style.width = element.offsetWidth;
        if (element.offsetWidth == 0) {
            element.style.width = '400px';
        }
        options.width = element.offsetWidth;
    }
    
    if (options.height == undefined) {
        element.style.height = element.offsetHeight;
        if (element.offsetHeight == 0) {
            element.style.height = '300px';
        }
        options.height = element.offsetHeight;
    }
    
    // do graph
    if (type == null || type == "google") {
        this.graph_google(elem_id, data, chart_type, options);
    } else if (type == "dygraphs") {
        this.graph_dygraphs(elem_id, data, chart_type, options);
    } else if (type == "high") {
        this.graph_high(elem_id, data, chart_type, options);
    } else if (type == "flot") {
        this.graph_flot(elem_id, data, chart_type, options);
    }
    
}

OGRA.prototype.checkSupportedType = function(type, chart_type) {
    
    if (type == null) {
        type = "google";
    }
    
    var supported_types_list = {
        "google":["line", "pie", "column", "bar", "table",],
        "dygraphs":["line",],
        "high":["line", "pie", "column", "bar",],
        "flot":["line", "pie", "column",],
    };
    
    var supported_types = supported_types_list[type];
    if (supported_types == null) {
        return 2;
    }
    
    for (var i = 0; i < supported_types.length; i++) {
        if (chart_type == supported_types[i]) {
            break;
        }
        
        if (i == supported_types.length-1) {
            return 1;
        }
    }
    return 0;
}

OGRA.prototype.graph_google = function(elem_id, data, chart_type, options) {
        
    // import Google Charts
    if (this.imported["google"] == false) {
        this.waiting.push([elem_id, data, chart_type, options]);
        this.import_google();
        
        var that = this;
        return;
    }
    
    if (typeof(google) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.graph_google(elem_id, data, chart_type, options);
        }, this.retry_time);
        return;
    }
    
    if (this.imported[String(["visualization", "1", {packages:["corechart, table"]}])] == undefined) {
        this.waiting.push([elem_id, data, chart_type, options]);
        this.import_google_lib(["visualization", "1", {packages:["corechart, table"]}]);
        return;
    }
    
    // putting data to current format
    // In case of wrong format Google charts will handle and display error.
    var d = this.data_google(data);
    
    // getting element
    var element = document.getElementById(elem_id);
    
    if (typeof(google.visualization) == 'undefined' || typeof(google.visualization.DataTable) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.graph_google(elem_id, data, chart_type, options);
        }, this.retry_time);
        return;
    }
    
    // creating graph
    var dt = new google.visualization.DataTable(d);
    
    // options
    if (options.legend == undefined) {
        options.legend = {};
        options.legend.position = "right";
    }
    
    if (chart_type == "line") {
        var chart = new google.visualization.LineChart(element);
    } else if (chart_type == "pie") {
        var chart = new google.visualization.PieChart(element);
    } else if (chart_type == "column") {
        var chart = new google.visualization.ColumnChart(element);
    } else if (chart_type == "bar") {
        var chart = new google.visualization.BarChart(element);
    } else if (chart_type == "table") {
        var chart = new google.visualization.Table(element);
    }
    
    // remove loading
    this.remove_loading(element);
    
    // draw graph
    chart.draw(dt, options);

    // callback
    if ( typeof(options.callback) == "function" && typeof(options.callback_args) == "object") {
        options.callback.apply(undefined, options.callback_args);
    }

    return true;
}

OGRA.prototype.graph_dygraphs = function(elem_id, data, chart_type, options) {
    
    // import Dygraphs
    if (this.imported["dygraphs"] == false) {
        this.import_dygraphs();
    }
    
    if (typeof(Dygraph) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.graph_dygraphs(elem_id, data, chart_type, options);
        }, this.retry_time);
        return;
    }
    
    // putting data to current format
    var d = this.data_dygraphs(data);
    if (d == false) {
        this.error("Invalid data format for chart 'Dygraphs - " + chart_type + "'.", elem_id);
        return false;
    }
    
    // getting element
    var element = document.getElementById(elem_id);
    
    // remove loading
    this.remove_loading(element);
    
    // creating graph
    new Dygraph.GVizChart(element).draw(d, {title: options.title, colors: options.colors, width: options.width, height: options.height});
    
    // callback
    if ( typeof(options.callback) == "function" && typeof(options.callback_args) == "object") {
        options.callback.apply(undefined, options.callback_args);
    }
    
    return true;
}

OGRA.prototype.graph_high = function(elem_id, data, chart_type, options) {
    
    // import HighCharts
    if (this.imported["high"] == false) {
        this.import_high();
    }
    
    if (typeof(Highcharts) == 'undefined' || typeof(jQuery) == 'undefined' || typeof(Highcharts.Chart) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.graph_high(elem_id, data, chart_type, options);
        }, this.retry_time);
        return;
    }
    
    // putting data to current format
    var high_format = this.data_high(data, chart_type);

    if (high_format == false) {
        this.error("Invalid data format for chart 'Highcharts - " + chart_type + "'.", elem_id);
        return false;
    }
    
    var d = high_format.result;
    var xLabels = high_format.xLabels;
    
    xLabels.align = 'right';
    
	// options
    if (options == undefined) {
        options = {};
    }
    if (options.title == undefined) {
        options.title = '';
    }
    if (options.vAxis == undefined) {
        options.vAxis = {};
    }
    if (options.vAxis.title == undefined) {
        options.vAxis.title = '';
    }
	
	// legent style
	if (options.hAxis == undefined || options.hAxis.textStyle == undefined) {
		font_style = { font: '11px Trebuchet MS, Verdana, sans-serif' };
		font_size = 11;
	} else {
		font_style = {};
		if (options.hAxis.textStyle.color != undefined) {
			font_style.color = options.hAxis.textStyle.color;
		}
		
		if (options.hAxis.textStyle.fontSize != undefined) {
			font_style.font = options.hAxis.textStyle.fontSize + "px ";
			font_size = options.hAxis.textStyle.fontSize;
		} else {
			font_size = 11;
		}
		
		if (options.hAxis.textStyle.fontName != undefined) {
			if (font_style.font != undefined) {
				font_style.font += options.hAxis.textStyle.fontName;
			} else {
				font_style.font = '11px ' + options.hAxis.textStyle.fontName;
			}
		} else {
			if (font_style.font != undefined) {
				font_style.font += 'Trebuchet MS, Verdana, sans-serif';
			}
		}
	}

    // auto rotated labels
    if (chart_type == "column" || chart_type == "line") {
        var longest_label = 0;
        for (var i = 0; i<data["rows"].length; i++) {
            longest_label = Math.max(longest_label, (data["rows"][i]["c"][0]["v"] + "").length);
        }
        
        if (options.width / data["rows"].length < longest_label*font_size) {
            xLabels.rotation = -45;
            xLabels.align = 'right';
        } else {
            xLabels.rotation = 0;
            xLabels.align = 'center';
        }
    }
    
    var is_date = true;
    
	categories = false;
	
    // time data
    if (typeof(xLabels.type) == 'undefined') {
        is_date = false;
        xLabels.type = 'linear';
        categories = xLabels;
    } else if (chart_type == "column" || chart_type == "line") {
        xLabels.rotation = 0;
        xLabels.align = 'center';
    }
    
    // reducing density of labels
    if (options.width/xLabels.length < 20) {
        var skip_step = 2;
        
        if (options.width/xLabels.length < 10) {
            skip_step = 3;
        }
    }
    
    // display marker on line
    var marker_enable = true;
    for (var i = 0; i < d.length; i++) {
		if (d[i].data.length > 80) {
			marker_enable = false;
			break;
		}
	}

    // getting element
    var element = document.getElementById(elem_id);
    
    // logarithmic scale
    var vAxis_type = 'linear';
    if (options.vAxis.logScale != undefined && options.vAxis.logScale == true) {
        vAxis_type = 'logarithmic';
        // removing zero and subzero values from data set
        for (var i = 0; i < d.length; i++) {
            for (var j = 0; j < d[i].data.length; j++) {
                if ( d[i].data[j] <= 0) {
                    d[i].data[j] = null;
                }
            }
        }
    }
    
    if (options.hAxis == undefined) {
        options.hAxis = {};
    }
    if (options.hAxis.title == undefined) {
        options.hAxis.title = '';
    }
    
    
    show_legend = true;
    if (d.length < 2) {
        show_legend = false;
    }
    
    legend_layout = 'vertical';
    legend_align = 'right';
    legend_verticalAlign = 'middle';
    
    if (options.width < 550) {
        legend_layout = 'horizontal';
        legend_align = 'center';
        legend_verticalAlign = 'bottom';
    }

    // remove loading
    this.remove_loading(element);
    
    // time data axis format

    if (options.dateTimeLabelFormats == undefined) {
        options.dateTimeLabelFormats = {
            //default
            millisecond: '%H:%M:%S',
            second: '%H:%M:%S',
            minute: '%H:%M',
            hour: '%H:%M',
            day: '%e. %b',
            week: '%e. %b',
            month: '%b \'%y',
            year: '%Y'
        };
    }
    
    // localization setting
    if (options.lang != undefined) {
        Highcharts.setOptions({
            lang: options.lang
        });
    }
    
    // x axis label
    var xaxis_label = undefined;
    if (xLabels.type != "datetime" && xLabels.rotation != 0) {
        xaxis_label = function() {
            wrap_edge = 19*font_size/11;
            if (options.height/this.value.length < wrap_edge) {
                return this.value.substr(0, Math.floor(options.height/wrap_edge -5) ) + "...";
            } else {
                return this.value;
            }
        }
    }
    
    // column datetime chart with only one entry
    var min_range = undefined;
    var point_range = undefined;
    
    if (typeof(options.hAxis.viewWindow) != 'undefined') {
        if (typeof(options.hAxis.viewWindow.max) != 'undefined' && typeof(options.hAxis.viewWindow.min) != 'undefined') {
            if (d[0].data.length == 1) {
                min_range = options.hAxis.viewWindow.max-options.hAxis.viewWindow.min;
                point_range = (options.hAxis.viewWindow.max-options.hAxis.viewWindow.min) /2;
                
                options.dateTimeLabelFormats = {
                    millisecond: ' ',
                    second: ' ',
                    minute: ' ',
                    hour: ' ',
                    day: '%e. %b',
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                };
            }
        }
    }
    
    // stacking
    var stacking = null;
    if (typeof(options.isStacked) != 'undefined') {
        if (options.isStacked == true) {
            stacking = 'normal';
        }
    }
    
    // set correct time zone
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    
    
    // creating graph
    chart = new Highcharts.Chart({
        chart: {
            renderTo: element,
            type: chart_type,
            width: options.width,
            height: options.height,
        },
        colors: options.colors,
        credits: {
            enabled: false,
        },
        legend: {
            enabled: show_legend,
            layout: legend_layout,
            align: legend_align,
            verticalAlign: legend_verticalAlign,
        },
        title: {
            text: options.title
        },
        xAxis: {
            minRange: min_range,
            type: xLabels.type,
            title: {
                text: options.hAxis.title
            },
            categories: categories,
            labels: {
                rotation: xLabels.rotation,
                align: xLabels.align,
                step: skip_step,
                formatter: xaxis_label,
				style: font_style
            },
            dateTimeLabelFormats: options.dateTimeLabelFormats,
        },
        yAxis: {
            type: vAxis_type,
            title: {
                text: options.vAxis.title
            },
			labels: {
				style: font_style
            },
        },
        tooltip: {
            formatter: function() {
                if (chart_type == "pie") {
                    return '<b>'+ this.point.name +'</b>: '+ this.y;
                }
                
                if (is_date) {
                    var dd = new Date();
                    dd.setTime(this.x);
                    
                    return dd.getDate() + ". " + (dd.getMonth()+1) + ". " + dd.getFullYear() + '<br/>' + '<b>'+ this.series.name +'</b>: '+ this.y;
                }
                
                return '<b>' + this.x +'</b>' + '<br/>' + this.series.name + ': ' + this.y;
            }
        },
        plotOptions: {
            column : {
                pointRange: point_range,
            },
            line: {
                marker: {
                    enabled: marker_enable
                }
            },
            series: {
                stacking: stacking,
                animation: {
                    duration: options.animation_duration
                }
            }
        },
        series: d
    });
    
    // callback
    if ( typeof(options.callback) == "function" && typeof(options.callback_args) == "object" ) {
        options.callback.apply(undefined, options.callback_args);
    }
    
    return true;
}

OGRA.prototype.graph_flot = function(elem_id, data, chart_type, options) {
    
    // import Flot charts
    if (this.imported["flot"] == false) {
        this.import_flot();
    }
    
    if (typeof(jQuery) == 'undefined' || typeof(jQuery.plot) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.graph_flot(elem_id, data, chart_type, options);
        }, this.retry_time);
        return;
    }
    
    // putting data to current format
    var flot_format = this.data_flot(data, chart_type);
    
    if (flot_format == false) {
        this.error("Invalid data format for chart 'Flot - " + chart_type + "'.", elem_id);
        return false;
    }
    
    var d = flot_format.result;
    var xLabels = flot_format.xLabels;
    
    // getting element
    var element = document.getElementById(elem_id);
    
    // options
    if (options == undefined) {
        options = {};
    }
    if (options.title == undefined) {
        options.title = '';
    }
    
    // remove loading
    this.remove_loading(element);
    
    // creating graph
    
    if (chart_type == "column" || chart_type == "bar") {
        // bar & column
        for (var i = 0; i < d.length; i++) {
            d[i].bars = {show: true, barWidth: 0.3, align: "center"};
            //TODO bug - bar chart with multiple series 
            //d[i].bars = {order: 0, show: true, barWidth: 0.3, align: "center"};
            //d[i].multiplebars = true;
        }
        
        jQuery.plot(element, d, {xaxis: {labelAngle: 45, ticks: xLabels}, colors: options.colors} );
    } else if (chart_type == "pie") {
        // pie
        jQuery.plot(element, d, { series: {pie: {show: true, label:{ threshold: 0.02} } }, legend: {show: false }, colors: options.colors});
    } else {
        // line
        jQuery.plot(element, d, {xaxis: {labelAngle: 45, ticks: xLabels}, colors: options.colors});
    }
        
    // callback
    if ( typeof(options.callback) == "function" && typeof(options.callback_args) == "object") {
        options.callback.apply(undefined, options.callback_args);
    }
    
    return true;
}

// Ajax calling...
OGRA.prototype.graph_ajax = function(elem_id, data_url, chart_type, type, options) {
    
    // Import library is required in case of using Ajax to call graph method.
    this.import(type);
    
    // import jQuery
    if (this.imported["jquery"] == false) {
        this.import("jquery");
    }
    
    if (typeof(jQuery) == 'undefined') {
        var that = this;
        setTimeout(function() {
            that.graph_ajax(elem_id, data_url, chart_type, type, options);
        }, this.retry_time);
        return;
    }
    
    //
    var that = this;
    $.getJSON(data_url, function(data){
        that.graph(elem_id, data, chart_type, type, options);
    }).error(function() {
        that.error("Bad URL '" + data_url + "' for Ajax requested.", elem_id);
    });

}

// draws loading gif
OGRA.prototype.add_loading = function(element) {
    
    element.style.background = '#fff';
    element.style.backgroundImage = "url('data:image/gif;base64,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')";
    element.style.backgroundPosition = "center center";
    element.style.backgroundRepeat = "no-repeat";
}

// removes loading gif
OGRA.prototype.remove_loading = function(element) {
    
    element.style.backgroundImage = "";
}

// creating namespace
var Ogra = new OGRA();
