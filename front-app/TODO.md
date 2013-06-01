Design
==========================
- start page, logo position, background, info?
- grid
- cells: info, hover
- text cell
- flowplayer
- set overview
- slider


General content
==========================
- front page ... backgrounds
- final title? .. where does it go?
- make about / team / ... a set linked to from logo?
- generative logo
- flowplayer font
	x select default content / recording / scene when entering


General code
==========================
	x make global settings to be besed on one config file (streamer urls, server addresses, keys, ...), check module code as well!


General style
==========================
- logo / icons below slider
- set selection view needs many improvements
- allow for differently sized cells?


Mobile devices
==========================
- hide slider
- add hint about sliding
- tab to see info, tab again to play cell
- top bar is quite large with 72px height on mobile


General UX
==========================
- show left / right transition
- show keyboard shortcuts
- keyboard shortcuts jump 1 column too far
- animate switch set -> selector -> set
- a global indicator that show where you are in the recordings / time / performer dimensions
- favicon / apple icon / ...
- check all title="" attribs .. language and accessibility


All tiles
==========================
- indicate which "is playing"
- slider: indicate where playing tile is in set
- make sure content is visible
- handle space visible if cells are smaller than total window ... "offgrid", how does Google maps handle that?
- allow to pin information
- cancel loading of images when scene is changed in between


Viz cells
==========================
- visualizations: crop content to (content + padding) so viz can adjust best to "cover" mode


Vimeo tiles
==========================
- auto-playing, focus set-window on them


Flowplayer tiles
==========================
- style interface
- buy to get rid of logo ($95, one domain): http://flowplayer.org/download/
- fetch current scene on deactivate
- show loading preview
- HTML5 video not scaled right
- sometimes the scene does not get loaded (if it is a late scene) ... or it does change twice, just after it loaded?
- full screen button missing
- store sound globally?
- ignore own messages
- on deactivate make image show current scene, not default image


Content
==========================
- optimize content for cell sizes
- compress static content
- missing.jpg needs replacement (per cell type? -> recording empty studio)

