module.exports = """

		<div class="info">
			<h1 class="title"><% if ( link ) { %><a href="<%= link %>"><% } %><%= title %></h1><% if ( link ) { %></a><% } %>
			<div class="description"><%= description %></div>
		</div>

	<div class="content"><%= content %></div>
	"""
