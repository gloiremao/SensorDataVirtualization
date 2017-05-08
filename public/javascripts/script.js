var menu_hide = false;
var route = new Array();
var last_x = 0; 
var last_y = 0; 

$(document).ready(function(){

    $('#chartTab a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    })

	//handle menu toggle
	$("#sensor-tabs").click(
		function(){
			if(menu_hide){
				$("#sensor-tabs").animate({"right": "0px"}, 300);
				menu_hide = false;
			}
		}
	);

	$( "#sensor-tabs" ).hover(
		function() {
			if (menu_hide){
				$("#sensor-tabs").animate({"right": "-33%"}, 250);
			}
			
		}, function() {
			if(menu_hide){
				$("#sensor-tabs").animate({"right": "-34%"}, 250);
			}
			
		}
	);

	$( "#sensor-tabs-dismiss" ).click(
		function(){
			if (!menu_hide){
				$("#sensor-tabs").animate({"right": "-34%"}, 250, function(){
					menu_hide = true;
				});
				
			}
		}
	);

	$("#demo").click(function(){
		updateMap(24.7953392,120.9920238,"2");
	})
	$("#demo2").click(function(){
		updateMap(24.7920600,120.9933670,"3");
	})

});

var lineSymbol = {
  path: 'M 0,-1 0,1',
  strokeOpacity: 1,
  scale: 4
};

function updateMap(x, y, sensor_values, timestamp){
	if(last_x == 0 && last_y == 0){
		setMapMarker(x,y,sensor_values);
		last_x = x;
		last_y = y;
	}else{
		console.log("updateMap " + x + " " + y);
		var line = new google.maps.Polyline({
			path: [{lat: last_x, lng: last_y}, {lat: x, lng: y}],
			strokeOpacity: 0,
			icons: [{
				icon: lineSymbol,
				offset: '0',
				repeat: '20px'
			}],
			map: map
        });
		setMapMarker(x,y,sensor_values);
		last_x = x;
		last_y = y;
	}
} 


var labTemp = new Array();
var headCount = new Array();
var socket = io.connect();
//var socket = io.connect('http://localhost:5000');
    socket.on('connect', function () {
        socket.on('mqtt', function (msg) {
            var message = msg.topic.split('/');
            var area = message[1];

            console.log(String.fromCharCode.apply(null, new Uint8Array(msg.payload)));

            var payload = String.fromCharCode.apply(null, new Uint8Array(msg.payload));

            var timestamp = Math.round((new Date()).getTime() / 1000);

            $('#topic').html(msg.topic);
            $('#message').html(msg.topic + ', ' + payload);
            switch (area) {
                case 'front':
                    $('#value1').html('(Switch value: ' + payload + ')');
                    if (payload == 'true') {
                        $('#label1').text('Closed');
                        $('#label1').removeClass('label-danger').addClass('label-success');
                    } else {
                        $('#label1').text('Open');
                        $('#label1').removeClass('label-success').addClass('label-danger');
                    }
                    break;

                case 'pir':
                    $('#value2').html('(Sense value: ' + payload + ')');
                    if (payload == '0') {
                        $('#label2').text('Nothing');
                        $('#label2').removeClass('label-danger').addClass('label-success');
                    } else {
                        $('#label2').text('Motion detected');
                        $('#label2').removeClass('label-success').addClass('label-danger');
                    }
                    break;

                case 'headCount':
                    $('#value3').html('(Head count: ' + payload + ')');
                    $('#value3Label').text(payload + ' person');
                    $('#value3Label').removeClass('').addClass('label-success');

                    var entry = new Array();
                    entry.push(timestamp);
                    entry.push(parseInt(payload));
                    headCount.push(entry);
                    // Show only 20 values
                    if (headCount.length >= 20) {
                        headCount.shift()
                    }

                    var headCountPlot = $.jqplot ('headCountChart', [headCount], {
                        axesDefaults: {
                            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                            tickOptions: {
                                showMark: false,
                                showGridline: false,
                                show: false,
                                showLabel: false,
                            }
                          },
                        grid: {
                            gridLineColor: '#FFFFFF',
                            borderWidth: 0,
                            shadow: false,
                        },
                        seriesDefaults: {
                            rendererOptions: {
                                smooth: true
                            },
                            showMarker: false,
                            lineWidth: 2,
                          },
                          axes: {
                            xaxis: {
                              renderer:$.jqplot.DateAxisRenderer,
                              tickOptions:{
                                formatString:'%T'
                              },
                              pad: 0
                            },
                            yaxis: {
                            }
                        }
                    });
                    break;


                case 'labTemp':
                    $('#labTempSensor').html('(Sensor value: ' + payload + ')');
                    $('#labTempValue').text(payload + '°C');
                    $('#labTempLabel').text('Activated');
                    $('#labTempLabel').removeClass('').addClass('label-default');

                    var entry = new Array();
                    entry.push(timestamp);
                    entry.push(parseFloat(payload));
                    labTemp.push(entry);
                    // Show only 20 values
                    if (labTemp.length >= 20) {
                        labTemp.shift()
                    }

                    var labTempPlot = $.jqplot ('labTempChart', [labTemp], {
                        axesDefaults: {
                            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                            tickOptions: {
                                showMark: false,
                                showGridline: false,
                                show: false,
                                showLabel: false,
                            }
                          },
                        grid: {
                            gridLineColor: '#FFFFFF',
                            borderWidth: 0,
                            shadow: false,
                        },
                        seriesDefaults: {
                            rendererOptions: {
                                smooth: true
                            },
                            showMarker: false,
                            lineWidth: 2,
                          },
                          axes: {
                            xaxis: {
                              renderer:$.jqplot.DateAxisRenderer,
                              tickOptions:{
                                formatString:'%T'
                              },
                              pad: 0
                            },
                            yaxis: {
                                tickOptions:{
                                    formatString: '%.1f'
                                }
                            }
                        }
                    });

                    break;
                case 'basement':
                    $('#basementTempSensor').html('(Sensor value: ' + payload + ')');

                    if (payload >= 25) {
                            $('#basementTempLabel').text(payload + '°C - too hot');
                            $('#basementTempLabel').removeClass('label-warning label-success label-info label-primary').addClass('label-danger');
                    } else if (payload >= 21) {
                            $('#basementTempLabel').text(payload + '°C - hot');
                            $('#basementTempLabel').removeClass('label-danger label-success label-info label-primary').addClass('label-warning');
                    } else if (payload >= 18) {
                            $('#basementTempLabel').text(payload + '°C - normal');
                            $('#basementTempLabel').removeClass('label-danger label-warning label-info label-primary').addClass('label-success');
                    } else if (payload >= 15) {
                            $('#basementTempLabel').text(payload + '°C - low');
                            $('#basementTempLabel').removeClass('label-danger label-warning label-success label-primary').addClass('label-info');
                    } else if (payload <= 12) {
                            $('#basementTempLabel').text(payload + '°C - too low');
                            $('#basementTempLabel').removeClass('label-danger label-warning label-success label-info').addClass('label-primary');
                    basementTemp.push(parseInt(payload));
                    if (basementTemp.length >= 20) {
                        basementTemp.shift()
                    }

                    $('.basementTempSparkline').sparkline(basementTemp, {
                        type: 'line',
                        width: '160',
                        height: '40'});
                    }
                    break;
                default: console.log('Error: Data do not match the MQTT topic.'); break;
            }
 });
 socket.emit('subscribe', {topic : 'home/#'});
});

var map;
function myMap() {
	var mapOptions = {
	    center: new google.maps.LatLng(24.7920604,120.9933676),
	    zoom: 16,
	    mapTypeId: 'roadmap',
	    zoomControl: true,
	    zoomControlOptions: {
	      position: google.maps.ControlPosition.LEFT_CENTER
	    },
	    streetViewControl: false,
	}
	map = new google.maps.Map(document.getElementById("map"), mapOptions);

}



var markers = new Array();
var image_url = "/images/marker_image.png"

function setMapMarker(x,y, text, timestamp){
	console.log("add marker");
	var marker = new google.maps.Marker({
	    position: new google.maps.LatLng(x,y),
	    map: map,
	    icon: image_url,
	    title: text
	});


	var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h3 id="firstHeading" class="firstHeading">'+timestamp+'</h3>'+
            '<div id="bodyContent">Value: '+
            text+
            '</div>'+
            '</div>';

    var infowindow = new google.maps.InfoWindow({
          content: contentString,
          maxWidth: 200
        });

    marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

    markers.push(marker);

	//map.setCenter(marker.getPosition());
}


