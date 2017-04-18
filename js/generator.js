/*
 Symbol generator
*/
function Generator() {
    this.symbols = [
        {name: "wild", asset: game.assets.images.symbol1},
        {name: "strawberry", asset: game.assets.images.symbol2},
        {name: "pineapple", asset: game.assets.images.symbol3},
        {name: "lemon", asset: game.assets.images.symbol4},
        {name: "watermelon", asset: game.assets.images.symbol5},
        {name: "grapes", asset: game.assets.images.symbol6}
    ];

    this.select = {
        input: null,
        width: 125,
        height: 32,
        margin: 25,
        right: 25,
        top: 0
    };

    this.button = {
        asset: {
            enabled: game.assets.images.spin_enabled,
            disabled: game.assets.images.spin_disabled
        },
        enabled: true,
        width: 98,
        height: 98,
        margin: 38,
        x: 0,
        y: 0
    };

    this.area = {
        width: 0,
        height: 0,
        margin: 52,
        x: 0,
        y: 0,
        scale: 1
    };

    this.selected = 0;
    this.symbol = 0;
    this.result = 0;
    this.alpha = 1;
    this.text_alpha = 0;
    this.message = {
        color: '#fff',
        font: 'Consolas',
        align: 'center',
        size: 24,
        margin: {right: 42, bottom: 100}
    };

    // initialize generator
    this.init();
}

Generator.prototype.init = function() {
    // show symbol select
    this.select.input = document.getElementById('select');
    this.select.input.style.display = 'block';

    // add element interaction
    this.select.input.addEventListener('change', this.setSymbol.bind(this));
    game.canvas.addEventListener('mousedown', this.buttonClick.bind(this));
    game.canvas.addEventListener('mousemove', this.buttonHover.bind(this));

    // change game state
    game.state = 'playing';
};

Generator.prototype.draw = function() {
    // draw background
    game.ctx.drawImage(game.assets.images.background, 0, 0, game.canvas.width, game.canvas.height);

    // draw spin button
    this.button.width = this.button.asset.enabled.width * game.ratio;
    this.button.height = this.button.width;
    this.button.x = (game.canvas.width - this.button.width) - (this.button.margin * game.ratio);
    this.button.y = (game.canvas.height / 2 - this.button.height / 2);
    game.ctx.drawImage(this.button.enabled ? this.button.asset.enabled : this.button.asset.disabled, this.button.x, this.button.y, this.button.width, this.button.height);

    // adjust select to screen
    this.select.input.style.width = this.select.width * game.ratio + 'px';
    this.select.input.style.height = this.select.height * game.ratio + 'px';
    this.select.input.style.right = this.select.right * game.ratio + 'px';
    this.select.input.style.top = (game.canvas.height / 2 - (this.button.height + this.select.margin * game.ratio)) + 'px';

    // draw symbol display area
    this.area.width = (this.symbols[this.symbol].asset.width * game.ratio) * this.area.scale;
    this.area.height = (this.symbols[this.symbol].asset.height * game.ratio) * this.area.scale;
    this.area.x = (game.canvas.width / 2 - this.area.width / 2) - this.area.margin * game.ratio;
    this.area.y = (game.canvas.height / 2 - this.area.height / 2);
    game.ctx.drawImage(this.symbols[this.symbol].asset, this.area.x, this.area.y, this.area.width, this.area.height);

    // draw win/lose messages
    game.ctx.globalAlpha = this.text_alpha;
    game.ctx.fillStyle = this.message.color;
    game.ctx.font = this.message.size * game.ratio + 'px ' + this.message.font;
    game.ctx.textAlign = this.message.align;
    game.ctx.fillText(this.result ? 'You won!' : 'Try again...', game.canvas.width / 2 - this.message.margin.right * game.ratio, game.canvas.height - this.message.margin.bottom * game.ratio);
    game.ctx.globalAlpha = this.alpha;
};

Generator.prototype.setSymbol = function() {
    // save selected symbol value
    this.selected = this.select.input.options[this.select.input.selectedIndex].value;
};

Generator.prototype.buttonClick = function(event) {
    // detect click on spin button
    var bounds = game.canvas.getBoundingClientRect();
    var mouseX = event.pageX - bounds.left;
    var mouseY = event.pageY - bounds.top;

    if(mouseX >= this.button.x && mouseX <= this.button.x + this.button.width && mouseY >= this.button.y && mouseY <= this.button.y + this.button.height) {
        // select random symbol
        this.randomSymbolSelect();
    }
};

Generator.prototype.buttonHover = function(event) {
    // detect cursor over spin button
    var bounds = game.canvas.getBoundingClientRect();
    var mouseX = event.pageX - bounds.left;
    var mouseY = event.pageY - bounds.top;

    if(mouseX >= this.button.x && mouseX <= this.button.x + this.button.width && mouseY >= this.button.y && mouseY <= this.button.y + this.button.height) {
        game.canvas.style.cursor = 'pointer';
    } else {
        game.canvas.style.cursor = 'auto';
    }
};

Generator.prototype.randomSymbolSelect = function() {
    // select random symbol from array
    if(!this.button.enabled) return false;

    var randomSymbol = Math.floor(Math.random() * this.symbols.length);
    var counter = this.symbols.length;
    var generator = this;

    // disable spin button
    generator.button.enabled = false;

    // hide message
    generator.text_alpha = 0;

    // symbol switch animation
    var symbolSwitch = setInterval(function () {
        counter --;
        generator.symbol = counter;

        game.assets.sounds.tick.play();

        if(counter == 0) {
            // save symbol and compare to selected
            generator.symbol = randomSymbol;
            generator.result = generator.selected == generator.symbol;

            // display result
            generator.endSelection();

            clearInterval(symbolSwitch);
        }
    }, 100);
};

Generator.prototype.endSelection = function() {
    // displays symbol switch result
    var generator = this;
    var increase = true;

    if(this.result) {
        // display win animation
        var winAnimation = setInterval(function () {
            if(generator.area.scale < 1.5 && increase) {
                generator.area.scale += 0.15;
            } else {
                increase = false;
                generator.area.scale -= 0.15;
            }

            if(generator.area.scale <= 1 && !increase) {
                generator.button.enabled = true;
                clearInterval(winAnimation);
            }
        }, 50);

        // play win sound
        game.assets.sounds.win.play()
    }else {
        // play fail sound
        game.assets.sounds.fail.play()
    }

    // animate message
    var textAnimation = setInterval(function () {
        generator.text_alpha += 0.05;

        if(generator.text_alpha > 1) {
            clearInterval(textAnimation);
        }
    }, 50);

    // enable spin button
    generator.button.enabled = true;
};
