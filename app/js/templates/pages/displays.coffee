module.exports = """
	<h1>... will hold an overview of all types the content can be viewed in</h1>
	<ul>
		<% _.each(links,function(link){ %>
			<li><a href="#" data-path="<%= link.path %>" class="action"><img src="<%= link.thumb %>" /><br/><%= link.title %></a></li>
		<%}); %>
	</ul>
	"""