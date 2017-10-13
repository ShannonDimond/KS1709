------------------
Installation Guide
------------------
For the project there are 2 external software platforms that need to be installed, Apache and Node.js

>Apache
	To host the website we are utilising Apache webserver. This service is a part of the XAMPP stack and for this project we have been utilising the entire XAMPP package. The package can be downloaded on a Windows platform from the following link
	https://www.apachefriends.org/download.html;
	For our project we used Version V3.2.2

>Node
	To run the websocket relay we are utilising Node.js. This framework allows us to create the websocket relay and allows the transfer of messages across the system. Node.js can be downloaded for windows from the following link;
	https://nodejs.org/en/
	For our project we used Version V6.11.2


-------------
Configuration
-------------
There are two main things that needs to be configured, the Apache File Permissions and The Websocket Relay IP Address

>Apache Permissions
	The webpresent folder MUST be in the server root folder.

	The "Presentation" Folder, "presentationOrder.txt" file and the"uploader_log.txt" file must be given Read & Write permissions to the group/individual that will be uploading the content.

>Websocket Relay
	In Windows Explorer, navigate to the following folder;
	
	C:/xampp/htdocs/webpresent/js
	
	Inside this folder there is a file called config.js. Open this file in a text editor. The first line should look like the following line;
	'relay': 'ws://10.103.236.207:3000/relay'
	
	Replace the IP address listed there with the IP address of your own machine. Save the file.
	

--------------------
Running the Software
--------------------
To run the software there two services to start up, the Apache service and the websocket relay.

>Apache
	To access the web pages, the Apache service must be started. Open the XAMPP Control Panel and start the service. 
	
>Websocket Relay
	Secondly open a command prompt and navigate (change the directory with "cd" command) to the following directory;
	
	C:/xampp/htdocs/webpresent/js
	
	Whilst inside the JS directory, type in the following command;
	
	node ./basicrelay.js
	
	This will start the socket relay listening on port 3000.
	
	Once these steps are done you can open a browser and type in the following address;
	
	http://<your IP address>/webpresent/html/controller.html

