/*
 * By : http://bruno-simon.com
 * Snake Game
 * Need : jQuery
 * Play at anytime in your browser just by opening a new tab
 */

var ChromeSnake = function(){}

ChromeSnake.prototype = {

    /* ----------------------------------------------------
     *  GLOBAL
    /* ---------------------------------------------------- */

    params: {
        initialSpeed: 'slow'
    },

    init: function(params){

        

        //Params
        //$.extend(params,this.params);
        if(params.initialSpeed == 'slow')
            this.params.updateDelay = 132;
        else if(params.initialSpeed == 'fast')
            this.params.updateDelay = 34;
        else
            this.params.updateDelay = 68;


        //Game
        this.game = {
            running: false,
            playEnable: true
        };

        this.initGrid();
        this.initWindow();
        this.initFront();
        this.initIA();
    },

    gameStart: function(){

        //Only start with enough blocs
        if(this.grid.blocsCountX > 3 && this.grid.blocsCountY > 3 && !this.game.running && this.game.playEnable){

            this.resetFront();
            this.game.playEnable = false;
            this.game.running = true;
            this.initUserEvents();
            this.initSnake();
            this.initFeed();
            this.initTimer();
        }
    },

    gameOver: function(){

        var that = this;

        this.game.running = false;
        this.game.playEnable = true;
        
        //IA
        if(this.ia.running){
            this.ia.running = false;
            window.setTimeout(function(){
                that.startIA();
            },2000);
        }

        //NORMAL MODE
        else {

            // Display a text box saying "hello"
            document.getElementById('gameOverModal').style.display = 'block';

            //CALLBACK
            if(this.game.gameOverCallback){
                this.game.gameOverCallback.call({
                    score: this.snake.blocs.length - 1
                });
            }
        }

        this.resetGrid();
        this.resetFeed();
        this.resetSnake();
        this.resetTimer();
    },

    onGameOver: function(callback){
        this.game.gameOverCallback = callback;
    },

    /* ----------------------------------------------------
     *  IA
    /* ---------------------------------------------------- */

    initIA: function(){
        this.ia = {};
        this.ia.running = false;
        this.ia.randLimit = 0.06;
    },

    startIA: function(){
        this.ia.running = true;
        this.gameStart();
    },

    updateIA: function(){

        var feed = this.feed.blocs[0],
            snakePosition = this.snake.blocs[0],
            snakeDirection = this.snake.direction;

        //RANDOM GOING
        var rand = Math.random();
        if(rand < this.ia.randLimit){

            //VERTICALY
            if(snakeDirection == 0 || snakeDirection == 2){
                if(snakePosition.x < feed.x)
                    this.snake.targetDirection = 1;
                else if(snakePosition.x > feed.x)
                    this.snake.targetDirection = 3;
            }
            //HORIZONTALY
            else {
                if(snakePosition.y < feed.y)
                    this.snake.targetDirection = 2;
                else if(snakePosition.y > feed.y)
                    this.snake.targetDirection = 0;
            }
        }

        else {

            //IA GOING VERTICALLY
            if(snakeDirection == 0 || snakeDirection == 2){
                if(snakePosition.y == feed.y){

                    //DIRECT WAY (no wall passing)
                    if(snakePosition.x < feed.x)
                        this.snake.targetDirection = 1;
                    else if(snakePosition.x > feed.x)
                        this.snake.targetDirection = 3;

                    //WALL PASSING
                    if(this.snake.targetDirection == 1 && feed.x - snakePosition.x > this.grid.blocsCountX / 2 )
                        this.snake.targetDirection = 3;
                    else if(this.snake.targetDirection == 3 && snakePosition.x - feed.x > this.grid.blocsCountX / 2 )
                        this.snake.targetDirection = 1;
                }
            }

            //IA GOING HORIZONTALLY
            else {

                //DIRECT WAY (no wall passing)
                if(snakePosition.x == feed.x){
                    if(snakePosition.y < feed.y)
                        this.snake.targetDirection = 2;
                    else if(snakePosition.y > feed.y)
                        this.snake.targetDirection = 0;
                }

                //WALL PASSING
                if(this.snake.targetDirection == 2 && feed.y - snakePosition.y > this.grid.blocsCountY / 2 )
                    this.snake.targetDirection = 0;
                else if(this.snake.targetDirection == 0 && snakePosition.y - feed.y > this.grid.blocsCountY / 2 )
                    this.snake.targetDirection = 2;
            }
        }
    },

    stopIA: function(){
        this.ia.running = false;
    },

    /* ----------------------------------------------------
     *  WINDOW
    /* ---------------------------------------------------- */

    initWindow: function(){

        var that = this;

        this.setWindowProperties();
        window.onresize = function(e){
            that.setWindowProperties();
        } 
    },


    setWindowProperties: function(){
        this.window = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.setGrid();
        this.setSnakeInGrid();

        if(this.game.resizeCallback)
            this.game.resizeCallback.call();
    },

    onResize: function(callback){
        this.game.resizeCallback = callback;
    },


    /* ----------------------------------------------------
     *  GRID
    /* ---------------------------------------------------- */

    initGrid: function(){

        this.grid = {};
        this.grid.blocsCountX = 0;
        this.grid.blocsCountY = 0;

        this.grid.properties = {
            blocSize: 50,
            blocPadding: 2
        };
    },

    setGrid: function(){

        //COUNTS
        var tmpX = this.grid.blocsCountX,
            tmpY = this.grid.blocsCountY;
        this.grid.blocsCountX = Math.floor(this.window.width / (this.grid.properties.blocSize+this.grid.properties.blocPadding));
        this.grid.blocsCountY = Math.floor(this.window.height / (this.grid.properties.blocSize+this.grid.properties.blocPadding));
        
        //SET FEED IN GRID IF NECESSARY
        if(this.game.running && tmpX != 0 && tmpY != 0 && (tmpX != this.grid.blocsCountX || tmpY != this.grid.blocsCountY))
            this.setFeedInGrid();
    },

    resetGrid: function(){

    },


    /* ----------------------------------------------------
     *  FEED
    /* ---------------------------------------------------- */

    initFeed: function(){
        this.feed = {
            blocs: Array(),
            image: String,
            newSnakeImage: String
        };
        this.addFeed();
    },

    addFeed: function(){

        var feedAdded = false;

        //Create feed out of snake position
        while(!feedAdded){

            //New feed
            var feed = {
                x: Math.floor(this.grid.blocsCountX * Math.random()),
                y: Math.floor(this.grid.blocsCountY * Math.random()),
                life: 20,
            };

            //Test if on snake
            var noMatch = true;
            for(var i = 0; i < this.snake.blocs; i++){
                if(this.snake.blocs[i].x == feed.x && this.snake.blocs[i].y == feed.y)
                    noMatch = false;
            }
            
            //Add
            if(noMatch){
                feedAdded = true;
                this.feed.blocs.push(feed);

                //Front
                this.addBlocToFront('feed', false);

                // Set the background image for the new feed
                var newFeedBloc = document.querySelector('#dark-theme #snake .feed');
                if (newFeedBloc) {
                    newFeedBloc.style.backgroundImage = 'url(' + feed.image + ')';
                }

            }
        }
    },


    updateFeed: function(){

        //Remove 1 life to each feed
        //for(i = 0, len = this.feed.blocs.length; i < len; i++){

            //If life = 0 remove feed
            //if(--this.feed.blocs[i].life == 0){
            //    this.feed.blocs.splice(i,1);
            //}
        //}
    },

    eatFeed: function(target){
        this.feed.newSnakeImage = this.feed.image; // Update lastFeedImage to the image of the eaten feed
        this.removeFeed(target);
        this.addSnakeTail();
        this.addFeed();
        this.speedUpTimer();

    },

    setFeedInGrid: function(){
        for(i = 0, len = this.feed.blocs.length; i < len; i++){
            if(this.feed.blocs[i].x > this.grid.blocsCountX || this.feed.blocs[i].y > this.grid.blocsCountY){
                this.removeFeed(i);
                this.addFeed();
            }
        }
    },

    resetFeed: function(addOne){
        this.feed.blocs = Array();
    },

    removeFeed: function(target){
        this.feed.blocs.splice(target,1);

        //Front
        this.removeBlocToFront('feed');
    },

    /* ----------------------------------------------------
     *  SNAKE
    /* ---------------------------------------------------- */

    initSnake: function(){

        this.snake = {
            direction: 1, //0 = up
                          //1 = right
                          //2 = bottom
                          //3 = left
            targetDirection: false,
            oposits: new Array(2,3,0,1),
            directionsStrings: new Array('top','right','bottom','left'),
            blocs: new Array(),
            tailNeedUpdate: false
        };

        //Initial position (X,Y)
        this.snake.blocs.push({
            x: Math.floor(this.grid.blocsCountX/2),
            y: Math.floor(this.grid.blocsCountY/2)
        });
        this.addBlocToFront('snake', true);
    },

    updateSnakeDirection: function(){
        if(this.snake.targetDirection !== false && this.snake.targetDirection != this.snake.direction && this.snake.oposits[this.snake.targetDirection] != this.snake.direction)
            this.snake.direction = this.snake.targetDirection;
        else
            this.snake.targetDirection = false;
    },

    updateSnake: function(){

        var i,
            newPosition = {
                x: this.snake.blocs[0].x,
                y: this.snake.blocs[0].y,
            };

        //Direction
        this.updateSnakeDirection();

        //Move
        switch(this.snake.direction){
            case 0:
                newPosition.y -= 1;
                break;
            case 1:
                newPosition.x += 1;
                break;
            case 2:
                newPosition.y += 1;
                break;
            case 3:
                newPosition.x -= 1;
                break;
            default: 
                console.log('error');
                break;
        }

        //Borders
        if(newPosition.x > this.grid.blocsCountX)
            newPosition.x = 0;

        if(newPosition.x < 0)
            newPosition.x = this.grid.blocsCountX;

        if(newPosition.y > this.grid.blocsCountY)
            newPosition.y = 0;

        if(newPosition.y < 0)
            newPosition.y = this.grid.blocsCountY;


        //Test if snake feed
        for(i = 0; i < this.feed.blocs.length; i ++){

            var feed = this.feed.blocs[i];
            if(newPosition.x == feed.x && newPosition.y == feed.y){
                this.eatFeed(i);
            }
        }

        //Update tail from the tail to the head
        var lastBloc = this.snake.blocs[this.snake.blocs.length-1];
        for(i = this.snake.blocs.length-1; i >= 0; i--){

            //Head
            if(i==0){
                this.snake.blocs[0].x = newPosition.x;
                this.snake.blocs[0].y = newPosition.y;
            }

            //Rest
            else {
                this.snake.blocs[i].x = this.snake.blocs[i-1].x;
                this.snake.blocs[i].y = this.snake.blocs[i-1].y;
            }
        }

        //Test if snake just canibalize himself
        for(i = 1; i < this.snake.blocs.length; i++){
            if(newPosition.x == this.snake.blocs[i].x && newPosition.y == this.snake.blocs[i].y){
                this.gameOver();

            }
        }
        //Add to tail
        if(this.snake.tailNeedUpdate){
            this.snake.tailNeedUpdate = false;
            this.snake.blocs.push();

            this.snake.blocs.push({
                x: lastBloc.x,
                y: lastBloc.y
            });

            //Front
            this.addBlocToFront('snake', false);
        }
    },

    addSnakeTail: function(){
        this.snake.tailNeedUpdate = true;
        //Add score
        //Increase speed
        //etc.
    },

    setSnakeInGrid: function(){

    },

    resetSnake: function(){
        this.snake.direction = 1;
        this.snake.blocs = new Array();
    },


    /* ----------------------------------------------------
     *  TIMER
    /* ---------------------------------------------------- */

    initTimer: function(){
        this.timerTic(this);
        this.timerDelay = this.params.updateDelay;
    },

    timerTic: function(that){

        if(that.game.running){
            window.setTimeout(function(){
                that.timerTic(that);
            },that.timerDelay);

            that.updateSnake();
            that.updateFeed();
            that.updateFront();
            if(that.ia.running)
                that.updateIA();
        } 
    },

    speedUpTimer: function(){

        if(this.timerDelay > 20)
            this.timerDelay--;
    },

    resetTimer: function(){
        this.timerDelay = this.params.updateDelay;
    },


    /* ----------------------------------------------------
     *  USER EVENTS
    /* ---------------------------------------------------- */

    initUserEvents: function(){

        var that = this;
        document.onkeydown = function(e){
            if(!that.ia.running)
                that.keyDownEvent(e.keyCode);
        }
    },

    keyDownEvent: function(keyCode){

        var direction = keyCode==38?0:
                        keyCode==39?1:
                        keyCode==40?2:
                        keyCode==37?3:false;

        if(direction !== false)
            this.snake.targetDirection = direction;
    },


    /* ----------------------------------------------------
     *  FRONT
    /* ---------------------------------------------------- */

    initFront: function(){
        this.front = {};
        this.front.snake = $('#snake');
        this.front.feed = $('#feed');
    },

    updateFront: function(){

        var i = 0;

        //SNAKE
        for(i = 0; i < this.snake.blocs.length; i++){

            var tailPart = this.snake.blocs[i],
                bloc = this.front.snake.find('div').eq(i);

            bloc.css({
                left: (this.grid.properties.blocSize + this.grid.properties.blocPadding) * tailPart.x + 'px',
                top: (this.grid.properties.blocSize + this.grid.properties.blocPadding) * tailPart.y + 'px'
            });
        }

        //FEED
        for(i = 0; i < this.feed.blocs.length; i++){
            
            var feedPart = this.feed.blocs[i],
                bloc = this.front.feed.find('div').eq(i);

            bloc.css({
                left: (this.grid.properties.blocSize + this.grid.properties.blocPadding) * feedPart.x + 'px',
                top: (this.grid.properties.blocSize + this.grid.properties.blocPadding) * feedPart.y + 'px'
            });
        }
    },

    getRandomImage: function() {
        var images = ['images/anton.png', 'images/ava.png', 'images/kennedy.png', 'images/luke.png', 'images/tsion.png', 'images/pierce.png'];
        var randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    },        

    addBlocToFront: function(target, begin=false){
    
        var bloc = $('<div />');
        bloc.css({
            width: this.grid.properties.blocSize,
            height: this.grid.properties.blocSize
        });
    
        if(target == 'feed') {
            var image = this.getRandomImage(); // generate a random image
            this.feed.newSnakeImage = this.feed.image; // sets the image that should be added to the snake as current image
            this.feed.image = image; // makes a new one
            bloc.css('background-image', 'url(' + image + ')'); // apply the image to the new snake segment
            this.front.feed.append(bloc);
        }
        else if(target == 'snake') {
            if(begin == true) {
                var image = 'images/phil.png'; 
                bloc.css('background-image', 'url(' + image + ')'); // apply the image to the new snake segment
                this.front.snake.append(bloc);
            }
            else {
                var image = this.feed.newSnakeImage; // use image that was feed
                bloc.css('background-image', 'url(' + image + ')'); // apply the image to the new snake segment
                this.front.snake.append(bloc);
            }
        }
    },
        

    removeBlocToFront: function(target){
        if(target == 'feed')
            this.front.feed.find('div:last-child').remove();
        else if(target == 'snake')
            this.front.snake.find('div:last-child').remove();
    },

    resetFront: function(){
        this.front.feed.empty();
        this.front.snake.empty();
    }
}



/*
 * By : http://bruno-simon.com
 * Clock
 * Need : jQuery 
 */

var Clock = function(){}

Clock.prototype = {

    init: function(target){
        this.target = target;
        this.startClock();
    },

    startClock: function(){
        this.updateClock(this);
    },

    updateClock: function(that){

        var now = new Date(),
            hours = that.twoDigits(now.getHours() % (options.user.hour_format ? options.user.hour_format : 24)),
            minutes = that.twoDigits(now.getMinutes()),
            seconds = that.twoDigits(now.getSeconds());

        that.target.html(that.formatTime(hours,minutes,seconds));
        
        window.setTimeout(function(){
            that.updateClock(that);
        }, 1000);
    },

    twoDigits: function(value){

        value = parseInt(value) + '';

        if(value.length == 1)
            return '0' + value;

        else if(value.length == 2)
            return value;
    },

    formatTime: function(hours,minutes,seconds){
        return hours + ' ' + minutes + ' ' + seconds;
    }
}


/* ----------------------------------------------------
 *  MOUSE
/* ---------------------------------------------------- */

var mouse = {};

function mouseMove(e){

    if(snake.game.running && snake.ia.running && (e.clientX != mouse.x || e.clientY != mouse.y)){
        panel.time.removeClass('hide');
        panel.start.removeClass('hide');
    }
    
    window.clearTimeout(mouse.timeOut);
    mouse.timeOut = window.setTimeout(mouveMoveTimeout,3000);

    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function mouveMoveTimeout(){
    if(snake.game.running && snake.ia.running){
        panel.time.addClass('hide');
        panel.start.addClass('hide');
    }
}

function windowResize(){
    var height = $(window).innerHeight();
    panel.time.css('line-height',height + 'px');
    panel.start.css('line-height',height + 'px');
}

function startMousedown(){
    
    panel.time.addClass('hide');
    panel.start.addClass('hide');
    panel.options.addClass('hide');

    //STOP IA
    snake.stopIA();

    //LISTEN GAME OVER
    snake.onGameOver(function(){
        panel.time.removeClass('hide');
        panel.start.removeClass('hide');
    });

    //WAIT BEFORE START
    window.setTimeout(function(){
        snake.gameStart();
    },1000);

    return false;
}


/* ----------------------------------------------------
 *  OPTIONS
/* ---------------------------------------------------- */

var options = {
    user: {

    },
    defaults: {
        hour_format: '24',
        theme: 'dark',
        initial_speed: 'slow'
    }
};

function initOptions(){


    //Init
    options.bloc = $('#options');
    options.fieldsets = options.bloc.find('fieldset');
    options.inputs = options.bloc.find('input');
    options.infos = options.bloc.find('infos');


    //From default
    if(options.user.hour_format == null)
        options.user.hour_format = options.defaults.hour_format;

    if(options.user.theme == null)
        options.user.theme = options.defaults.theme;

    if(options.user.initial_speed == null)
        options.user.initial_speed = options.defaults.initial_speed;


    //From local storage
    localStorageOptions = {};
    if(localStorage['options'])
        localStorageOptions = JSON.parse(localStorage['options']);

    if(localStorageOptions.hour_format != null)
        options.user.hour_format = localStorageOptions.hour_format;

    if(localStorageOptions.theme != null)
        options.user.theme = localStorageOptions.theme;

    if(localStorageOptions.initial_speed != null)
        options.user.initial_speed = localStorageOptions.initial_speed;


    //Init options page
    $('#hour_format_' + options.user.hour_format).attr('checked','checked');
    $('#theme_' + options.user.theme).attr('checked','checked');
    $('#initial_speed_' + options.user.initial_speed).attr('checked','checked');


    //Apply options
    applyOptions();

    options.inputs.on('change',onOptionsChange);
}

function onOptionsChange(){

    var values = {};

    options.fieldsets.each(function(){

        var _fieldset = $(this),
            _option = _fieldset.find(':checked');

        if(_option.length)
            values[_fieldset.attr('id')] = _option.val();
    });

    if(values.hour_format != null)
        options.user.hour_format = values.hour_format;

    if(values.theme != null)
        options.user.theme = values.theme;

    if(values.initial_speed != null)
        options.user.initial_speed = values.initial_speed;


    try { 
        localStorage['options'] = JSON.stringify(options.user);
    } catch(e){
        localStorage.clear();
        alert('Error');
    }

    applyOptions();
}

function applyOptions(){
    $('body').attr('id',options.user.theme + '-theme');
}


/* ----------------------------------------------------
 *  INIT
/* ---------------------------------------------------- */

var panel = {},
    snake = null;

function init(){

    //Options
    initOptions();

    //Game
    snake = new ChromeSnake();
    snake.init({
        initialSpeed: options.user.initial_speed
    });
    snake.startIA();

    //Time
    panel.time = $('#time');
    panel.time.addClass('animate');
    clock = new Clock();
    clock.init(panel.time.find('span'));

    //Start
    panel.start = $('#start');
    panel.start.addClass('animate');
    panel.start.on('click',startMousedown);
    panel.start.on('selectstart', false);

    //Options
    panel.options = $('#options-link');

    //Default new tab
    panel.defaultNewTab = $('#default-new-tab');
    panel.defaultNewTab.on('click',function() {
        if(chrome.tabs)
            chrome.tabs.update({url:"chrome-internal://newtab/"});
        return false;
    });
    
    //Mouse moving
    mouse.timeOut = window.setTimeout(mouveMoveTimeout,3000);
    mouse.x = 0;
    mouse.y = 0;
    $('body').on('mousemove',mouseMove);

    //Resizing
    windowResize();
    snake.onResize(function(){
        windowResize();
    });
}

$(function(){
    init();
});