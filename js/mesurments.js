// returns distance in meters
function getDistance(wgs1, wgs2) {
    var RADIUS = 6371000;
    var xyz1 = WGStoXYZ(wgs1, RADIUS);
    var xyz2 = WGStoXYZ(wgs2, RADIUS);
    return haversine(xyz1, xyz2, RADIUS);
}

function haversine(p1, p2, rad) {
    var E = euclidean(p1, p2);
    var dist = 2 * rad * Math.asin(E / (2 * rad))
    return dist;
}

function euclidean(p1, p2) {
    return Math.sqrt(
        (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y) +
        (p1.z - p2.z) * (p1.z - p2.z)
    )
}

function WGStoXYZ(location, R) {
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

function degToRad(degree) {
    return degree * Math.PI / 180;
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