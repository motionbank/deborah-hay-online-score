module.exports = """
	<h1>Select which performance to view here</h1>
	<table width="800">
		<tr class="row-all">
			<td colspan="<%= (recordings.length * recordings[0].ids.length) %>">
				<a href="#" class="action" data-path="all">All recordings</a>
			</td>
		</tr>
		<tr class="row-performers">
			<% _.each( recordings, function (performer) { %>
				<td colspan="<%= performer.ids.length %>">
					<a href="#" class="action" 
					   data-path="<%= performer.name.replace(/ /,'-').toLowerCase() %>" ><%= performer.name %></a>
				</td>
			<% }); %>
		</tr>
		<tr class="row-recordings">
			<% _.each( recordings, function(performer){ %>
				<% for ( var i = 0; i < performer.ids.length; i++ ) { %>
				<td><a href="#" data-path="<%= performer.name.replace(/ /,'-').toLowerCase() %>/<%= performer.ids[i] %>" 
								class="action"><%= (i+1) %></a></td>
				<% } %>
			<% }); %>
		</tr>
	</table>
	"""
