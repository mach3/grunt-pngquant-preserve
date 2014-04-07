
# Grunt-pngquant-preserve

Run pngquant process without updating atime/mtime of output file.

## Requirements

- pngquant 2.x
- available pngquant command
(Or specify the path to the binary in `initConfig')

```bash
$ pngquant --version
2.1.0 (February 2014)
```

## Usage

```javascript
grunt.initConfig({
    pngquant: {
        dist: {
            options: {...},
            src: ["img/**/*.png"]
        }
    }
});

grunt.loadNpmTasks("grunt-pngquant-preserve");
```

### Options

Most of options are passed to `pngquant` command as is.

- binary :String ("pngquant") - Command name or path to binary
- colors :Integer (256) - Colors
- force :Boolean (true) - Forcely overwrite existing files or not
- nofs :Boolean (false) - Disable Floyed-Steinberg dithering
- verbose :Boolean (false) - Show detail or not
- ext :String (".png") - Extention for output file
- speed :Integer (3) - Speed of running pngquant
- quality :String ("60-80") - Quality for outpu file
- process_length :Integer (8) - Number of running processes
- preserve :Boolean (true) - Preserve mtime/atime 


If `pngquant` command is not available directly,
specify the path to the binary. 

```javascript
options: {
    binary: "/the/path/to/pngquant"
}
```

### Destination

This plugin is **TO OVERWRITE IMAGE FILES WITHOUT UPDATING TIMESTAMP**.

To save to other directory or as other name, 
you'd not better to use this plug-in.

