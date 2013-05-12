Backend
=======

This is both the JSON-API backend and admin area for the online score.


API
===

The front end reads the data through the API.

	GET /users				-> all users
	GET /users/:id 			-> one user by id
	GET /users/:id/sets 	-> all sets created by user with id

	GET /sets 				-> all sets
	GET /sets/:id 			-> one set by id

	GET /cells 				-> all cells
	GET /cells/:id 			-> one cell by id

Start like this:

    nodemon app.js 			-> http://localhost:5555/

    (or: nodemon -w ./ app.js to watch current directory)

Note that package.json is set to work with this file.


Admin
=====

This is a temporary backend that we use internally to enter / edit data into the database.

In a future version this functionality will be added to the frontend and be available to the public.

Start here:

	nodemon editor.js 		-> http://localhost:5556/


