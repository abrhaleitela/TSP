function nextMove(){
	var targetfound=document.getElementById("targetfound");
	targetfound.play();
}
function allTargetsVisited(){
	var alltargetsvisited=document.getElementById("alltargetsvisited");
	alltargetsvisited.play();
	stoptimer();
}
function wrongMove(){
	var wrongmove=document.getElementById("wrongmove");
	wrongmove.play();
}
function noNodeVisited(){
	var no_vode_visited=document.getElementById("no_vode_visited");
	no_vode_visited.play();
}
function playSound(i,length){
	if (i==1 && i < length-1){//next node visited correctly 
	     nextMove();
		 updateCounter("Correct");
	}else if(i==length-1 && i==1){//all the nodes visited
		allTargetsVisited();
		updateCounter("Correct");
		showGameOver();
	}else if(i==0,length==0){//user not visited any node (in a way to visited node)
		//noNodeVisited();	
	}else{//wrong node visited
	 wrongMove();
	 updateCounter("Wrong");
	 setWrong(true);	
	}
}