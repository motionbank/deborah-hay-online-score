General
==========================
- PM is still open for all
- REMOVE console.log's
- make sure postmessanger and PM lib are no longer in dev mode
- 404, 403 for sets
- messages


Design
==========================
m check icons menu bar
m left / right arrow icon
- text cell on OP not working: text module not working, tabs 100% width
- cells: info, hover
* slider color for dark bg
* cover text positioning
* grid table on Cr/Sf jumpy
* grid behind cell (no empty cells needed then)
	X text cell on FF not working
	X update icons for dark bg
	X set overview page
	X flowplayer font
	X text cell: table?
	X title does not change back when in set view previous set is clicked again (go back)
	X help icon
	X start page, logo position, background, info?
	X meta data / facebook / preview image
	X favicon / apple icon / win-8 icon
	X Check start page for: type, placing, backs
	X sets: check background coloring


Content
==========================
- wrong background in general heatmap
- missing videos: AMIN, DATAPTATIONS
- thumbs for sets
- cell titles!
- missing image (joy sorrow again)
- travel speed has old content
- final Amin animation & PM markers & poster frames (S3, PM)
- dataptations (Vimeo)
- recording setup (html cell / new cell type?)
- PieceMaker cell (html cell)
	X Jeanine & Amin interview (Vimeo)
	X change title of front page


Missing sets
==========================
- team, imprint
	X help set


SEO / Tracking
==========================
- render headless or generate other static page views for bots: 
  http://backbonetutorials.com/seo-for-single-page-apps/
- sitemap?
- webmaster tools
	X implement SPA analytics .. (backbone plugin?)
	X add Google Analytics


General UX
==========================
- check all title="" attribs .. language and accessibility
- missing: dim cells that are not "in range"
* show keyboard shortcuts (-> help page !!)
	?? keyboard shortcuts jump 1 column too far
	X animate switch set -> selector -> set


All cells
==========================
m indicate which "is playing"
m missing.jpg needs replacement (per cell type? -> recording empty studio)
- freeze a cell to a specific recording / person / scene
- allow to pin information overlay
- cancel loading of images when scene is changed in between:
  http://stackoverflow.com/questions/6929662/how-do-i-abort-image-img-load-requests-without-using-window-stop
	X make sure playing content is visible


Text cell
==========================
	X refine

Viz cells
==========================
- visualizations: crop content to (content + padding) so viz can adjust best to "cover" mode


Vimeo tiles
==========================
- clean titles & descriptions "---"
	X auto-playing, focus the set window on them when they start

YT cells type
==========================
- add a cell type for YT videos, API is here: 
  https://developers.google.com/youtube/iframe_api_reference

Flowplayer tiles
==========================
m flowplayer: loading
m fp: full screen button missing
m make background have performer color?
- Opera: flowplayer module not working: js error in jQuery callback
- ### we are mixing fp versions, move to 5.4.2 ###
- buy to get rid of logo ($95, one domain): http://flowplayer.org/download/
- fetch current scene on deactivate for poster image
- show loading preview
- store volume settings globally?
- css animation of timeline is wonky
- if a paused cell receives a scene change message will make it play
?? HTML5 video not scaled right
?? sometimes the scene does not get loaded (if it is a late scene) ... or it does change twice, just after it loaded?
?? ignore own messages
	X flowplayer font
	X add "file-name" attribute check to fauxmeo


Content
==========================
- optimize content for cell sizes
- compress static content


---------------------------------------- These are for later ... much later --------------------------------


Mobile devices
==========================
- hide slider
- add hint about sliding
- tab to see info, tab again to play cell
- top bar is quite large with 72px height on mobile
- MoBa logo pixelated on Nx7


General UX
==========================
- slider: indicate where playing tile is in set?
- show left / right as transition
- a global indicator that show where you are in the recordings / time / performer dimensions


Design and such
==========================
- kick start app too direct (animation)
- app start animation as blocks
- handle space visible if cells are smaller than total window ... "offgrid", how does Google maps handle that? .. add tools?


Content
==========================
- generative logo


Cell ideas
==========================
- hover one cell highlights related other cells (to emphasize relations)

