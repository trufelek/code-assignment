/*
Main game object
*/
function Game() {
    this.canvas = null;
    this.ctx = null;
    this.loader = null;
    this.generator = null;
    this.select = null;
    this.ratio = 0;
    this.width = 960;
    this.height = 563;
    this.assets = {images: [], sounds: [], count: 0, loaded: 0};
    this.state = 'loading';
}

Game.prototype.init = function() {
    // initialize canvas
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    // on resize adjust canvas
    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', this.resize.bind(this));

    // adjust canvas to screen
    this.resize();

    // load game data
    this.load();

    // start game loop
    this.update();
};

Game.prototype.load = function() {
    // create new loader
    this.loader = new Loader();

    // load data from json file
    this.loadJSON('assets/data/data.json', function(data) {
        game.assets.count = Object.keys(data.assets).length;
        game.assets.loaded = 0;

        // load different type of resources
        for(var asset in data.assets) {
            switch(data.assets[asset].type) {
                case 'image':
                    game.assets.images[asset] = new Image();
                    game.assets.images[asset].src = data.assets[asset].path;

                    game.assets.images[asset].onload = function() {
                        // when asset is loaded update loader
                        game.loadAsset();
                    };
                break;

                case 'sound':
                    game.assets.sounds[asset] = new Audio(data.assets[asset].path);
                    game.assets.sounds[asset].onloadeddata = function() {
                        // when asset is loaded update loader
                        game.loadAsset();
                    };
                break;
            }
        }
    });
};

Game.prototype.loadAsset = function() {
    // loading progress
    this.assets.loaded += 1;
    this.loader.progress = 100 * this.assets.loaded / this.assets.count;

    if(this.assets.loaded == this.assets.count) {
        this.loader.destroy(this, this.create.bind(this));
    }
};

Game.prototype.create = function() {
    // prepare main game view
    this.state = 'booting';

    // play looped background music
    this.assets.sounds.tune.loop = true;
    this.assets.sounds.tune.play();

    // create new symbols generator
    this.generator = new Generator();
};

Game.prototype.draw = function() {
    // draw game content
    if(this.state == 'loading') {
        // draw loader while loading
        this.loader.draw();

    } else if(this.state == 'playing') {
        // update game ratio
        this.ratio = this.canvas.width / this.width;

        // draw generator
        this.generator.draw();
    }
};

Game.prototype.update = function() {
    // game loop
    requestAnimationFrame(this.update.bind(this));

    // clear canvas
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

    // draw game
    this.draw();
};

Game.prototype.resize = function() {
    // adjust canvas to screen on resize
    this.canvas.width = window.innerWidth < game.width ? window.innerWidth : game.width;
    this.canvas.height = this.canvas.width * game.height / game.width;
};

Game.prototype.loadJSON = function(path, callback) {
    // ajax data loader
    var request = new XMLHttpRequest();
    request.open('GET', path);
    request.onreadystatechange = function() {
        if(request.readyState === 4 && request.status === 200) {
            var data = JSON.parse(request.responseText);
            callback(data);
        }
    };
    request.send();
};

var game;

window.onload = function() {
    // create new game
    game = new Game();

    // init game
    game.init();
};
