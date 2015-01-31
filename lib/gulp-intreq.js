'use strict';


var unpack = require('browser-unpack');
var intreq = require('intreq');
var pack = require('browser-pack');
var through = require('through2');

var intreqFn = function(unpacked, callback){
	var r = intreq();
	var rows = [];
	r.on('data', function(row){
		rows.push(row);
	});
	r.on('end', function(){
		callback(rows);
	});
	unpacked.forEach(function(row){
		r.write(row);
	});
	r.end();
};

var minifyModulePaths = function(orig, callback){
	var unpacked = unpack(orig.toString());
	intreqFn(unpacked, function(rows){
		var p = pack();
		var data = '';
		p.on('data', function(buf){
			data += buf;
		});
		p.on('end', function(){
			callback(data);
		});
		p.end(JSON.stringify(rows));
	});
};








module.exports = function () {
  return through.obj(function (file, enc, cb) {
    var that = this;
    minifyModulePaths(file.contents, function (data) {
		var newFile = file.clone();
		newFile.contents = new Buffer(data);
		that.push(newFile);
		cb();
    });

  });
};
