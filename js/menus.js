function getSelectedTravelMode(){
     var selected=document.getElementById("travelmode").value;
	 return(selected);
}
function closeMenus(){
	document.getElementById("menu-drop_down").click();
}
function toggleControls(flag){
	if(flag=="tsp-started"){
		 document.getElementById("top-navbar-1").style.visibility="hidden";//dont forget to show it back when the game ends
		 document.getElementById("target_locations").style.visibility="hidden";
		 document.getElementById("description").style.display="block";
		 document.getElementById("directions-panel").style.display="block";
		 document.getElementById("tsp_title").style.display="block";
		 
	}else{
	}
}
