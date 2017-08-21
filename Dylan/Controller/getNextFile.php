<?php 
//CURRENT ISSUE: Cant previous if previous was done from endOfFile.jpg.
$currentSlide = $_POST['currentSlide'];

$nextSlide = "";
$count = 0;
$fileIndex = 0;
$endOfFile = True;

$slide[] = "Slide1.JPG";
$slide[] = "Slide2.JPG";
$slide[] = "Slide3.JPG";
$slide[] = "Slide4.JPG";
$slide[] = "Slide5.JPG";

if ($currentSlide == "") 
{
	//$myObj->filename = $slide[0];
	$endOfFile = false;
	$nextSlide =  $slide[0];
}

else 
{
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
			//$myObj->filename = $slideFilename;
			$endOfFile = false;
			$nextSlide = $slideFilename;
    } 
	}
}

if ($endOfFile)
{
	//$myObj->filename = 'endOfFile.jpg';
	$nextSlide = 'endOfFile.jpg';
}

echo $nextSlide;
//$myJSON = json_encode($myObj);
//echo $myJSON;
