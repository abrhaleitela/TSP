try{
	var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
}catch(e){
     console.error(e);
     $('.no-browser-support').show();
     $('.app').hide();
	 swal({type: 'error',title: 'Voice Interaction',text: 'Your browser does not supper voice interaction'});
}
var voice_content = '';
recognition.continuous = true;
var started=false;
var currentInterfaceRunning;
var trail;
recognition.onresult = function(event) {
     voice_content="";
     // event is a SpeechRecognitionEvent object.
     // It holds all the lines we have captured so far. 
     // We only need the current one.
     var current = event.resultIndex;
     // Get a transcript of what was said.
     var transcript = event.results[current][0].transcript;
     // Add the current transcript to the contents of our Note.
     // There is a weird bug on mobile, where everything is repeated twice.
     // There is no official solution so far so we have to handle an edge case.
     var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
     if(!mobileRepeatBug){
         voice_content = transcript;
		 switch(currentInterfaceRunning){
			 case "save":
			     interactInsideSave(voice_content);
			     break;
			 case "load":
			     interactInsideLoad(voice_content);
			     break;
			 case "new_tsp":
			     readSentence("I can only hear English");
				 readSentence("So it is better to write your locations in your own language.");
				 break;
			 default: //main page
			     interact(voice_content);
			     break;
		 }
	}
};
recognition.onstart = function(){ 
     started=true;
     swal({title: 'Voice Interaction',text: 'Voice recognition activated. Try speaking into the microphone.'});
};
recognition.onspeechend = function(){
	 started=false;
	 swal({type: 'error',title: 'Voice Interaction',text: 'You were quiet for a while so voice recognition turned itself off.'});
     setVoiceFlag(false);
};
recognition.onerror = function(event){
	if(event.error == 'no-speech'){
	     swal({type: 'error',title: 'Voice Interaction',text: 'No speech was detected. Please try again.'});
	};
}
function interactInsideLoad(voice_content){
	if(voice_content.includes("cancel") || voice_content.includes("Cancel")){
		 document.getElementById("btn_cancel-save").click();
		 return;
	 }
	 if(document.getElementById("text_load_tsp").value==""){
	     readSentence("Is this name what you said?");
	     document.getElementById("text_load_tsp").value=voice_content.toString().trim();
	 }else{
		 checkAndLoad(voice_content);
	 }
}
function checkAndLoad(voice_content){
	if(voice_content.includes("no") || voice_content.includes("No")){
	     readSentence("I am sorry, Can you please try again?");
		 trail=trail+1;
    }else if(voice_content.includes("yes") || voice_content.includes("Yes") || voice_content.includes("Load") || voice_content.includes("load")){
	     Loading();
	}else{
		 readSentence("Is this name what you said?");
	     document.getElementById("text_load_tsp").value=voice_content.toString().trim();
	}
}
function Loading(){
	var tsp_name=localStorage.getItem(document.getElementById("text_load_tsp").value.toString().trim());
	 if(document.getElementById("text_load_tsp").value.toString().trim()==""){
		 readSentence("Please Enter valid name.");
	}else if(tsp_name==null){
		 readSentence("Name does not exists, Please type correct name.");
	}else{
		 load(tsp_name);
	     readSentence("Your data has been loaded successfully.");
		 document.getElementById("text_load_tsp").value="";
		 currentInterfaceRunning="main";
		 document.getElementById("close_load").click();
	}
}
function startVoiceInteraction(){
	closeMenus();
	if(started){
		swal({type: 'error',title: 'Voice Interaction',text: 'You have already started voice recognition.'});
		return;
	}
	if (voice_content.length){
		voice_content += ' ';
	}
	currentInterfaceRunning="default";
	recognition.start();
}
function pause(){
	recognition.stop();
    swal({type: 'error',title: 'Voice Interaction',text: 'Voice recognition paused.'});
}
function readSentence(text) {
	var speech = new SpeechSynthesisUtterance();
    // Set the text and voice attributes.
	speech.text = text;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;
  	window.speechSynthesis.speak(speech);
}
function interactInsideSave(voice_content){
	 if(voice_content.includes("cancel") || voice_content.includes("Cancel")){
		 document.getElementById("btn_cancel-save").click();
		 return;
	 }
	 if(document.getElementById("text_save_tsp").value==""){
	     readSentence("Is this name what you said?");
	     document.getElementById("text_save_tsp").value=voice_content.toString().trim();
	 }else{
		 checkAndSave(voice_content);
	 }	 
}
function checkAndSave(voice_content){
    if(voice_content.includes("no") || voice_content.includes("No")){
	     readSentence("I am sorry, Can you please try again?");
		 trail=trail+1;
    }else if(voice_content.includes("yes") || voice_content.includes("Yes") || voice_content.includes("Save") || voice_content.includes("save")){
	     alert("inside yes")
		 Saving();
	}else{
		 readSentence("Is this name what you said?");
	     document.getElementById("text_save_tsp").value=voice_content.toString().trim();
	}
}
function Saving(){
	 var tsp_name=localStorage.getItem(document.getElementById("text_save_tsp").value.toString().trim());
	 if(document.getElementById("text_save_tsp").value.toString().trim()==""){
		 readSentence("Please Enter valid name.");
	}else if(tsp_name==null){
		 save(document.getElementById("text_save_tsp").value.toString().trim());
	     readSentence("Your data has been saved successfully.");
		 document.getElementById("text_save_tsp").value="";
		 currentInterfaceRunning="main";
		 document.getElementById("close_save").click();
	}else{
		 readSentence("Name already exists, Please try anther name.");
	}
}
function VISave(){
	document.getElementById("vi_save_tsp").click();
}
function VILoad(){
	document.getElementById("vi_load_tsp").click();
}
function interact(voice_content){
	setVoiceFlag(true);
	var val=validateSound(voice_content);
	switch(val){		
		 case "save_tsp":
		     if(validateSave()){
				 currentInterfaceRunning="save";
				 VISave();//voice interactive save
				 readSentence("Please enter name for your datas.");
			}else{
				 readSentence("You don't have any data to save.");
			 }
			 
		     break;
	     case "load_tsp":
		     readSentence("Please enter datas name.");
			 currentInterfaceRunning="load";
			 VILoad();//voice interactive load
			 break;
		 case "new_tsp":
		     currentInterfaceRunning="new_tsp";
			 document.getElementById("new-tsp").click();
			 readSentence("Add your target locations in the textbox.");
			 break;
		 case "recalculate_tsp":
		     currentInterfaceRunning="main";
			 recalculate();
			 readSentence("Your path has been updated.");
			 break;
		 default:
		     currentInterfaceRunning="main";
		     readSentence("I can only hear features of this application. Please make it clear when you talk.");
			 break;	    
	}
}	
function validateSound(voice_content){
	var val="";
	if(voice_content.includes("save my tsp") ||voice_content.includes("Save") || voice_content.includes("save")){
		val="save_tsp";
		trail=0;
	}else if((voice_content.includes("load my tsp") ||voice_content.includes("Load") || voice_content.includes("load"))){
		val="load_tsp";
	}else if((voice_content.includes("new tsp") ||voice_content.includes("New") || voice_content.includes("new"))){
		val="new_tsp";
	}else if((voice_content.includes("recalculate my tsp") ||voice_content.includes("Recalculate") || voice_content.includes("recalculate"))){
		val="recalculate_tsp";
	}else{
		val="no function";
	}
	return val;	
}
function resetVIFlag(){
	currentInterfaceRunning="main";
}