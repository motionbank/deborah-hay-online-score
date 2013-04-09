var Templates = module.exports = {
	
	'top-navigation' : '<ul>'+
		'<% _.each( items, function (item) { %>'+
			'<li><a href="#" data-id="<%= item.id %>">'+
				'<div><%= item.title %></div><div class="nav-selection"><%= item.selection %></div>'+
			'</a></li>'+
		'<% } ); %>'+
		'</ul>',

	'top-content-page' : '<section id="top-content-<%= id %>" class="top-content-page"><%= content %></section>',

	'top-content-global' : require('js/templates/pages/global'),
	'top-content-score' : require('js/templates/pages/score'),
	'top-content-performances' : require('js/templates/pages/performances'),
	'top-content-views' : require('js/templates/pages/displays'),

	'sub-navigation' : '<ul>'+
		'<% _.each( items, function (item) { %>'+
			'<li><a href="#" data-id="<%= item.id %>"><%= item.title %></a></li>'+
		'<% } ); %>'+
		'</ul>'
};