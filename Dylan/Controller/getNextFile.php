<?php 
//CURRENT ISSUE: Cant previous if previous was done from endOfFile.jpg.
$currentSlide = $_POST['currentSlide'];

$nextSlide = "";
$fileType = "";
$count = 0;
$fileIndex = 0;
$endOfFile = True;

$slide[] = "Slide1.JPG";
$slide[] = "Slide2.JPG";
$slide[] = "Slide3.JPG";
$slide[] = "Jay.mp4";
$slide[] = "Widevision.mp4";
$slide[] = "Slide4.JPG";
$slide[] = "Slide5.JPG";

if ($currentSlide == "") 
{
	$endOfFile = false;
	$nextSlide =  $slide[0];	
}

else 
{
	//Find the next file
  foreach($slide as $slideFilename) 
	{
		$count++;
    
		if ($slideFilename == $currentSlide) 
		{
			$fileIndex = $count;
			$fileIndex++;
		}
		else if ($count == $fileIndex)
		{
			$endOfFile = false;
			$nextSlide = $slideFilename;
    } 
	}
}

if ($endOfFile)
{
	$nextSlide = 'endOfFile.jpg';
}

//Get the tye of the next file
$path_parts = pathinfo($nextSlide);
$fileType = $path_parts['extension'];

echo json_encode(
	array("filename" => $nextSlide,
				"fileType" => $fileType)
);

