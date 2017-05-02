var menu_hide = false;

$(document).ready(function(){

	//handle menu toggle
	$("#sensor-toggle-zone").click(
		function(){
			if(menu_hide){
				$("#sensor-tabs").animate({"right": "0px"}, 500);
				menu_hide = false;
			}else{
				$("#sensor-tabs").animate({"right": "-400px"}, 500);
				menu_hide = true;
			}
		}
	);

});
