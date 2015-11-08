/*

 _____ ______   ________              ________  ________  ________  ________  _________   
|\   _ \  _   \|\   __  \            |\   __  \|\   ____\|\   __  \|\   __  \|\___   ___\ 
\ \  \\\__\ \  \ \  \|\  \           \ \  \|\  \ \  \___|\ \  \|\ /\ \  \|\  \|___ \  \_| 
 \ \  \\|__| \  \ \   _  _\           \ \   _  _\ \  \  __\ \   __  \ \  \\\  \   \ \  \  
  \ \  \    \ \  \ \  \\  \| ___       \ \  \\  \\ \  \|\  \ \  \|\  \ \  \\\  \   \ \  \ 
   \ \__\    \ \__\ \__\\ _\|\__\       \ \__\\ _\\ \_______\ \_______\ \_______\   \ \__\
    \|__|     \|__|\|__|\|__\|__|        \|__|\|__|\|_______|\|_______|\|_______|    \|__|

    Author: Andrew Silaghi / Balaj Marius
    Technology used: HTML5, Javascript, NodeJS, Socket.io
                                                                                          
*/

var CANVAS,
    W = 830,
    H = 430,
    kills = 0,
    game = createjs,
    loader;    

var enviorement, hero, enemies, bullets;

// FOE Colors

var COLORS = ['#2d9f96', '#2b754f', '#7a2525', '#9e910c', '#354a68', '#563767', '#47c644', '#201da7', '#552a2a', '#584d4d', '#dd31c7', '#e5d528'];


/* Game states ========= */

var GAME = {
	start: false,
	over: false,
	speed: 2,
	level: 1,
	score: 0,	
	laser: '#7a2525'
};

/* Dom elements ========= */

var levelup = document.getElementById('levelup'),
	gameover = document.getElementById('gameover'),
	charge = document.getElementById('charge'),
	el = document.getElementById('story');


/* Init =========== */

function preload() {

    console.log('%c DOM loaded ', 'background:black;color:lightgreen');

    var canvas = document.getElementById('stage');
    CANVAS = new game.Stage(canvas);


    // Preloader

    var manifest = [
    	{ src: 'hero.png', id: 'hero' },
    	{ src: 'background.png', id: 'background' }, 
    	{ src: 'ground.png', id: 'ground' },
    	{ src: 'floor.png', id: 'floor' },
    	{ src: 'explode.png', id: 'explode' },
    	{ src: 'enemies/2d9f96.png', id: '#2d9f96' },
    	{ src: 'enemies/2b754f.png', id: '#2b754f' },
    	{ src: 'enemies/7a2525.png', id: '#7a2525' },
    	{ src: 'enemies/9e910c.png', id: '#9e910c' },
    	{ src: 'enemies/354a68.png', id: '#354a68' },
    	{ src: 'enemies/563767.png', id: '#563767' },
    	{ src: 'enemies/47c644.png', id: '#47c644' },
    	{ src: 'enemies/201da7.png', id: '#201da7' },
    	{ src: 'enemies/552a2a.png', id: '#552a2a' },
    	{ src: 'enemies/584d4d.png', id: '#584d4d' },
    	{ src: 'enemies/dd31c7.png', id: '#dd31c7' },
    	{ src: 'enemies/e5d528.png', id: '#e5d528' }

    ];


    // Start loader

    loader = new createjs.LoadQueue(false);
    loader.addEventListener('complete', drawScene);
    loader.loadManifest(manifest, true, 'img/');
}

/* Story ============ */

function autoType(element, story) {

	var i = 0,
	    text = '',
	  	interval = setInterval(function() {
		
			text += story[i];
			element.innerText = text;

			i++;

			if(i >= story.length) clearInterval(interval);

		}, 10);

}

/* Update charge ============= */

function updateCharge(blt) {

	var chargeVal = getCharge(blt);	

	switch(true) {

		case chargeVal >= 80:
		charge.style.background = '#79c02d';
		break;

		case chargeVal <= 40:
		charge.style.background = '#fe452d';
		break;

		case chargeVal <= 60:
		charge.style.background = '#e49923';
		break;

	}


	charge.style.width = chargeVal + '%';
}

function getCharge(b) {

	var width = 0;

	if(b >= 5) width = 100;
    if(b < 5) width = b * 20;

    return width;
}

/* HERO Constructor ======== */

function Hero() {


	var config = {
		'images': [loader.getResult('hero')],
		'frames': { 'regX': 0, 'regY': 0, 'height': 103, 'count': 64, 'width': 111 },	
		'animations': {
			'run': [0, 5, 'run', .18],
			'shot': [6, 8, 'run', .18],
			'die': [9, 14, true, .18]
		}
	};

	var HERO$SPRITE = new game.SpriteSheet(config);
	var HERO = new game.Sprite(HERO$SPRITE, 'run');

	// ADD bullets
	
	HERO.bullets = 5; 
	
	// HERO methods

	HERO.walkIn = function() {
		console.log('%c Hero walks in ', 'background:green;color:white');

		game.Tween.get(hero).to({ x: W - 170 }, 1000).call(spawn);
	}

	HERO.shot = function() {		

		HERO.gotoAndPlay('shot');

		if(HERO.bullets > 0) {			

			HERO.bullets--;

			console.log('%c You have ' + HERO.bullets + ' bullets ', 'background:#FF00FF;color:#fff;');

			var bullet = new game.Shape();
			bullet.graphics.beginFill(GAME.laser).drawRect(0, 0, 50, 2);

			bullets.addChild(bullet);
		}

        updateCharge(HERO.bullets);

		CANVAS.update();
	}

	HERO.die = function() {

		// Stop movement

		GAME.start = false;
		GAME.over = true;

		// Remove ticker

		game.Ticker.removeEventListener('tick', tick);
		game.Ticker.addEventListener('tick', CANVAS);

		// Show text
			
				
		gameover.style.display = 'block';
		gameover.classList.add('bounceInDown');

		// Type results

		document.getElementById('score').innerText = 'You helped Mr. RGBot kill ' + GAME.score + ' totems';


		// Change animation

		HERO.gotoAndPlay('die');

		// Remove hero from canvas when animation end

		HERO.addEventListener('animationend', function() {
            CANVAS.removeChildAt(CANVAS.children.indexOf(hero));
        });

	}


	return HERO;
}


/* Draw scene =========== */

function drawScene() {

    console.log('%c Draw scene ', 'background:red;color:#fff;');

    enviorement = new game.Container();

    // Draw enemies

    enemies = new game.Container();
    enemies.x = -100;    
    enemies.y = H - 169;

    // Draw Bullets
    
    bullets = new game.Container();
    bullets.x = W - 180;
    bullets.y = 322;

    // Draw background color

    var background$color = new game.Shape();
    background$color.graphics.beginFill('#563767').drawRect(0, 0, W, H);


    // Draw background image

    var background$image = new game.Shape(),
        background$imageSRC = loader.getResult('background');

    background$image.graphics.beginBitmapFill(background$imageSRC, 'repeat').drawRect(-W, 0, W * 2, background$imageSRC.height);


    // Draw ground

    var ground = new game.Shape(),
        groundSRC = loader.getResult('ground');


    ground.graphics.beginBitmapFill(groundSRC).drawRect(0, 0, W, groundSRC.height);
    ground.y = H - groundSRC.height;


    // Draw floor
    
    var floor = new game.Shape(),
    	floorSRC = loader.getResult('floor');


    floor.graphics.beginBitmapFill(floorSRC).drawRect(-W, 0, W * 2, floorSRC.height);
    floor.y = H - floorSRC.height - groundSRC.height; /* height - floor height - ground height */

    // Add stuff to envivorment

    enviorement.addChild(background$color, background$image, ground, floor);


    // Draw hero
    
    hero = new Hero();
   	hero.x = W;
    hero.y = H - groundSRC.height - 103;


    // Add stuff to stage

    CANVAS.addChild(enviorement, hero, enemies, bullets);
    CANVAS.update();

    // Write story
    	
    var story = 'Mr. RGBot is color blind and needs your help to pick the right color\r' +
				'to shoot down the obstacles keeping him from reaching his destination\r' +
				'\r' +
				'===================\r' +
				'press SHOT to start';

    autoType(el, story);

}

/* Level up ========== */

function levelUp() {

	kills++;

	if(kills === 5) {

		// Reset kills

		kills = 0;

		// Update game level

		GAME.level++;

		// Show level up

		levelup.style.display = 'block';
		levelup.classList.add('flash');

		levelup.addEventListener('animationend', function() {
			
			levelup.style.display = 'none';
			levelup.classList.remove('flash');			
		});

		// Update game speed
		
		GAME.speed+=2;
	}	

}

/* Get random ========= */

function randomColor() {
	return COLORS[Math.floor(Math.random() * (COLORS.length))];
}


/* Draw enemy ========= */

function drawEnemy() {

	console.log('%c Draw enemy ', 'background:purple;color:white');

	var foe = new game.Container(),
		foeLIFE = new game.Shape(),
		foeSHAPE = new game.Shape(),
		foeCOLOR = randomColor(),
		foeSRC = loader.getResult(foeCOLOR);


	foeSHAPE.graphics.beginBitmapFill(foeSRC).drawRect(0, 0, foeSRC.width, foeSRC.height);

	// Add life to FOE
	
	foe.LIFE = 100;
	foe.COLOR = foeCOLOR;

	// Life bar

	foeLIFE.graphics.beginFill('#6EB828').drawRect(0, 0, foe.LIFE / 2, 3);
	foeLIFE.x = 15;
	foeLIFE.y = -20;

	// Is dead
	
	foe.DEAD = false; 
	

	// Foe hit
	
	foe.hit = function(precentage) {

		console.log('%c Color match: ' + precentage + '% ', 'background:pink;color:#ffffff');

		if(precentage >= 90) {
			foe.die(enemies.children.indexOf(foe));
		}

		if(precentage >= 70) {

			if(foe.LIFE >= 0) {
				
				foe.LIFE -= precentage / 4;				
				
				if(foe.LIFE > 1) {
					foe.getChildAt(1).graphics.clear();
					foe.getChildAt(1).graphics.beginFill('#6EB828').drawRect(0, 0, foe.LIFE / 2, 3);				
				}
				
			}

			if(foe.LIFE < 0) foe.die(enemies.children.indexOf(foe));
					

		}

	}


	// FOE DIE

	foe.die = function(index) {

		var config = {
            'images': [loader.getResult('explode')],
            'frames': {
                'width': 121,
                'height': 106,
                'regX': 0,
                'regY': 0
            },
            'animations': {
                'explode': [0, 4, null, .3]
            },
        };

        var explode = new game.SpriteSheet(config);
        var foeSPRITE = new game.Sprite(explode, 'explode');

        foeSPRITE.x = -15;

        foeSPRITE.addEventListener('change', function(frame) {
        	if(frame.target._currentFrame === 3) foe.removeChildAt(0);
        });

        foeSPRITE.addEventListener('animationend', function() {

        	console.log('%c Foe died ', 'background:gray;color:white');


        	enemies.removeChildAt(index);
        });

        // Add +1 to kills
                
        if(!foe.DEAD) {
        	GAME.score++;
        	levelUp();

        	hero.bullets += 5;

        	// dirty features
        				
        	updateCharge(hero.bullets);
        }

        foe.DEAD = true;

        // Add child to foe

        foe.addChild(foeSPRITE);
	}

	// Update foe

	foe.addChild(foeSHAPE, foeLIFE);
	enemies.addChild(foe);

	CANVAS.update();
}

/* Spawn ========= */

function spawn() {

	drawEnemy();

	var timeout = setTimeout(spawn, 10000 / GAME.speed);
	if(!GAME.start) clearInterval(timeout);
}


/* Start game ======== */

function startGame() {

	console.log('%c Start game ', 'background: blue; color: white');

	GAME.start = true;

	// Hide story
	
	el.classList.add('hide');

	// Display Hero in view port

	hero.walkIn();

	// SET RAF and TICK

    game.Ticker.timingMode = game.Ticker.RAF;
    game.Ticker.addEventListener('tick', tick);

}

/* Update things ========= */

function tick(event) {


	// Animate floor and background

	if(GAME.start) {

		enviorement.getChildAt(1).x += GAME.speed;
		enviorement.getChildAt(3).x += GAME.speed;
	}

	// Reset position

	if(enviorement.getChildAt(1).x >= W) enviorement.getChildAt(1).x = enviorement.getChildAt(3).x = 0;		


	// Animate bullets

	bullets.children.forEach(function(bullet, bullet_index) {
		bullet.x -= 25;
	});

	// Animate enemies

	enemies.children.forEach(function(foe, foe_index) {		
		
		if(GAME.start) foe.x += GAME.speed;

		// Detect collision between foe and robot
		 
		if (foe.x >= hero.x + 30) hero.die();

		// Detect collision between bullet and foe
		
		bullets.children.forEach(function(bullet, bullet_index) {


			if (W - Math.abs(bullet.x) <= foe.x + 115) {

				// add here color match
				
				var precentage = match_colors(GAME.laser, foe.COLOR);
				foe.hit(precentage);

				bullets.removeChildAt(bullet_index);
			}

		});
	
	});


    CANVAS.update(event);
}


/* Sample controls ========== */
 
var socket = io.connect('http://70.32.79.168:8080/');

socket.on('playerShot', function(data) {
	console.log('%c Recived color: ' + data.color + ' ', 'background:magenta;color:white;');

	GAME.laser = data.color;

	if(GAME.start) hero.shot();
	if(!GAME.start) startGame();	
	if(GAME.over) location.reload();

});


socket.on('colorChange', function(data) {
	document.getElementById('color').style.background = data.color;
});

/* Run the game ========== */

domready(preload);
