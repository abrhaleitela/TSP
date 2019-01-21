/*
	Version v.0.1
	Author: Abrhalei & Salseng
	Description: Contains main functions used in this app
*/
var g_mapHandlerType="all";
var DEFAULT_ZOOM_LEVEL=10;
var DEEP_ZOOM_LEVEL=17;
var map;
var geocoder;
var startmarker;
var searchmarker;
var targetmarkers;
var marker;
var searchicon;
var target_icon;
var default_location;
var search_valid_location;
var search_clicked;
var target_locations;
var currentSearchLocation;
var TSPDisplay;
var TSPService;
var clicked_location;
var wrong_node_counter;
var correct_node_counter;
var actualpoints;
var actual_path;
var remove_flag;
var TSP_Actual_Flag;
var TSP_count;
var tr_IDs;
var user_drag_option;
var add_from_menu;
var visited_icon;
var infowindow;
var locations_to_save;
var visited_markers;
var voice_flag;
var wrong_node;
var map_loaded;
var user_zoom;
function init(){
	map_loaded=false;
	voice_flag=false;
	visited_markers=[];
	target_locations=[];
	locations_to_save="";
	remove_flag=false;
	correct_node_counter=0;
	wrong_node_counter=0;
	targetmarkers=[];
	add_from_menu=false;
	 clicked_location=null;
	 TSP_count=0;
	 user_drag_option=false;
	 user_zoom=false;
	 if (navigator.geolocation){
	 navigator.geolocation.getCurrentPosition(function(position){
     var current_location = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
        };
	 setDefaultLocation(current_location);
	 });
	 
	 navigator.geolocation.watchPosition(onUserPositionChanged);
	 
	}	
     TSP_Actual_Flag="";
	 search_valid_location=false;
	 map = new google.maps.Map(document.getElementById('map'), {
          zoom: DEFAULT_ZOOM_LEVEL,
          fullscreenControl: false,
		  streetViewControl: false,
		  mapTypeControl: false,
     });
		
	 geocoder = new google.maps.Geocoder;
     var starticon={
	     url:"images/user.JPG",
	     size:new google.maps.Size(50,50),
	     scaledSize:new google.maps.Size(50,50),
	     origin:new google.maps.Point(0,0),
		 anchor:new google.maps.Point(9,37)
	 };
	 searchicon={
	     url:"images/searchicon.gif",
	     size:new google.maps.Size(50,50),
	     scaledSize:new google.maps.Size(50,50),
		 origin:new google.maps.Point(0,0),
         anchor:new google.maps.Point(9,37),
		 
	 };
     startmarker = new google.maps.Marker({
         position: default_location,
         icon: starticon,
		 zIndex:1,
		 title: "Your current location",
		 draggable : user_drag_option,
		 optimized: false,
         map: map
		 
	 });
	 startmarker.addListener('click',showUserInfoWindow); 
     searchmarker = new google.maps.Marker({
         icon: searchicon,
		 draggable : false,
		 zIndex:1,
		 title:"Searched location, Click Add to include to your TSP locations.",
         map: map
	 });
	 target_icon={
	     url:"images/unvisitedicon.png",
	     size:new google.maps.Size(50,50),
	     scaledSize:new google.maps.Size(50,50),
	     origin:new google.maps.Point(0,0),
	     anchor:new google.maps.Point(9,37)
	 };
	 visited_icon={
	     url:"images/visitednode.png",
	     size:new google.maps.Size(50,50),
	     scaledSize:new google.maps.Size(50,50),
	     origin:new google.maps.Point(0,0),
	     anchor:new google.maps.Point(9,37)
	 };
	 marker = new google.maps.Marker({
         icon: target_icon,
		 draggable : false,
		 title: "Visited Location",
         map: map
     });
	 searchmarker.setVisible(false);
	 map.setCenter(default_location);
     map.setZoom(10);
     TSPDisplay= new google.maps.DirectionsRenderer({map: map, polylineOptions: {strokeColor: "blue" }, suppressMarkers: true });
	 TSPService = new google.maps.DirectionsService;
	 TSPDisplay.setMap(map);
	 google.maps.event.addListener(startmarker,'dragend',onpositionChanged);
	 //google.maps.event.addListener(map,'idle',function(){mapHandler("map_event");});
	 //google.maps.event.addListener(map,'zoom_changed',function(){user_zoom=true;});
}
function showUserInfoWindow(){
	 if(TSPDisplay!=null && actualpoints.length>1){
	     infowindow.open(map, startmarker);
	 }
}
function refresh(){
	closeMenus();
	if(map_loaded==false){//this prevents the user from accessing the features of the app before the map loads.
	     return;
	}
	//remove from table
	var tr_id;
	for(var i=0; i<tr_IDs.length;i++){
		tr_id=tr_IDs[i];
		if(document.getElementById(tr_id)){
			document.getElementById(tr_id).remove();
		}		
	}
	//set all markers to null
	for(var i=0;i<targetmarkers.length;i++){
		targetmarkers[i].marker.setMap(null);
	}
	targetmarkers=[];
	//remove all targets nodes except user current location
	target_locations=[];
	var new_loc=startmarker.getPosition();
	var new_target={lat: new_loc.lat(), lng: new_loc.lng()};
	//remove elements from dropdown
	document.getElementById('start').options.length = 0;
	getFullAddress(new_target);
	//remove existing TSP path
	clearAllPaths(null,"TSP");
	//clear Actual path
	clearAllPaths(actualpoints,"Actual");
	//remove all actualpoints
	actualpoints=[];
	actualpoints.push(new_target);	
	tr_IDs=[];
}
function updateCounter(flag){
	if(flag=="Correct"){
		correct_node_counter=correct_node_counter+1;
		document.getElementById("correct_node").innerHTML=correct_node_counter;
	}else{
		wrong_node_counter=wrong_node_counter+1;
		document.getElementById("wrong_node").innerHTML=wrong_node_counter;
	}
}	
function initTSP(){
	 visited_markers=[];
	 user_drag_option=true;
	 if(target_locations.length<2){
		 swal({type: 'error',title: 'Calculate TSP',text: 'You have only one location, Please add more locations!'});
	 }else{	
	     TSP_count=TSP_count+1;
	     var lat="";
	     var lng="";
	     var address_name;
	     locations_to_save=getSelectedTravelMode().toString()+"&&";
	     try{
	         for(var i=0;i<target_locations.length;i++){
		         lat=target_locations[i].lat;
		         lng=target_locations[i].lng;
		         address_name=document.getElementById("start").options[i].value;
		         locations_to_save=locations_to_save + lat + "||" + lng + "||" + address_name + "&&";
	        }
	    }catch{
		     swal({type: 'error',title: 'Calculate TSP',text: 'Please refresh the page and try again!'});
	    }
	     simplebar.go(10);
	     calculateTSP(target_locations);
	     startTimer();
	     startmarker.setTitle("Click Me!");
	}
}
function updateMarkers(markerlocation){
	 var target_lat;
	 var target_lng;
	 var new_lat;
	 var new_lng;
	 for(var i=0;i<targetmarkers.length;i++){
 		 target_lat=parseFloat(targetmarkers[i]["loc"]["lat"]).toFixed(2);
		 new_lat=parseFloat(markerlocation.lat).toFixed(2);
		 target_lng=parseFloat(targetmarkers[i]["loc"]["lng"]).toFixed(2);
		 new_lng=parseFloat(markerlocation.lng).toFixed(2);
	    if(target_lat== new_lat && target_lng==new_lng){
		     targetmarkers[i].marker.setVisible(false);
			 marker = new google.maps.Marker({
                  position:targetmarkers[i]["loc"] ,
	              icon: visited_icon,
		          draggable : false,
		          title: "Visited Location",
                  map: map
              });
			  visited_markers.push(marker);
		 }
	 }
}
function updateUserMarkerInfo(){
	 var content=document.getElementById("directions-panel").innerHTML;
	 infowindow = new google.maps.InfoWindow({
         content: content
        });
	
}
function onUserPositionChanged(event){
	wrong_node=false;
	var new_pos={lat: event["coords"].latitude, lng: event["coords"].longitude};
	if(target_locations.length<=1){
		 return;
	 }
	 startmarker.setPosition(new_pos);
	 actualpoints.push(new_pos);
	 var new_path_elements=[];
	 new_path_elements[0]=actualpoints[actualpoints.length-2];
	 new_path_elements[1]=actualpoints[actualpoints.length-1];
	 updateDistanceTime(null,new_path_elements,"Actual");//null->is response object used to cal expected
	 target_locations=checklocation(new_pos,target_locations);
	 drawActualLine(actualpoints, "red", 3, 2);
	 updateUserMarkerInfo();
	 if(wrong_node){
		recalculate();
	}
}
function setWrong(bool){
	wrong_node=bool;
}
function onpositionChanged(event){//for testing, not need when publishing drag end
	if(target_locations.length<=1){
	     return;
	}
	 wrong_node=false;
	 var newloc= startmarker.getPosition();
	 map.setCenter(newloc);
	 var new_elem={lat:newloc.lat(),lng:newloc.lng()};
	 actualpoints.push(new_elem);
	 var new_path_elements=[];
	 new_path_elements[0]=actualpoints[actualpoints.length-2];
	 new_path_elements[1]=actualpoints[actualpoints.length-1];
	 updateDistanceTime(null,new_path_elements,"Actual");//null->is response object used to cal expected
	 target_locations=checklocation(new_elem,target_locations);
	 drawActualLine(actualpoints, "red", 3, 2);
	 updateUserMarkerInfo();
	 if(wrong_node){
		recalculate();
	}
}
function drawActualLine(points, color, thickness, zIndex) {//Draws the red line that defines all the path the user uses in his/her TSP
	  clearAllPaths(points,"Actual");
	  actual_path = new google.maps.Polyline({
	  path: points,
	  geodesic: true,
	  strokeColor: color,
	  strokeWeight: thickness,
      map: map,
	  anchor:new google.maps.Point(10,40),
	  zIndex: zIndex
	});
	
}
function click_button(event){
	if (event.keyCode === 13){//when ENTER is pressed"
         search();
	 }
}
function search(){
	 if(map_loaded==false){//this prevents the user from accessing the features of the app before the map loads.
		 swal({type: 'error',title: 'Search',text: 'Your map is loading, Please wait for it to finish loading OR refresh the page!'});
		return;
	}
	 search_clicked=true;
	 var adress = document.getElementById('search_text').value;
     if(adress==""){
         swal({type: 'error',title: 'Search',text: 'No location given, Please type your location correctly!'});
	 }else{
		 geocoder.geocode({'address': adress},ongeocodercall);
	 }
}	   
function ongeocodercall(results, status){
     switch(status){
	     case 'OK':
             map.setCenter(results[0].geometry.location);
		     var new_location=results[0].geometry.location;
			 searchmarker.setPosition(new_location);
			 var address=results[0].formatted_address;
			 currentSearchLocation={lat: new_location.lat(), lng: new_location.lng()};
			 search_valid_location=true;
			 addToTarget(address);
             break;
      	 case 'ZERO_RESULTS':
		     swal({type: 'error',title: 'Search',text: 'Location not found, Please type your location correctly!'});
			 search_valid_location=false;
		     break;
		 case 'INVALID_REQUEST':
	         swal({type: 'error',title: 'Search',text: 'Invalid adress given, Please type your location correctly!'});
	         search_valid_location=false;
			 break;
		 case 'OVER_DAILY_LIMIT':
		     swal({type: 'error',title: 'Search',text: 'Error with API key, Please try later!'});
			 search_valid_location=false;
			 break;
		 case 'UNKNOWN_ERROR':
		     swal({type: 'error',title: 'Search',text: 'Request could not be processed, Please try later!'});
		     search_valid_location=false;
			 break;
		 default:
		     swal({type: 'error',title: 'Search',text: 'Google Geocoder failed, Please try later!'});
		     search_valid_location=false;
			 break;			 
    }
}
function addToTarget(address){
	 if(search_valid_location){
		 document.getElementById("search_text").value=address;
	 	 if(!validateLocation(currentSearchLocation,target_locations)){
	         swal({type: 'error',title: 'Add Location',text: 'The location is already added! (N.B. Minimum distance allowed among two loactions is 300 meters).'});
	         return;
	    }
	    getFullAddress(currentSearchLocation);
  	    document.getElementById("search_text").value="";
	 }
}
function getFullAddress(newPosition){
	 geocoder.geocode({'location': newPosition}, function (results, status) {
     switch (status){
         case 'OK':
		     var address=results[0].formatted_address;
			 addToDropdown(address);
			 var loc_counter=document.getElementById("start").options.length;
			 TSPStartAddOperation(address,"add",loc_counter);
			 break;
         default:
             //nothing 
             break;
	 }
    });  
}
function addToDropdown(address){
	 var sel=document.getElementById("start");
	 var opt = document.createElement('option');
	 opt.value = address;
     opt.innerHTML = address;
     sel.appendChild(opt);
}
function addElementToTable(newPosition,address){
	 var table = document.getElementById("target_locations");
	 var tr = document.createElement("tr");
     var td1 = document.createElement("td");
     var td1value = document.createTextNode(address);
     td1.appendChild(td1value);
     tr.appendChild(td1);
	 var td2 = document.createElement("td");
     var td2value = document.createElement("img");
	 td2value.src="images/remove.png";
	 td2value.setAttribute("id", address);
	 td2value.setAttribute("align","middle");
	 td2value.classList.add("remove-button-img");
	 td2.appendChild(td2value);
	 tr.appendChild(td2);
	 var new_id= address + parseFloat(newPosition.lat).toString();
	 tr_IDs.push(new_id);
	 tr.setAttribute('id', new_id);
	 table.appendChild(tr);
	 document.getElementById(address).addEventListener("click", function(){
              removeAddress(address,newPosition);
    });
}
function removeAddress(address,location){
	 //remove from target_locations
	 var threshold=getThresholdDistance();//threshold distance among two nodes in meters
	  for(var i=0;i<target_locations.length;i++){
		 if(getDistance(target_locations[i],location)<=threshold){
			 target_locations.splice(i,1);
		 }
	 }
	 //remove from markers
	 for(var i=0;i<targetmarkers.length;i++){
		var lat=targetmarkers[i].loc.lat;
		var lng=targetmarkers[i].loc.lng;
		 if(location.lat==lat && location.lng==lng){
		     searchmarker.setMap(null);
			 remove_flag=true;
			 targetmarkers[i].marker.setMap(null);
			 targetmarkers.splice(i,1);
		}
	}
     //remove from dropdown
	 var sel=document.getElementById("start");
	 for(var i=0;i<sel.options.length;i++){
		 if(sel.options[i].text==address){
			 sel.options.remove(i);
		 }
	 }
	 //remove from table
	 var tr = document.getElementById(address).parentNode.parentNode;
	 tr.parentNode.removeChild(tr);
}
function setupNewMarker(lat,lng){
	 var location_from_lat_lng={"lat": lat, "lng": lng};
	 //The marker is not in start location.//updated to every markers
	 //add them all to an array of markers and locs
	 marker = new google.maps.Marker({
         position: location_from_lat_lng,
         icon: target_icon,
		 draggable : false,
		 zIndex:0,
		 title: "Unvisited Location",
         map: map
	});
	 var targetmarker={"marker": marker, "loc": location_from_lat_lng, "index": targetmarkers.length};
	 
	 targetmarkers.push(targetmarker);
	 if(targetmarkers.length==1){
		 //alert("leng = 1");
		 targetmarkers[0].marker.setVisible(false);
	 }
	 searchmarker.setMap(null);
}
function navigationFromTo(startPoint, endPoint,waypoints,flag){
	var travelmode=getSelectedTravelMode();
	switch(flag){
		case "TSP":
     		 TSP_Actual_Flag="TSP";
	    	 TSPDisplay= new google.maps.DirectionsRenderer({map: map, polylineOptions: {strokeColor: "blue" }, suppressMarkers: true });
	         TSPDisplay.setMap(map);
	         TSPService.route({
                 origin: startPoint,
                 destination: endPoint,
                 waypoints: waypoints,
                 travelMode: travelmode
             },drawRoute);
			 break;
		case "Actual":
		     TSP_Actual_Flag="Actual";
		    //nothing
		     break;
		default:
		     //This is neither TSP route nor Actual route!
		     break;	
	}   
}
function drawRoute(response, status){
	simplebar.go(75);
	switch(status){
		case "OK":
	         if(TSP_Actual_Flag=="TSP"){
				 TSPDisplay.setDirections(response);
				 if(TSP_count==1){
					 startmarker.setDraggable(user_drag_option);
				     updateDistanceTime(response,null,"Expected");//null-> is used to cal actual dist bn two points
				}
		    }else if(TSP_Actual_Flag=="Actual"){
			 //actual path
		     }
		     break;
		default:
		     swal({type: 'error',title: 'Navigation Error',text: 'Directions request failed to draw the route, Please try again!'});
		     break;
	}
	simplebar.go(100);
}
function clearAllPaths(actualpoints,flag){
	switch(flag){
         case "TSP":
		     if(TSPDisplay!=null){
				 TSPDisplay.setMap(null);
	             TSPDisplay.setDirections({routes: []});  
                 TSPDisplay = null; 
	       	 }		     
			 break;
		     
		case "Actual":
		    if(actualpoints.length>=2 && actual_path!=null){
				 actual_path.setMap(null);
			 }
		     break;
		default:
		     //Nothing to clear.
			 break;
	}	
}
function setTSPStart(){
     var start_point_Name=document.getElementById("start").value;
	 TSPStartAddOperation(start_point_Name,"start");
}
function TSPStartAddOperation(start_point_Name,startflag,loc_counter){
	 geocoder.geocode({'address': start_point_Name}, function(results, status) {
     switch(status){
	     case 'OK':
		     var getLatLngObject_value=results[0].geometry.location;
             if(startflag=="add"){
				 var new_target={lat: getLatLngObject_value.lat(), lng: getLatLngObject_value.lng()};
			     target_locations.push(new_target);
				 setupNewMarker(getLatLngObject_value.lat(),getLatLngObject_value.lng());
				 if(loc_counter>1){//user location is not adding to the table of target
			         addElementToTable(new_target,start_point_Name);
			    }
			 }else if(startflag=="start"){
				 var i=target_locations.indexOf(getLatLngObject_value);
				 var temp=target_locations[0];
				 target_locations[0]=getLatLngObject_value;
				 target_locations[i]=temp;
			 }else{
				 //This should not been excuted, there is no way this function is called with different parrameters
			 }
			break;
  		 default:
		     //this error occurs when google could not find a full adress of already searched location. 
			 //special example found "lehmo" search for this place
			 //google will give you result with formatted_address
			 //again search google with this formatted_address as an input
			 //then google will say INVALID REQUEST wchich means "location not found"
		     swal({type: 'error',title: 'TSP start',text: 'Google somehow has data mismatch with this location, Please delete it from your table of targets!'});
		     break;	
	     }
     });
}
function setTargetLocations(new_targets){
	target_locations=[];
	for(var i=0;i<new_targets.length;i++){
		target_locations.push(new_targets[i]);
	}
}
function recalculate(){
	if(target_locations.length > 1){
		TSP_count=TSP_count+1;
		simplebar.go(5);
		calculateTSP(target_locations);
	}else{
		 readSentence("You don't have any locations to visit, Please add target locations first.");
	}
}
function setDefaultLocation(location){
	 default_location=location;
	 target_locations=[];
	 actualpoints=[
	     {lat:default_location.lat,lng:default_location.lng},
     ];
	 map.setCenter(default_location);
     map.setZoom(DEFAULT_ZOOM_LEVEL);
     startmarker.setPosition(default_location);
	 getFullAddress(default_location);
	 map_loaded=true;
	 tr_IDs=[];
}
function save(TSP_name){
     localStorage.setItem(TSP_name,locations_to_save);
}
function clearAllData(){
	 refresh();
	 for(var i=0;i<visited_markers.length;i++){
		visited_markers[i].setVisible=false;
		visited_markers[i].setMap(null);
	}
	startmarker.setDraggable(false);	
}
function load(datas){
	 //datas strucure is : 12.2123||12.213||Asmara, Eritrea&&62||29||Joensuu, Finland
	 //lat||lng||address&&------and soon
	 var data_array=[];
	 //reset all locations on map
	 targetmarkers.length=1;
	 target_locations=[];
	 document.getElementById("start").options.length=0;
	 //make them real markers, table and drop down
	 var new_lat="";
	 var new_lng="";
	 var new_address=""
	 var lat_lng_obj;
	 data_array=datas.split("&&");
	//select the travelMode used in that datas
	document.getElementById("travelmode").value=data_array[0].toString().toUpperCase();
	 for(var i=1;i<data_array.length-1;i++){
		 //alert(data_array[i]);
		 new_lat=extractLatLngAddress(data_array[i],"lat");
		 new_lng=extractLatLngAddress(data_array[i],"lng");
		 new_address=extractLatLngAddress(data_array[i],"address");
		 lat_lng_obj={lat:new_lat, lng:new_lng};
		 setupNewMarker(new_lat,new_lng);//set up new unvisited node
		 target_locations.push(lat_lng_obj);//add to target locations array
		 addToDropdown(new_address);//add to dropdown
		 if(i>0){//remeber we don't display the user location in the table so that user can't delete his location
		     addElementToTable(lat_lng_obj,new_address);//add to table
		 }//bounds.extend(lat_lng_obj);//get bounds
	 }
     startmarker.setDraggable(true);
	 //start tsp
	 initTSP(); 
}
function setVoiceFlag(flag){
	voice_flag=flag;
}
function validateSave(){
	if(!locations_to_save==""){
		return true;
	}else{
		return false;
	}
}
function extractLatLngAddress(new_location,flag){
	 var latlngaddress = new_location.toString().split('||');
	if(flag=="lat"){ //return lat
		 return (parseFloat(latlngaddress[0]));
    }else if(flag=="lng"){  //return lng
	 return(parseFloat(latlngaddress[1]));
	}else{//return address
	 return(latlngaddress[2].toString());
	}
}
function toggleMapHandler(){
	switch(g_mapHandlerType){
		case "all":
				g_mapHandlerType="follow";
				break;
			case "follow":
				g_mapHandlerType="all";
				break;
			case "user":
				g_mapHandlerType="all";
				break;
	}
	handleMap();
}
function handleMap(){
	try{
		switch(g_mapHandlerType){
			case "all":
				var bounds=getBounds(target_locations);
				map.fitBounds(bounds);
				break;
			case "follow":
				var bounds=getBounds(target_locations);
				map.setCenter(startmarker.getPosition());
				map.setZoom(DEEP_ZOOM_LEVEL);
				break;
			case "user":
				// nothing
				break;
		}
	}catch(err){}
}
function getBounds(target_locations){
	var bounds = new google.maps.LatLngBounds();
	for(var i=0;i<target_locations.length;i++){
		bounds.extend(target_locations[i]);
	}
	return bounds;
}