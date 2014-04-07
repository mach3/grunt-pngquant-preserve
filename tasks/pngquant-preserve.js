/*!
 * pngquant-preserve
 * -----------------
 * Run pngquant process without updating atime/mtime of output file.
 */
module.exports = function(grunt){

	var _ = grunt.util._,
		fs = require("fs"),
		path = require("path"),
		cp = require("child_process"),
		util = require("util");

	grunt.registerMultiTask("pngquant", "", function(){

		var my = {};

		my.done = this.async();

		/**
		 * Options:
		 * - binary {String} - Command name or path to binary
		 * - colors {Integer} - Colors
		 * - force {Boolean} - Forcely overwrite existing files or not
		 * - nofs {Boolean} - Disable Floyed-Steinberg dithering
		 * - verbose {Boolean} - Show detail or not
		 * - ext {String} - Extention for output file
		 * - speed {Integer} - Speed of running pngquant
		 * - quality {String} - Quality for outpu file
		 * - process_length {Integer} - Number of running processes
		 * - preserve {Boolean} - Preserve mtime/atime 
		 */
		my.options = this.options({

			binary: "pngquant",
			colors: 256,

			force: true,
			nofs: false,
			verbose: false,
			ext: ".png",
			speed: 3,
			quality: "60-80",

			process_length: 8,
			preserve: true

		});

		// Generate command
		my.cmd = (function(){
			var render, options = [];
			render = _.template("<%=binary %> <%=options %> <%=colors %> %s");
			["force", "nofs", "verbose", "ext", "speed", "quality"].forEach(function(name){
				var value = my.options[name];
				if(true === my.options[name]){
					options.push("--" + name);
					return;
				}
				if(! _.isBoolean(value)){
					options.push("--" + name + " " + value);
				}
			});
			return render({
				binary: my.options.binary,
				options: options.join(" "),
				colors: options.colors
			});
		}());

		my.queue = [];
		my.result = [];
		my.running = 0;

		// Optimize PNG file
		my.optimize = function(src, dest, callback){
			var stat = fs.statSync(src);

			// If dest specified, copy a file
			if(src !== dest){
				grunt.file.copy(src, dest);
			}

			// Optimize dest
			cp.exec(util.format(my.cmd, dest), function(e, out, error){
				var rate = fs.statSync(dest).size / stat.size;
				if(my.options.preserve){
					fs.utimesSync(dest, stat.atime, stat.mtime);
				}
				if(my.options.verbose){
					grunt.log.writeln("Optimized: %s (%s%)", dest, parseInt(100 * rate, 10));
				} else {
					grunt.log.write(".");
				}
				my.result.push(rate);
				callback();
			});
		};

		// Running processes
		my.run = function(){
			var items, rooms;

			if(! my.queue.length){
				if(! my.running){
					my.finish();
				}
				return;
			}

			rooms = my.options.process_length - my.running;
			items = my.queue.splice(0, rooms);
			my.running += items.length;

			items.forEach(function(o){
				my.optimize(o.src, o.dest, function(){
					my.running -= 1;
					my.run();
				});
			});
		};

		// Finishing process
		my.finish = function(){
			var message, total = 0;
			my.result.forEach(function(value){
				total += value;
			});
			message = util.format(
				"\n%s files are optimized. (%s%)",
				my.result.length,
				parseInt(100 * (total / my.result.length), 10) || 0
			);
			grunt.log.writeln(message);
			my.done();
		};

		// Initialize by options
		this.files.forEach(function(o){
			var dest = o.dest;

			if(! _.isString(dest) && dest !== undefined){
				throw Error("Specify 'dest' with string.");
			}

			if(!! dest && ! grunt.file.exists(dest)){
				fs.mkdirSync(dest);
			}

			o.src.filter(function(name){
				return grunt.file.exists(name);
			})
			.forEach(function(name){
				my.queue.push({
					src: name,
					dest: dest ? path.join(dest, name) : name
				});
			});
		});

		my.run();
	});

};
