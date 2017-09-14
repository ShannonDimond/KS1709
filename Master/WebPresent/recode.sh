
ffmpeg  -y -i SCEMLoop-NoTalkies.avi  -c:v libx264 -preset medium -b:v 6000k -pass 1 -f mp4 /dev/null && ffmpeg -i SCEMLoop-NoTalkies.avi -c:v libx264 -preset medium -b:v 6000k -pass 2 SCEM.mp4


