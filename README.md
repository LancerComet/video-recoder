# Video Recorder

Record video and export to gif.

Still under construction.

## Startup

 - `git clone` and `npm install`

 - Copy a mp4 file and put it to `static/demo.mp4`.

 - `npm run dev`

 - Press `Start Record` to start recording and `Stop Record` to stop and then save it to gif.

## Problem

Although it creates workers to encode graphics data to gif file, but it's still relatively slow, and gif file is big, no global color table, ... :(
