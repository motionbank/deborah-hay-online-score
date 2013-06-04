
General
=================
- REMOVE throw() in error for backend
* CORS exception in app? 


Layout editor
==================
- UNDO ?!
- list view: see which items are already in set
- select and remove multiple cells
- connection settings could offer already available attributes per type "set-id" / "title" / ..
- dragging a cell away leaves old location still "tainted"
- clone a set or version control
[- switch the whole thing to use backbone.js ... jQuery().data() gets out of hand]
	x remove columns / rows
	  (empty right/bottom edges are removed, still needs update on page)
	x hover cell should highlight in list
	x filter is bad ux
	  (removed)
	x list-view items need better formatting and details (preview)
	x double click cell to edit it
	x show save (ajax) is working in the back
	x grid should not be a <table> but use the same tech as the front end .. bunch of position
	x vimeo linking: remove existing link

Sets
==================
- make sure set paths are unique!
- do they need an order?
- hidden / private sets?
- set categories?
- generate thumbnail for set?
	x easy way to interlink context (vimeo) cells (drag-n-drop)
	x edit aspect size
	x can not drag grid cell to "add-xy" and make more rows / cols
	x when moving grid cells around they loose their double click / hover feats.


Cells
==================
- cell types could be media-based rather than content based
- more cell types: text-only (html?), title + text, photo / media
- preview / test cells ad hoc
- test paths (in fields) on S3 / Vimeo / webserver
- allow for input field to become textarea to be able to enter longer texts
- a "set info" cell that will just repeat the title / description of the set it's in
- allow for choosing one poster image from uploaded images for cells that have image content mainly
- recording cells do not show poster image
	x upload previews directly to S3


Vimeo
===================
- import title and description from vimeo video info
	x what happens if a video is being deleted? ... delete the cell? ask?
		yes, we ask.


Title cell
===================
	x more than varchar(255)
		changed to 1024