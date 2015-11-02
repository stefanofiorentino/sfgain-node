var fs = require('fs');

fs.readdir(process.env.PWD,function(err, dir){
	var stdout_ino = 0;
	fs.stat('/dev/stdout',function(err,stats){
		stdout_ino = stats.ino;
	});
	dir.forEach(function(d){
		fs.stat(d,function(err,stats){
			if (stats.ino === stdout_ino)
			{
				console.log(d);
			}
		});
	});
});