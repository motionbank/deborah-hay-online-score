module.exports = """
	<h1>... will hold an overview of all types the content can be viewed in</h1>
	<ul class="row">
		<% _.each(links,function(link){ %>
			<li class="w1"><a href="#" data-path="<%= link.path %>" class="action"><img src="<%= link.thumb %>" /><br/><%= link.title %></a></li>
		<%}); %>
	</ul>
	"""