/*--------------------------------------------------------
									DEVELOPER NOTES
----------------------------------------------------------
More comments are needed throughout this document.
Need to standardise the code formatting.
Currently implementing video controls.
System only accepts video's and images. Web pages are for 
setting display to black.
--------------------------------------------------------*/


/*--------------------------------------------------------
										Variable Decliration
--------------------------------------------------------*/
var currentSlideName = "";								//Tracks the name of the current file
var currentSlideType = "";								//Tracks the type of the current file
var nextSlideName = "";										//Tracks the name of the next file
var nextSlideType = "";										//Tracks the type of the next file
var mediaFilePath = "../Presentation/";		//The path to the root folder where media items are stored
var imageFilePath = "../images/"					//The path to the root folder where images are stored
var webFilePath = "";											//The path to the root folder where webpages are stored
var playVideo = "Play";										//Standard command to Play a video
var pauseVideo = "Pause";									//Standard command to Pause a video
var muteVideo = "Mute";										//Standard command to Mute a video
var unmuteVideo = "Unmute";								//Standard command to Unmute a video
var endPage = "black.jpg"								//Black HTML page used to set the screens to black
var invalidFileTypeName = "invalidFileType.png"
var fileNotFoundName = "fileNotFound.png"
var loadingName = "loadingSlide.png";
var slideDeckNotFoundName = "presentationOrderNotFound.png";
var slideDeckEmptyName = "presentationOrderEmpty.png";
var webpageFiletypes = ["htm", "html"];						//An array to track all the avaliable webpage types
var videoFiletypes = ["mp4", "webm"];							//An array to track all the avaliable video types
var imageFiletypes= ["jpg", "png", "gif", "bmp"];	//An array to track all the avaliable image types

/*--------------------------------------------------------
									Start Presentation
----------------------------------------------------------
This method sets the current slide to a blank, default page
and the next slide to the first slide in the deck. The next
slide is buffered in the hidden frame, ready to be displayed
once loaded.
--------------------------------------------------------*/
function startPresentation()
{
	var index = 0;
	var nextFileValidity = "valid";

	//Show elements
	$("#transitionDiv").show();
	$("#currentSlideHeading").show();
	$("#nextSlideHeading").show();
	
	//Disable the loadSlide button
	$("#loadSlide").css("color", "white");
	$("#loadSlide").attr("disabled", true);
	$("#loadSlide").val("Loading...");
	
	//Disable the slide deck
	validateSlideDeck("disable");
	
	//Assign the currentSlideImage to the endPage and send/swap
	nextSlideName = endPage;
	nextSlideType = "jpg";
	currentSlideName = nextSlideName;
	currentSlideType = nextSlideType;
	displayImagePreview("current", imageFilePath, currentSlideName);
	
	//Assign the first element of the slide deck to 'next' variables
	$('#order').children('input').each(function() 
	{
		index++;
		if (index == 1)			//First element in the document
		{
			nextSlideName = this.id;
			nextSlideType = this.id.substr(this.id.lastIndexOf('.') + 1);	
			$(this).addClass("btn-primary-hovered");
		}
	});
	
	//Display the slide's filename next to the Next Slide heading
	$("#nextSlideHeading").html("Next Slide: " + nextSlideName.substr(nextSlideName.lastIndexOf('/') + 1));
	
	//Set the Next Slide to a loading screen
	displayImagePreview("next", imageFilePath, loadingName);
	
	//Validate the next slide type and display it
	if (validateFiletype(videoFiletypes, nextSlideType))
	{
		checkFileExists(mediaFilePath, nextSlideName, "video", displayNextSlide)
	}
	else if (validateFiletype(webpageFiletypes, nextSlideType))
	{
		checkFileExists(webFilePath, nextSlideName, "web", displayNextSlide)
	}
	else if (validateFiletype(imageFiletypes, nextSlideType))
	{
		checkFileExists(mediaFilePath, nextSlideName, "image", displayNextSlide)
	}
	else
	{
		nextFileValidity = "invalidFileType";
		displayNextSlide(nextSlideName, nextFileValidity, "error", imageFilePath);
	}
}

/*--------------------------------------------------------
										Process Load Slide
----------------------------------------------------------
The purpose of this method is to process it to display the 
slide currently in the "Next Slide" section of the interface.
It sets the current slide to the next slide, then looks through
the slide deck and determines what the new next slide will be.
It swaps the frames and then loads the next slide into the
hidden frame.
--------------------------------------------------------*/
$(document).ready(function() 
{
	$("#loadSlide").click(function() 
	{
		var nextFileValidity = "valid";
		var currentFileValidity = "valid";		//May not be needed?
		var filePosition = 0;
		
		//Disable the loadSlide button
		$("#loadSlide").css("color", "white");
		$("#loadSlide").attr("disabled", true);
		$("#loadSlide").val("Loading...");
	
		if (validateFiletype(videoFiletypes, currentSlideType))
		{
			sendVideoControl(pauseVideo);
		}
		
		//Swap the frames
		sendSwap();
		
		//Disable the slide deck
		validateSlideDeck("disable");
		
		//Set the current slide to the next slide
		currentSlideName = nextSlideName;
		currentSlideType = nextSlideType;
		
		//Set the Next Slide to the next slide in the presentation play list
		var presentationOrder = document.getElementById("order").childNodes;
		var fileFound;
		var index;

		for (index = 0; index < presentationOrder.length; index++) 
		{
			if (currentSlideName == presentationOrder[index].id && !(fileFound))
			{
				index++;
				if (index < presentationOrder.length) 
				{				
					fileFound = true;
					filePosition = index;
					nextSlideName = presentationOrder[index].id;
					nextSlideType = presentationOrder[index].id.substr(presentationOrder[index].id.lastIndexOf('.') + 1);
				}
			}
		}		
		
		//If the next slide is the end of the slide deck, display the last slide again
		if (!fileFound)
		{
			fileFound = false;
			nextSlideName = presentationOrder[presentationOrder.length-1].id;
			nextSlideType = presentationOrder[presentationOrder.length-1].id.substr(presentationOrder[presentationOrder.length-1].id.lastIndexOf('.') + 1);	
		}
		
		//Display the Next and Current slide names in the slide headings
		$("#currentSlideHeading").html("Current Slide: " + currentSlideName.substr(currentSlideName.lastIndexOf('/') + 1));
		$("#nextSlideHeading").html("Next Slide: " + nextSlideName.substr(nextSlideName.lastIndexOf('/') + 1));
		
		//Set the Next Slide to a loading screen
		displayImagePreview("next", imageFilePath, loadingName);

		//Set the current slide preview window
		//MAY REQUIRE FILE EXISTING CHECKS?
		if (filePosition == presentationOrder.length || !(fileFound))			//When on the last slide
		{
			if (validateFiletype(imageFiletypes, currentSlideType))
			{
				displayImagePreview("current", imageFilePath, currentSlideName);
			}
		}
		else 																															// Not on the last slide
		{
			if (validateFiletype(videoFiletypes, currentSlideType))
			{
				displayVideoPreview("current", mediaFilePath, currentSlideName);
				//DEVELOPER NOTES: NEEDS TO BE CHECKED
				sendVideoControl(playVideo);
				sendVideoControl(unmuteVideo);
			}
			else if (validateFiletype(webpageFiletypes, currentSlideType))
			{
				displayWebPreview("current", webFilePath, currentSlideName);
			}
			else if (validateFiletype(imageFiletypes, currentSlideType))
			{
				displayImagePreview("current", mediaFilePath, currentSlideName);
			}
			else 
			{
				//alert("File Type Error: " + currentSlideName + " has a filetype of " + currentSlideType + ", which isn't a valid filetype");
			}
		}
		
		//Indent the current slide in the slide deck
		$('#order').children('input').each(function() 
		{
			if (nextSlideName == this.id)
			{				
				$(this).addClass("btn-primary-hovered");
			}
			else
			{
				$(this).removeClass("btn-primary-hovered");
			}
		});
		
		//Validate the next slide type and display it
		if (filePosition == presentationOrder.length-1 || !(fileFound))			//When on the last slide
		{
			if (validateFiletype(imageFiletypes, nextSlideType))
			{
				checkFileExists(imageFilePath, nextSlideName, "image", displayNextSlide)
			}
			else
			{
				nextFileValidity = "invalidFileType";
				displayNextSlide(nextSlideName, nextFileValidity, "error", imageFilePath);
			}
		}
		else 
		{
			if (validateFiletype(videoFiletypes, nextSlideType))
			{
				checkFileExists(mediaFilePath, nextSlideName, "video", displayNextSlide)
			}
			else if (validateFiletype(webpageFiletypes, nextSlideType))
			{
				checkFileExists(webFilePath, nextSlideName, "web", displayNextSlide)
			}
			else if (validateFiletype(imageFiletypes, nextSlideType))
			{
				checkFileExists(mediaFilePath, nextSlideName, "image", displayNextSlide)
			}
			else
			{
				nextFileValidity = "invalidFileType";
				displayNextSlide(nextSlideName, nextFileValidity, "error", imageFilePath);
			}
		}
	});
});

/*--------------------------------------------------------
											Preview Slide
----------------------------------------------------------
Processes the Preview Slide deck. This function loads the 
elements of the slide deck into a HTML object. It then 
iterates through them to find the one the user clicked.
once found it sets the slide preview to that specific slide
and then buffers it in the hidden iFrame.
--------------------------------------------------------*/
function previewSlide(clicked_id) 
{
	var index = 0;
	var nextFileValidity = "valid";
	
	//Set the current to the next fields
	nextSlideName = currentSlideName;
	nextSlideType = currentSlideType;
	
	//Disable Load Next Slide button
	$("#loadSlide").css("color", "white");
	$("#loadSlide").attr("disabled", true);
	$("#loadSlide").val("Loading...");
	
	//Disable the slide deck
	validateSlideDeck("disable");
	
	//Loop through each element in the slide deck & assign variables
	$('#order').children('input').each(function() 
	{
		index++;
    if (clicked_id == this.id)
		{
			nextSlideName = this.id;
			nextSlideType = this.id.substr(this.id.lastIndexOf('.') + 1);
			$(this).addClass("btn-primary-hovered");
		}
		else
		{
			$(this).removeClass("btn-primary-hovered");
		}
	});
	
	//Display the filename next to the Next Slide heading
	$("#nextSlideHeading").html("Next Slide: " + nextSlideName.substr(nextSlideName.lastIndexOf('/') + 1));
	
	//Set the Next Slide to a loading screen
	displayImagePreview("next", imageFilePath, loadingName);
	
	//Validate the next slide type and display it
	if (validateFiletype(videoFiletypes, nextSlideType))
	{
		checkFileExists(mediaFilePath, nextSlideName, "video", displayNextSlide)
	}
	else if (validateFiletype(webpageFiletypes, nextSlideType))
	{
		checkFileExists(webFilePath, nextSlideName, "web", displayNextSlide)
	}
	else if (validateFiletype(imageFiletypes, nextSlideType))
	{
		checkFileExists(mediaFilePath, nextSlideName, "image", displayNextSlide)
	}
	else
	{
		nextFileValidity = "invalidFileType";
		displayNextSlide(nextSlideName, nextFileValidity, "error", imageFilePath);
	}
}

/*--------------------------------------------------------
									Load Slide Preview
----------------------------------------------------------
Loads the Preview Slide deck. This function loads the 
presentationOrder file from the Server into a JSON object.
The file is written as a parseable array and can be iterated
through.
If the file is empty, then it calls the displayErrorPage 
method with an appropiate error mesage paramater. If the 
file cant be read, it calls it with an appropiate error 
message paramater.
Otherwise, the function iterates through the array and for each
element in it, it creates a button in the Preview Slide Deck 
with it's value and ID equal to the data in the file. 
It then created a "Set Displays to Black" button which is
appended to the end of the Slide Deck.
--------------------------------------------------------*/

function loadSlidePreview(callFunction)
{
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4)
		{
			if (this.status == 200) 
			{
				var presentationOrder = JSON.parse(this.responseText);
				var arrayLength = presentationOrder.length;
				
				//If the document is empty, display an error message.
				if (arrayLength < 1)
				{
					displayErrorPage("empty");
				}
				else 
				{
					//For each element in the notepad document, add it to the Slide Deck
					for (index = 0; index < arrayLength; index++) 
					{
						var filenameWithoutPath = presentationOrder[index].substr(presentationOrder[index].lastIndexOf('/') + 1);	
						document.getElementById("order").innerHTML += ("<input type='button' class='btn btn-primary btn-md btn-block' onClick='previewSlide(this.id)' id='" + presentationOrder[index] + "' value='" + filenameWithoutPath + "' />");  
					}

					//Add a Set To Black button to the Slide Deck
					document.getElementById("order").innerHTML += ("<input type='button' class='btn btn-primary btn-md btn-block' onClick='previewSlide(this.id)' id='" + endPage + "' value='Set Displays to Black'/>");
					
					//Calls the StartPresentation function
					callFunction();
				}
			}
			
			//If the file isn't readable, display an error message
			else
			{
				displayErrorPage("notFound");
			}
		}
	};
	xmlhttp.open("GET", "../presentationOrder.txt", true);
	xmlhttp.send();
}

/*--------------------------------------------------------
							Handle Transition Type
----------------------------------------------------------
This method sends the transition type to the display clients.
Once the radio button selects a new option, it sends that 
option to the display client.
--------------------------------------------------------*/
$(document).ready(function() 
{
	$('input[type=radio][name=transitionType]').change(function() {
			sendTransition(this.value);
  });
});

/*--------------------------------------------------------
												Initialise
----------------------------------------------------------
The purpose of this function it to load up the needed 
elements for the page. It connects to the Relay and calls
the loadSlidePreview method.
--------------------------------------------------------*/
function initialise() 
{
	connectToRelay();
	loadSlidePreview(startPresentation);
}

/*--------------------------------------------------------
										Validate Filetype
----------------------------------------------------------
The purpose of this method is to see if a slide's filetype
is valid or not. It compares the passed in filetype with 
an array of filetypes. If the filetype is found in the
array, then it returns true. If not, it returns false.
--------------------------------------------------------*/
function validateFiletype(filetypeArray, filetype) 
{
	var filetypeLowerCase = filetype.toLowerCase();
	for (var index = 0; index < filetypeArray.length; index++)
	{
		//REQUIRES A CHECK TO MAKE THE FILETYPE LOWER CASE!!!!
		if (filetypeLowerCase == filetypeArray[index])
		{
			return true;
		}
	}
	
	return false;
}

/*--------------------------------------------------------
										Display Image Preview
----------------------------------------------------------
COMMENTS
--------------------------------------------------------*/
function displayImagePreview(previewWindowName, filePath, filename) 
{
	$("#" + previewWindowName + "SlideImage").attr('src', filePath + filename);
	$("#" + previewWindowName + "SlideImage").show();
	$("#" + previewWindowName + "SlideWebpage").hide();
	$("#" + previewWindowName + "SlideVideo").hide();
}

/*--------------------------------------------------------
										Display Web Preview
----------------------------------------------------------
COMMENTS
--------------------------------------------------------*/
function displayWebPreview(previewWindowName, filePath, filename) 
{
	$("#" + previewWindowName + "SlideWebpage").attr('src', filePath + filename);
	$("#" + previewWindowName + "SlideWebpage").show();
	$("#" + previewWindowName + "SlideImage").hide();
	$("#" + previewWindowName + "SlideVideo").hide();
}

/*--------------------------------------------------------
									 Display Video Preview
----------------------------------------------------------
COMMENTS
--------------------------------------------------------*/
function displayVideoPreview(previewWindowName, filePath, filename) 
{
	$("#" + previewWindowName + "SlideVideo").attr('src', filePath + filename);
	$("#" + previewWindowName + "SlideVideo").show();
	$("#" + previewWindowName + "SlideImage").hide();
	$("#" + previewWindowName + "SlideWebpage").hide();
}

/*--------------------------------------------------------
													Send URL
----------------------------------------------------------
The purpose of this function is to send the next HTML slide
to the display clients. The letter U is the indication to
client that it is a HTML page/URL. The filepath is appended 
to it as well as the filename.
--------------------------------------------------------*/
function sendURL() 
{
	socketSend('U' + webFilePath + nextSlideName);
}

/*--------------------------------------------------------
								     SEND HTML (DELETE?)
----------------------------------------------------------
FILL IN
--------------------------------------------------------*/
function sendHTML() 
{
	socketSend('H' + html);

}

/*--------------------------------------------------------
												Send Image
----------------------------------------------------------
The purpose of this function is to send the next image slide
to the display clients. The letter I is the indication to
client that it is an image. The filepath is appended to it
as well as the filename.
--------------------------------------------------------*/
function sendImage(path) 
{
	socketSend('I' +  path + nextSlideName);
}

/*--------------------------------------------------------
										  Send Video
----------------------------------------------------------
The purpose of this function is to send the next video slide
to the display clients. The letter V is the indication to
client that it is a video. The filepath is appended to it
as well as the filename.
--------------------------------------------------------*/
function sendVideo() 
{
	socketSend('V' + mediaFilePath + nextSlideName);
}

/*--------------------------------------------------------
										Send Transition
----------------------------------------------------------
The purpose of this method is to send the transition type 
to the client. The T is the indication to the client that 
it is a transition message. The transition type is then
appended to it.
--------------------------------------------------------*/
function sendTransition(transitionType) 
{
	socketSend('T' + transitionType);
}

/*--------------------------------------------------------
										TESTING VIDEO CONTROLS
----------------------------------------------------------
THIS WILL BE DELETED ONCE A WORKING VIDEO CONTROL INTERFACE
IS CREATED. FUNCTION WILL WORK DIFFERENTLY.
--------------------------------------------------------*/

$(document).ready(function() 
{
	var vid = document.getElementById("currentSlideVideo");
	
	vid.onplay = function() 
	{
		sendVideoControl(playVideo);
	};
	
	vid.onpause = function() 
	{
		sendVideoControl(pauseVideo);
	};
	
	vid.onvolumechange = function() 
	{
		if (vid.muted == true)
		{
			sendVideoControl(muteVideo);
			//vid.volume = 0;
		}
		else if (vid.muted == false)
		{
			sendVideoControl(unmuteVideo);
			//vid.volume = 0.00000000001;
		}
	};
	
	vid.onseeked = function()
	{
		sendVideoControl(vid.currentTime);
	}
})

/*--------------------------------------------------------
										Send Video Controls
----------------------------------------------------------
The purpose of this function is to send a video control 
to the client. The letter V is the indication to the client
that it is a video based message. It then appends to passed
in control option to the message.
--------------------------------------------------------*/
function sendVideoControl(controlOption) 
{
	socketSend('C' + controlOption);
}

/*--------------------------------------------------------
												Send Reload
----------------------------------------------------------
FILL IN, WILL BE IMPLEMENTED AT SOME STAGE
--------------------------------------------------------*/
function sendReload() 
{
  socketSend('R');
}

/*--------------------------------------------------------
												Send Swap
----------------------------------------------------------
The purpose of this function is to tell the client to swap
the visible and invisible frames. The letter S is the
indiciation to the client that a swap request has been sent.
--------------------------------------------------------*/
function sendSwap() 
{
  socketSend("S");
}

/*--------------------------------------------------------
										Check File Exists
----------------------------------------------------------
The purpose of this function is to check if a file exists.
It talks to the server to determine if it can load the file
up. If it can, then it calls the callback function with a
fileValidity parameter of valid. Otherwise, it calls it 
with a notFound error.
--------------------------------------------------------*/
function checkFileExists(path, filename, mediaType, callFunction)
{
	var fileValidity = "notFound";
	
	var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4)
		{
			if (this.status == 200) 
			{
				fileValidity = "valid";
				callFunction(filename, fileValidity, mediaType, path);
			}
			else
			{
				fileValidity = "notFound";
				callFunction(filename, fileValidity, mediaType, imageFilePath);
			}
		}
	};
	xmlhttp.open("GET", path + filename, true);
	xmlhttp.send();
}

/*--------------------------------------------------------
							Validate Load Slide Button
----------------------------------------------------------
The purpose of this method is to alter the load slide 
button depending upon the validity of the next slide. If
the slide is either of an invalid type of it isn't found
on the server, then the button is disabled and a red message
is displayed on the button. Otherwise, the button is enabled 
and it displayed "Load Next Slide" in white.
--------------------------------------------------------*/
function validateLoadSlideButton(filename, fileValidity)
{
	//Assign the first element of the slide deck to 'next' variables
	$('#order').children('input').each(function() 
	{
		if (filename == this.id)
		{
			if (fileValidity == "invalidFileType")
			{
				$("#loadSlide").attr("disabled", true);
				$("#loadSlide").val("Invalid File Type");
				$("#loadSlide").css("color", "#990000");
				$(this).css("color", "#990000");
			}
			else if (fileValidity == "notFound")
			{
				$("#loadSlide").attr("disabled", true);
				$("#loadSlide").val("File Not Found");
				$("#loadSlide").css("color", "#990000");
				$(this).css("color", "#990000");
			}
			else if (fileValidity == "valid")
			{
				$("#loadSlide").attr("disabled", false); 
				$("#loadSlide").val("Load Next Slide");
				$("#loadSlide").css("color", "white");
				$(this).css("color", "white");
			}	
		}
	});
	
	//Enable the slide deck
	validateSlideDeck("enable");
}

/*--------------------------------------------------------
									Display Next Slide
----------------------------------------------------------
The purpose of this method is to display either a slide or
an error message in the Next Slide preview window. It 
checks to see if the file is currently valid. If it isn't
then it displays the appropiate error. If it is valid, it 
displays either a web, video or image media preview window.
Finally, it calls the validateLoadSlideButton method.

A large amount of the code here is set on a delay. This is 
to ensure that the swap procedures are occuring before 
buffering the net slide. Furthermore, it sets a consistent
"loading" state to occur upon every slide load in order to
prevent potential errors.
--------------------------------------------------------*/
function displayNextSlide(filename, fileValidity, contentType, path)
{	
	var delay = 1100;
	if (fileValidity == "notFound")
	{
		setTimeout(function(){ displayImagePreview("next", path, fileNotFoundName) }, delay);
	}
	else if (fileValidity == "invalidFileType")
	{
		setTimeout(function(){ displayImagePreview("next", path, invalidFileTypeName) },  delay);
	}
	else
	{
		if (contentType == "video")
		{
			setTimeout(function(){ displayVideoPreview("next", path, nextSlideName) },  delay);
			setTimeout(sendVideo, delay);				//DEVELOPER NOTES: MAY NEED A VIDEOPAUSE HERE. NEEDS TESTING.
		}
		else if (contentType == "web")
		{
			setTimeout(function(){ displayWebPreview("next", path, nextSlideName) },  delay);
			setTimeout(sendURL, delay);
		}
		else if (contentType == "image")
		{
			setTimeout(function(){ displayImagePreview("next", path, nextSlideName) },  delay);
			setTimeout(function(){ sendImage(path) }, delay);
		}
	}
	
	//Enable or Disable the loadSlide button
	setTimeout(function(){ validateLoadSlideButton(nextSlideName, fileValidity) },  delay);
}

/*--------------------------------------------------------
									Display Error Page
----------------------------------------------------------
The purpose of this method is to display appropiate error
messages regarding the reading of the presentationOrder.txt 
file. If the fie isn't found, a specific message is displayed.
If the file is empty, a different error messae is displayed
instead.
--------------------------------------------------------*/
function displayErrorPage(errorType)
{
	//Show elements
	$("#transitionDiv").show();
	$("#currentSlideHeading").show();
	$("#nextSlideHeading").show();

	//Disable the loadSlide button
	$("#loadSlide").attr("disabled", true);
	$("#loadSlide").css("color", "#990000");
	
	if (errorType == "notFound")
	{
		document.getElementById("order").innerHTML += ("<input type='button' class='btn btn-primary btn-md btn-block' id='notFound' value='Not Found'/>");
		
		//Display error message
		displayImagePreview("current", imageFilePath, slideDeckNotFoundName);
		displayImagePreview("next", imageFilePath, slideDeckNotFoundName);
		
		$("#loadSlide").val("Slide Deck Not Found");
		
	}
	else if (errorType == "empty")
	{
		document.getElementById("order").innerHTML += ("<input type='button' class='btn btn-primary btn-md btn-block' id='notFound' value='Empty'/>");
		
		
		//Display error message
		displayImagePreview("current", imageFilePath, slideDeckEmptyName);
		displayImagePreview("next", imageFilePath, slideDeckEmptyName);
		
			$("#loadSlide").val("Slide Deck Empty");
	}
	
	//Set the slide deck values to red
	$('#order').children('input').each(function() 
	{
		$(this).css("color", "#990000");
		$(this).attr("disabled", true);
	});
}

/*--------------------------------------------------------
									Validate Slide Deck
----------------------------------------------------------
The purpose of this method is to disable and enable the
slide deck while the loading process is taking place. 
If the pass parameter is enable, it will enable all of the
buttons. Otherwise, it will disable them.
--------------------------------------------------------*/
function validateSlideDeck(controlOption)
{
	if (controlOption == "enable")
	{
		//alert("enable");
		$('#order').children('input').each(function() 
		{
			$(this).attr("disabled", false);
		});		
	}
	else if (controlOption == "disable")
	{
		//alert("disable");
		$('#order').children('input').each(function() 
		{
			$(this).attr("disabled", true);
		});
	}
}
