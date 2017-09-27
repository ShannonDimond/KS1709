var transitionMode = "instant";
var hidFrame = "frame0"; 
var visFrame = "frame1";
var id = 0;

function initialise() 
{
  connectToRelay();
	
  document.getElementById( hidFrame ).innerHTML = '<div align=center><H3 style="font-size:40px;color:#555;">goo.scem.ws</h3><hr style="height:10px;background-color:#fff"><br><br><br><pre style="font-size:30px;color:white;">screenId:</pre><H1 style="font-size:300px;color:white;line-height:0%;top:-70px;position:relative;">' + id + '.0</h1><hr><pre style="font-size:28px;color:white;">' + printConfig() + '</pre></div><hr style="height:10px; background-color:#fff"></br><img src="media/wonderama.png" width=340 style="position:absolute;left:740;top:550">';
	handleSwap();
}

function handleMesg( data ) 
{
	console.log('data:' + data);
	if (!data.length > 0) 
	{ 
		return; 
	}

	var cmd = data.charAt(0);
	if (data.length == 1) { // just a command
		switch (cmd) {
			case 'S':
				handleSwap();
				break;
			case 'R':
				handleReload();
				break;
			case 'N':
				handleUnlimited();
				break;
			default:
				console.log('Unknown cmd='+ cmd);
		}
	}
	if (data.length > 1) { // command with argument
		var arg = data.substring(1, data.length);
		switch (cmd) {
			case 'U':
				handleURL(arg);
				break;
			case 'I':
				handleImage(arg);
				break;
			case 'H':
				handleHTML(arg);
				break;
			case 'V':
				handleVideo(arg);
				break;
			case 'T':
				handleTransitionMode(arg);
			case 'C':
				handleVideoControl(arg);
				break;
			default:
				console.log('Unknown cmd=' + cmd + ' arg:' + arg);
		}
	}
}

function handleSwap() 
{
	//console.log("pre-swap visFrame:"+visFrame);
	//console.log("pre-swap hidFrame:"+hidFrame);

	var toBeHidden = visFrame;
	var tbh = toBeHidden;

	//Perform appropiate transition type
	switch (transitionMode) 
	{
		case 'blend':
			window.setTimeout( function() { document.getElementById( tbh ).style.opacity = 0;}, 500);
			document.getElementById( hidFrame ).style.opacity = 1;
			document.getElementById( hidFrame ).style.transition = 'visibility 0s linear 0.5s,opacity 0.5s linear';
			break;
		case 'swipeLeft':
			//code for swipe left
			break;
		default: //Instant Swap
			document.getElementById( toBeHidden ).style.transition = '';
			document.getElementById( hidFrame ).style.transition = '';
			document.getElementById( toBeHidden ).style.opacity = 0;
			document.getElementById( hidFrame ).style.opacity = 1;
	}

	var tmpFrame = visFrame;
	visFrame = hidFrame;
	hidFrame = tmpFrame;
	//console.log("post-swap visFrame:"+visFrame);
	//console.log("post-swap hidFrame:"+hidFrame);
}

function handleReload() {
location.reload();
}

function handleTransitionMode(transitionType) 
{
	transitionMode = transitionType;
}

function handleURL(url) 
{
	hidFrame = 'iframe' + getNextFrameId( visFrame );
	console.log("url "+ url + " into " + hidFrame );
	document.getElementById( hidFrame ).src = url;
}

function getNextFrameId ( frame ) 
{ // if iframe1 return 0
	var num = frame.substring(frame.length -1, frame.length);
	num = ++num % 2;
	return num;
}

function handleHTML(html) 
{
	hidFrame = 'frame' + getNextFrameId(visFrame);
	console.log("html "+ html + " into " + hidFrame);
	document.getElementById(hidFrame).innerHTML = html;
}

function handleImage(image) 
{
	console.log("image " + image);
	handleHTML("<img src='"+ image+"'>");
}

function handleVideoControl(conArg) {
	console.log('Control Option '+ conArg);
	switch (conArg) {
		case 'Pause':
			document.getElementById('v'+visFrame).pause();
			break;
		case 'Play':
			document.getElementById('v'+visFrame).play();
			break;
		case 'Rewind':
			document.getElementById('v'+visFrame).pause();
			document.getElementById('v'+visFrame).currentTime = 0.1;
			break;
		case 'Mute':
			document.getElementById('v'+visFrame).volume = 0;
			break;
	 case 'Unmute':
			document.getElementById('v'+visFrame).volume = 1;
			break;
	 default:
			document.getElementById('v'+visFrame).currentTime = conArg;
		 break;
	}
}

function handleVideo( vidArg ) {
	console.log('video '+ vidArg );
	switch (vidArg) {
		case 'Pause':
			document.getElementById('v'+visFrame).pause();
			break;
		case 'Play':
			document.getElementById('v'+visFrame).play();
			break;
		case 'Rewind':
			document.getElementById('v'+visFrame).pause();
			document.getElementById('v'+visFrame).currentTime = 0.1;
			break;
		case 'Mute':
			document.getElementById('v'+visFrame).volume = 0;
			break;
	 case 'Unmute':
			document.getElementById('v'+visFrame).volume = 1;
			break;
		case 'Slow':
			document.getElementById('v'+visFrame).playbackRate = 0.8;
			break;
		case 'Normal':
			document.getElementById('v'+visFrame).playbackRate = 1.0;
			break;
	 default:
		 hidFrame = 'vidFrame' + getNextFrameId( visFrame );
		 var vidStr = '<video id="v'+ hidFrame +'" height="100%"><source src="'+vidArg+'" type="video/mp4"></video>';
		 console.log('vidstr '+ vidStr );
		 document.getElementById( hidFrame ).innerHTML = vidStr;
		 break;
	}
}