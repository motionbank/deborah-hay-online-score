TAKO
==========================
- flowplayer font
- missing image (joy sorrow again)
- wrong background in general heatmap


General
==========================
- REMOVE console.log's
- make sure postmessanger and PM lib are no longer in dev mode


Design fixes
==========================
- cells: info, hover
- flowplayer: loading, align to top
- text cell on FF not working
* slider color for dark bg
* cover text positioning
* grid table on Cr/Sf jumpy
* grid behind cell (no empty cells needed then)
	X update icons for dark bg
	X set overview page
	X flowplayer font
	X text cell: table?
	X title does not change back when in set view previous set is clicked again (go back)


Missing content
==========================
- final Amin animation & PM markers & poster frames (S3, PM)
- dataptations (Vimeo)
- recording setup (html cell / new cell type?)
- PieceMaker cell (html cell)
* Jeanine & Amin interview (Vimeo)


Missing sets
==========================
- team, imprint
- help set


Design to do
==========================
- help icon
	X start page, logo position, background, info?


SEO / Tracking
==========================
- implement SPA analytics .. (backbone plugin?)
- add Google Analytics
- sitemap?


General UX
==========================
- show keyboard shortcuts (-> help page?)
- favicon / apple icon / ...
- check all title="" attribs .. language and accessibility
- missing: dim cells that are not "in range"
	?? keyboard shortcuts jump 1 column too far
	X animate switch set -> selector -> set


All tiles
==========================
- indicate which "is playing"
- make sure playing content is visible
- allow to pin information overlay
- cancel loading of images when scene is changed in between


Viz cells
==========================
- visualizations: crop content to (content + padding) so viz can adjust best to "cover" mode


Vimeo tiles
==========================
- auto-playing, focus the set window on them when they start


Flowplayer tiles
==========================
- ### we are mixing fp versions, move to 5.4.2 ###
- buy to get rid of logo ($95, one domain): http://flowplayer.org/download/
- fetch current scene on deactivate for poster image
- show loading preview
- full screen button missing
- store volume settings globally?
- css animation of timeline is wonky
?? HTML5 video not scaled right
?? sometimes the scene does not get loaded (if it is a late scene) ... or it does change twice, just after it loaded?
?? ignore own messages


Content
==========================
- optimize content for cell sizes
- compress static content
- missing.jpg needs replacement (per cell type? -> recording empty studio)


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

