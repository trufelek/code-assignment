/*
 Game loader
*/
function Loader() {
    this.height = 15;
    this.width = game.canvas.width / 2;
    this.progress = 10;
    this.alpha = 1;
    this.text_alpha = 0;
    this.background = '#111';
    this.color = '#fff';
    this.font = '21px Consolas';
    this.align = 'center';
    this.text = 'Loading...';
    this.gradient = {start: '#ee957f', stop: '#66ffcc'};

    // initialize loader
    this.init();
}

Loader.prototype.init = function() {
    // fade in loader text
    var loader = this;

    var textFadeIn = setInterval(function () {
        loader.text_alpha += 0.05;

        if(loader.text_alpha > 1) {
            clearInterval(textFadeIn);
        }
    }, 50);
};

Loader.prototype.draw = function() {
    // update dimensions
    this.width = game.canvas.width / 2;
    var x = game.canvas.width / 2 - this.width / 2;
    var y = game.canvas.height / 2 - this.height / 2;

    // update progress bar
    var percent = (this.progress * this.width) / 100;

    game.ctx.globalAlpha = this.alpha;

    // draw background
    game.ctx.fillStyle = this.background;
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // draw loading text
    game.ctx.globalAlpha = this.text_alpha;
    game.ctx.fillStyle = this.color;
    game.ctx.font = this.font;
    game.ctx.textAlign = this.align;
    game.ctx.fillText(this.text, game.canvas.width / 2 , y - this.height);
    game.ctx.globalAlpha = this.alpha;

    // progress bar background
    game.ctx.fillRect(x, y, this.width, this.height);

    // progress bar fill
    var gradient = game.ctx.createLinearGradient(x, y, this.width * 2, y);
    gradient.addColorStop(0, this.gradient.start);
    gradient.addColorStop(1, this.gradient.stop);
    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, percent, this.height);

    game.ctx.globalAlpha = 1;
};

Loader.prototype.destroy = function(game, callback) {
    // fade out & remove loader
    var loader = this;

    setTimeout(function() {
        var fadeOut = setInterval(function () {
            loader.alpha -= 0.05;

            if(loader.alpha < 0) {
                game.loader = null;
                callback.call();
                delete loader;
                clearInterval(fadeOut);
            }
        }, 50);
    }, 2000);
};
