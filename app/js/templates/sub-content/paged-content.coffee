module.exports = """
	<div class="content-wrapper">
		<div class="content">
			<div class="left nav-prev nav"></div>
			<div class="right nav-next nav"></div>
			<div class="pages-wrapper">
				<div class="pages">
					<% var pageNum = 0 %>
					<% _.each( scenes, function ( scene, i ) { %>
						<% _.each( scene.html, function ( page, n ) { %>
							<div class="page text" data-scene="<%= scene.scene %>" data-page-num="<%= pageNum %>"><%= page %></div>
							<% pageNum++ %>
						<% }) %>
					<% }) %>
				</div>
			</div>
		</div>
	</div>
	"""