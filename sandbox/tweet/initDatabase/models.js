class Tweet {
	constructor(id, body, date, user, stat){
			this.id = id;
			this.body = body;
			this.date = date;
			this.user = user;
			this.stat = stat;
	}
}

class User {
	constructor(id, username, firstname, lastname, fullname, name){
			this.id = id;
			this.username = username;
			this.firstname = firstname;
			this.lastname = lastname;
			this.fullname = fullname;
			this.name = name;
	}
}

class Stat {
	constructor(id, views, likes, retweets, responses){
			this.id = id;
			this.views = views;
			this.likes = likes;
			this.retweets = retweets;
			this.responses = responses;
	}
}

class Notification {
	constructor(id, type){
			this.id = id;
			this.type = type;
	}
}

class Meta {
	constructor(id, count){
			this.id = id;
			this.count = count;
	}
}



module.exports = {


    Tweet : Tweet,
	User : User,
	Stat : Stat,
	Notification : Notification,
	Meta : Meta,
	

    }