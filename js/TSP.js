var formattedTime;
var POINTS_SERVER="https://cs.uef.fi/o-mopsi/api/server.php";
function startTimer(){
	g_startTime=Math.floor(new Date().getTime()/1000);
	g_timeCounterInterval=setInterval(function(){
		var now=Math.floor(new Date().getTime()/1000);
		var formattedTime=formatDuration(now-g_startTime);
		document.getElementById("actualTime_spent").innerHTML=formattedTime;
	},1000);	
}
function formatDuration(seconds){
	var hours=Math.floor(seconds/3600)+"";
	var minutes=Math.floor((seconds-hours*3600)/60)+"";
	var seconds=(seconds-hours*3600-minutes*60)+"";
	hours=hours.padStart(2,"0");
	minutes=minutes.padStart(2,"0");
	seconds=seconds.padStart(2,"0");
	var hoursPrefix="";
	if(hours!="00"){
		hoursPrefix=hours+":";
	}
	return hoursPrefix+minutes+":"+seconds;
}
function stoptimer(){
	 //document.getElementById("actualTime_spent").innerHTML=;
}
function showGameOver(){
	 var ex_time=document.getElementById("expected_time").innerHTML;
	 var ex_dist=document.getElementById("expected_distance").innerHTML;
	 var act_time=document.getElementById("actualTime_spent").innerHTML;
	 var time=act_time.toString().split(":");;
	 var text="";
	 switch(act_time.length){
		case 8://example 01:22:11
		     text=time[0].toString() +" Hr and " + time[1].toString() +" Min";
			 break;
		case 5://example 12:12
		     text=time[0].toString() +" Min and " + time[1].toString() +" Sec";
			 break;
		default:
		     text=time[0].toString() +" Days and " + time[1].toString() +" Hr";
			 break;
	}
   	 var act_dist=document.getElementById("actual_distance").innerHTML;
	 var correct=document.getElementById("correct_node").innerHTML;
	 var wrong=document.getElementById("wrong_node").innerHTML;
	swal({
	 title: 'Congratulations, You have visited all locations!',
	 type: 'success',
	 showCancelButton: true,
	 confirmButtonColor: '#3085d6',
     cancelButtonColor: '#3085d6',
     confirmButtonText: 'Save',
	 cancelButtonText: 'Home',
	 html:'<table>'+
	 '<tr><td><font size="3" color="#525430"><b>TSP Expected Time:</b></font></td><td><font size="3" color="#FFA700">'+ex_time+'</font></td></tr>'+
	 '<tr><td><font size="3" color="#525430"><b>Actual Time Spent:</b></font></td><td><font size="3" color="#FFA700">'+text+'</font></td></tr>'+
	 '<tr><td><font size="3" color="#525430"><b>TSP Expected Distance:</b></font></td><td><font size="3" color="#FFA700">'+ex_dist+'</font></td></tr>'+
	 '<tr><td><font size="3" color="#525430"><b>Total Distance Covered:</b></font></td><td><font size="3" color="#FFA700">'+act_dist+'</font></td></tr>'+ 
     '<tr><td><font size="3" color="#525430"><b>Correct Locations Visited:</b></font></td><td><font size="3" color="#FFA700">'+correct+'</font></td></tr>'+
	 '<tr><td><font size="3" color="#525430"><b>Wrong Locations Visited:</b></font></td><td><font size="3" color="#FFA700">'+wrong+'</font></td></tr>'+	
	 '</table>'
    }).then((result) => {
    if (!result.value) {//home
	     document.location.reload(true);
    }else{//save
     onSave(null);
    }
    })
}
function onSave(val_value){
	 //onSave dialog form
	 if(val_value==null){
     swal({
         title: 'Enter your TSP name here:',
         input: 'text',
         showCancelButton: true,
         inputValidator: (value) => {
             return !value && 'You need to write your TSP name!'
        }
    }).then((result) => {
         if (result.value){
			 var tsp_name=localStorage.getItem(result.value);
			 if(tsp_name==null){
	             save(result.value);
			     swal('Saved!','Your TSP has been saved.','success');
			     clearAllData()
			 }else{
				 onSave("TSP name already exists!");
			 }
        }else{
		  clearAllData();
		}
        })
	 }else{
		swal({
         title: 'TSP name already exists! Please type anther name:',
         input: 'text',
         showCancelButton: true,
         inputValidator: (value) => {
             return !value && 'You need to write your TSP name!'
        }
    }).then((result) => {
         if (result.value){
			 var tsp_name=localStorage.getItem(result.value);
			 if(tsp_name==null){
	             save(result.value);
			     swal('Saved!','Your TSP has been saved.','success');
			     clearAllData()
			 }else{
				 onSave("TSP name already exists!");
			 }
        }else{
		  clearAllData();
		}
        })
	 }
}
function onLoad(val_value){
	 //onLoad dialog form
	 closeMenus();
	 clearAllData();
	 if(val_value==null){
     swal({
         title: 'Enter your TSP name here:',
         input: 'text',
         showCancelButton: true,
         inputValidator: (value) => {
             return !value && 'You need to write your TSP name!'
        }
    }).then((result) => {
         if (result.value){
			 var tsp_name=localStorage.getItem(result.value);
			 if(tsp_name!=null){
	             load(tsp_name);
			     swal('Loaded!','Your TSP has been Loaded.','success');
			}else{
				 onLoad("TSP name does not exist!");
			 }
        }else{
          //cancel clicked		  
		 }
        });
	 }else{
		 swal({
         title: 'TSP name does not exist! Please type correct name:',
         input: 'text',
         showCancelButton: true,
         inputValidator: (value) => {
             return !value && 'You need to write your TSP name!'
        }
    }).then((result) => {
         if (result.value){
			 var tsp_name=localStorage.getItem(result.value);
			 if(tsp_name!=null){
	             load(tsp_name);
			     swal('Loaded!','Your TSP has been Loaded.','success');
			 }else{
				 onLoad("TSP name does not exist!");
			 }
        }else{
          //cancel clicked	
		}
        });
		 
	 }
} 
function calculateTSP (points){
    if(points.length>20){
		swal({type: 'error',title: 'TSP Path',text: 'Maximum 20 Locations allowed in this API!'});
		document.getElementById("home-btn").click();
		return;
	}
     clearAllPaths(null,"TSP");
     var param={
		"request_type":"tsp",
		"points":points,
		"fix_start":true
	 }
	httpPostAsync(POINTS_SERVER,
		"param="+JSON.stringify(param),
		TSPResult);
}
function TSPResult(stringOutput){
	simplebar.go(60);
	var points=JSON.parse(stringOutput);
	var start=points[0];
	var end=points[points.length-1];
	var waypoints=[];
	var new_targets=[];
	var loc;
	new_targets.push(start);
	if(points.length>20){
		swal({type: 'error',title: 'TSP Path',text: 'Maximum 20 Locations allowed in this API!'});
		document.getElementById("home-btn").click();
	}else{
	     for(var i=1;i<points.length-1;i++){
		     loc={lat: points[i]["lat"], lng: points[i]["lng"]};
			 new_targets.push(loc);
		     waypoints.push({
                 location: loc,
                 stopover: false //this turns off the markers from waypoints 
             });
	    }
	     if(waypoints.length>0){
			 simplebar.go(70);
		     navigationFromTo(start,end,waypoints,"TSP");
		}else{
			  simplebar.go(70);
		      navigationFromTo(start,end,null,"TSP");
	    }
	}
	 new_targets.push(end);
     setTargetLocations(new_targets);	
}
