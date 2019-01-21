var THRESHOLD_DISTANCE_DIFFERENCE=300;//assume 300 meters as the minimum distance among two target nodes
var NODE_VISIT_ACCEPTANCE_ERROR=30;//assume 30 meters from the current user location as visited target
function checklocation(newloc,target_locations){
	wrong_node=false;
	var current_location={lat: newloc.lat, lng: newloc.lng};
	var new_target_locations=[current_location];
	for(var i=1; i< target_locations.length; i++){
	     var dist=getDistance(current_location,target_locations[i]);
		if(dist<=NODE_VISIT_ACCEPTANCE_ERROR){
			 updateMarkers(target_locations[i]);
		     //change marker
			 //the node i in target location is visited now hence remove it from target_location 
			 playSound(i,target_locations.length);
		     //delete/change marker from map
		     //changeMarker(current_location);
		     //delete location from dropdown list
		     //updateTSPStartDropdown(current_location);
		}else{
			new_target_locations.push(target_locations[i]);
		}
	}
	if(new_target_locations.length==target_locations.length){
		playSound(0,0);//wrong move
	}
	return new_target_locations;
}
function updateDistanceTime(response,actualpoints,flag){
	 if(flag=="Expected"){
		 var route = response.routes[0];
		 if(TSP_count>1){
			 return;
		 }
		 var expectedDistPanel = document.getElementById('expected_distance');
		 var expectedTimePanel = document.getElementById('expected_time');
		 var dis=0;
		 var len;
		 var travelmode=document.getElementById("travelmode").value;
		 var vel=getAverageVelocity(travelmode);
		 for (var i = 0; i < route.legs.length; i++) {
              len=(route.legs[i].distance.text).split(" ",1);
			  dis=dis+ parseFloat(len);
	    } 
		if(dis <= 1){
			expectedDistPanel.innerHTML = "<b>" +(dis * 1000).toString() +"  Meters</b>";
		}else{
			expectedDistPanel.innerHTML = "<b >" +dis.toString() +"  Km</b>";
		}
		 
		 var time=dis/vel;//hours
		 var ms="Hours";
		 if(time<1){
	         time=time*60;
			 ms="Minutes";
        }
		 expectedTimePanel.innerHTML = "<b>" + parseFloat(time).toFixed(2).toString() +"&nbsp;&nbsp;"+ ms +"</b>";
    }else{//Actual distance covered
	     var dis=getDistance(actualpoints[0],actualpoints[1]);
         var dist_obj=document.getElementById("actual_distance");     
	     var pre_tot_dist;
	     var ms="m";
	     var tot_dist;
	     if(document.getElementById("actual_distance").innerHTML==""){
		     pre_tot_dist=0;
		     tot_dist=dis;
	    }else{
		     if(document.getElementById("actual_distance").innerHTML.includes("Km")){
			     ms="Km";
		    }
		     pre_tot_dist=dist_obj.innerHTML.split(">",2)[1];
		     pre_tot_dist=parseFloat(pre_tot_dist.split("&",1)[0]);
		     if(ms=="Km"){
			     tot_dist=(pre_tot_dist*1000)+dis; 
		    }else{
			     tot_dist=pre_tot_dist+dis; 
		    }
	    }
	     if(tot_dist<1000){
		     dist_obj.innerHTML="<b>"+(tot_dist).toFixed(0)+"&nbsp;M</b>";
	    }else{
		     dist_obj.innerHTML="<b>"+(tot_dist/1000).toFixed(2)+"&nbsp;Km</b>";
	    } 
	}
}
function validateLocation(currentLocation,target_locations){
	for(var i=0; i<target_locations.length;i++){
		if(getDistance(currentLocation,target_locations[i])<=THRESHOLD_DISTANCE_DIFFERENCE){
			return false;//not acceptable location
		}
	}
	return true;// valid location
}
function getDistance(wgs1, wgs2){// returns distance in meters
    var RADIUS = 6371000;
    var xyz1 = WGStoXYZ(wgs1, RADIUS);
    var xyz2 = WGStoXYZ(wgs2, RADIUS);
    return haversine(xyz1, xyz2, RADIUS);
}
function haversine(p1, p2, rad){
    var E = euclidean(p1, p2);
    var dist = 2 * rad * Math.asin(E / (2 * rad))
    return dist;
}
function euclidean(p1, p2){
    return Math.sqrt(
        (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y) +
        (p1.z - p2.z) * (p1.z - p2.z)
    )
}
function WGStoXYZ(location, R){
    var xyz = {
        x: 0,
        y: 0,
        z: 0
    };
	try{
		xyz["y"] = Math.sin(degToRad(location.lat())) * R;
		var r = Math.cos(degToRad(location.lat())) * R;
		xyz["x"] = Math.sin(degToRad(location.lng())) * r;
		xyz["z"] = Math.cos(degToRad(location.lng())) * r;
	}catch(err){
		xyz["y"] = Math.sin(degToRad(location.lat)) * R;
		var r = Math.cos(degToRad(location.lat)) * R;
		xyz["x"] = Math.sin(degToRad(location.lng)) * r;
		xyz["z"] = Math.cos(degToRad(location.lng)) * r;
	}
    return xyz;
}
function degToRad(degree){
    return degree * Math.PI / 180;
}
function getThresholdDistance(){
	return THRESHOLD_DISTANCE_DIFFERENCE;
}
function getAverageVelocity(travelmode){
	var vel//Avarge velocity in Km/Hr
	switch(travelmode){
		case "WALKING":
		     vel=4.82803;
			 break;
	    case "BICYCLING":
		     vel=16.0934;
			 break;
		default:// driving
		    vel=80;
			break;
	}
	return(vel);
}
