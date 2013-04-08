module.exports = """
	<div id="sub-timeline-container"><% _.each(scenes,function(scene){ %>
		<div><a href="#" class="timeline-item" style="width:<%= scene.width %>px" data-scene="<%= scene.scene %>"></a></div>
	<% }) %></div>
	"""
