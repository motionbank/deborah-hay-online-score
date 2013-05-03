var express 	= require('express'),
	orm 		= require('orm'),
	app 		= express();

app.use( orm.express( {
	database : "dhayapp",
	protocol : "mysql",
	host     : "localhost",
	port     : 3306,
	user : "dhay",
	password : "dhay",
	query    : {
		pool     : false,
		debug    : true
	}
}, {
    define: function (db, models) {
        models.User = db.define('users2',{});
        models.Set = db.define('sets2',{});
        models.Set.hasMany('people',models.User);
        models.User.sync();
        models.Set.sync();
    }
}));

app.get('/',function(rq,rs){
	var s = new rq.models.Set();
	var u1 = new rq.models.User();
	var u2 = new rq.models.User();
	s.setPeople(u1,u2);
	s.save();
	rs.send('X');
});

app.get('/all',function(rq,rs){
	rq.models.Set.find(function(e,s){
		s[6].getPeople(function(e,p){
			console.log(p);
		});
		rs.send('F');
	});
});

app.listen(5555);