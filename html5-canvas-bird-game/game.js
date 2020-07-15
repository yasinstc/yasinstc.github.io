class Bird {
    constructor(context) {
        this.context = context;
        this.src = "bird.png";
        this.width = 50;
        this.height = 50;
        this.x = 100;
        this.y = 150;
        this.speed_x = 0;
        this.speed_y = 0;
        this.gravity = 0.01;
        this.gravitySpeed = 0;
        this.bounce = 0.6;
    }

    create() {
        this.image = new Image();
        this.image.src = this.src;
    }

    update() {
        this.gravitySpeed += this.gravity;
        this.x += this.speed_x;
        this.y += this.speed_y + this.gravitySpeed;

        var rockbottom = 400 - 50;
        var rocktop = 0;

        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }

        if (this.y < 0) {
            this.y = 0;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }

        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}


class Background {
    constructor(context) {
        this.context = context;
        this.src = "game-background.png";
        this.x = 100;
        this.y = 150;
    }

    create() {
        this.image = new Image();
        this.image.src = this.src;
    }

    update() {
        this.context.drawImage(this.image, 0, 0, 500, 400);
    }
}


class Obstacle {
    constructor(context, options) {
        this.context = context;
        this.src = options.is_top ? "small_post_rotate.png" : "small_post.png";
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
    }

    create() {
        this.image = new Image();
        this.image.src = this.src;
    }

    update() {
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}


class Music {
    constructor(context) {
        this.context = context;
        this.src = "gametheme.mp3";
    }

    create() {
        this.sound = document.createElement("audio");
        this.sound.src = this.src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }

    play() {
        this.sound.play();
    }

    stop = function () {
        this.sound.pause();
    }
}


class Sound_gameover {
    constructor(context) {
        this.context = context;
        this.src = "bounce.mp3";
    }

    create() {
        this.sound = document.createElement("audio");
        this.sound.src = this.src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }

    play() {
        this.sound.play();
    }

    stop = function () {
        this.sound.pause();
    }
}


class Score {
    constructor(context) {
        this.context = context;
        this.x = 380;
        this.y = 20;
        this.font = {
            family: "Tahoma",
            size: "14px",
            color: "#fff"
        }
    }

    write(text) {
        this.text = text;
        this.context.font = this.font.size + " " + this.font.family;
        this.context.fillStyle = this.font.color;
        this.context.fillText(this.text, this.x, this.y);
    }
}


class Record {
    constructor(context) {
        this.context = context;
        this.x = 280;
        this.y = 20;
        this.font = {
            family: "Tahoma",
            size: "14px",
            color: "#fff"
        }
    }

    write(text) {
        this.text = text;
        this.context.font = this.font.size + " " + this.font.family;
        this.context.fillStyle = this.font.color;
        this.context.fillText(this.text, this.x, this.y);
    }
}


class Speed {
    constructor(context) {
        this.context = context;
        this.x = 20;
        this.y = 20;
        this.font = {
            family: "Tahoma",
            size: "14px",
            color: "#fff"
        }
    }

    write(text) {
        this.text = text;
        this.context.font = this.font.size + " " + this.font.family;
        this.context.fillStyle = this.font.color;
        this.context.fillText(this.text, this.x, this.y);
    }
}

var Game = {
    canvas: null,
    context: null,
    objects: {
        bird: null,
        obstacles: [],
        score: null,
        record: null,
        sounds: {
            music: null,
            effects: {
                gameover: null
            }
        },
        speed: null
    },
    canvas_w: 500,
    canvas_h: 400,
    score: 0,
    record: 0,
    speed: 50,
    defaut_speed: 50,
    sound: {
        theme: 'gametheme.mp3',
        gameover: 'bounce.mp3'
    },
    keys: null,
    interval: null,
    frameNo: 0,

    init: function() {
        this.events();
    },

    events: function() {
        $(document).on('click', '#start-game', this.start_game.bind(this));
        $(document).on('mousedown', this.mouse_down.bind(this));
        $(document).on('mouseup', this.mouse_up.bind(this));
        $(document).on('pointerdown', this.mouse_down.bind(this));
        $(document).on('pointerup', this.mouse_up.bind(this));
        $(document).on('keydown', this.key_down.bind(this));
        $(document).on('keyup', this.key_up.bind(this));
    },

    start_game: function() {
        $("#game-canvas").removeClass("opacity-2");
        $('#start-game').hide();
        
        this.canvas = $("#game-canvas")[0];
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;

        this.create_bird();
        this.create_background();
        this.create_music();
        this.create_sound_gameover();
        this.create_score();
        this.create_record();
        this.create_speed();

        this.interval = setInterval(this.update.bind(this), 30);
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas_w, this.canvas_h);
    },

    stop: function () {
        clearInterval(this.interval);

        this.objects.obstacles = [];
    },

    change_speed: function(speed) {
        clearInterval(this.interval);

        this.interval = setInterval(this.update.bind(this), speed);
    },

    everyinterval: function(n) {
        if ((this.frameNo / n) % 1 == 0) {
            return true;
        }
        return false;
    },

    check_crash: function (bird, obstacle) {
        var myleft = bird.x;
        var myright = bird.x + (bird.width);
        var mytop = bird.y;
        var mybottom = bird.y + (bird.height);
        var otherleft = obstacle.x;
        var otherright = obstacle.x + (obstacle.width);
        var othertop = obstacle.y + 6;
        var otherbottom = obstacle.y + (obstacle.height) - 6;
        var crash = true;
        
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = false;
        }

        return crash;
    },

    update: function() {
        var x, y;
        for (i = 0; i < this.objects.obstacles.length; i+= 1) {
            if (this.check_crash(this.objects.bird, this.objects.obstacles[i])) {
                this.objects.sounds.music.stop();
                this.objects.sounds.effects.gameover.play();
                this.stop();
                $("#game-canvas").addClass("opacity-2");
                $("#start-game").show().html('Restart');

                return;
            }
        }

        this.clear();

        this.objects.bird.speed_x = 0;
        this.objects.bird.speed_y = 0;

        if (this.keys && this.keys[37]) {
            this.objects.bird.speed_x = -1;
        }
        if (this.keys && this.keys[39]) {
            this.objects.bird.speed_x = 1;
        }
        if (this.keys && this.keys[38]) {
            this.objects.bird.speed_y = -1;
        }
        if (this.keys && this.keys[40]) {
            this.objects.bird.speed_y = 1;
        }

        this.objects.background.update();
        this.objects.bird.update();

        // Obstacles Create Every 150 Frame
        if (this.everyinterval(150)) {
            this.create_obstacles();
        }

        // Decrease Distance
        this.objects.obstacles.forEach(function(obstacle, key) {
            obstacle.x += -1;
            obstacle.update();
        });

        this.frameNo += 1;

        this.objects.score.write('Skor: ' + this.frameNo);

        let scoreRecord = window.localStorage.getItem('scoreRecord');

        if(scoreRecord) {
            this.objects.record.write('Rekor: ' + scoreRecord);
        }

        if (this.frameNo > scoreRecord) {
            window.localStorage.setItem('scoreRecord', this.frameNo);
        }

        if (this.frameNo < 250) {
            txt_Speed = "Hız: 1X";
        } else if (this.frameNo < 500) {
            txt_Speed = "Hız: 1.2X";
            this.change_speed(this.defaut_speed * 100 / 120);
        } else if (this.frameNo < 1000) {
            txt_Speed = "Hız: 1.4X";
            this.change_speed(this.defaut_speed * 100 / 140);
        } else if (this.frameNo < 2000) {
            txt_Speed = "Hız: 1.6X";
            this.change_speed(this.defaut_speed * 100 / 160);
        } else if (this.frameNo < 4000) {
            txt_Speed = "Hız: 1.8X";
            this.change_speed(this.defaut_speed * 100 / 180);
        } else if (this.frameNo >= 4000) {
            txt_Speed = "Hız: 2X";
            this.change_speed(this.defaut_speed * 100 / 200);
        }

        this.objects.speed.write(txt_Speed);
    },

    create_bird: function() {
        this.objects.bird = new Bird(this.context);
        this.objects.bird.create();
    },

    create_background: function() {
        this.objects.background = new Background(this.context);
        this.objects.background.create();
    },

    create_music: function() {
        this.objects.sounds.music = new Music(this.context);
        this.objects.sounds.music.create();
        this.objects.sounds.music.play();
    },

    create_sound_gameover: function() {
        this.objects.sounds.effects.gameover = new Sound_gameover(this.context);
        this.objects.sounds.effects.gameover.create();
    },

    create_score: function() {
        this.objects.score = new Score(this.context);
    },

    create_record: function() {
        this.objects.record = new Record(this.context);
    },

    create_speed: function() {
        this.objects.speed = new Speed(this.context);
    },

    create_obstacles: function() {
        // Top Obstacle
        minHeight = 50;
        maxHeight = 150;
        obs1_height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        obs1_width = Math.floor(obs1_height / 4);
        
        obs1 = new Obstacle(this.context, {
            x: this.canvas_w,
            y: 0,
            width: obs1_width,
            height: obs1_height,
            is_top: true
        });

        this.objects.obstacles.push(obs1);
        obs1.create();

        // Gap
        minGap = 100;
        maxGap = 200;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap); 

        // Bottom Obstacle
        obs2_height = this.canvas_h - (obs1_height + gap);
        obs2_y = obs1_height + gap;
        obs2_width = Math.floor(obs2_height / 5);

        obs2 = new Obstacle(this.context, {
            x: this.canvas_w,
            y: obs2_y,
            width: obs2_width,
            height: obs2_height,
            is_top: false
        });

        this.objects.obstacles.push(obs2);

        obs2.create();
    },

    key_down: function(e) {
        this.keys = (this.keys || []);

        if (e.keyCode == 32) {
            this.accelerate(-0.2);
        }

        this.keys[e.keyCode] = true;
    },

    key_up: function(e) {
        if (e.keyCode == 32) {
            this.accelerate(0.1);
        }

        this.keys[e.keyCode] = false;
    },

    mouse_down: function(e) {
        var target = e.target;

        if(target.id == 'accelerate') {
            this.accelerate(-0.2);
        }
    },

    mouse_up: function(e) {
        var target = e.target;

        if(target.id == 'accelerate') {
            this.accelerate(0.1);
        }
    },

    accelerate(n) {
        this.objects.bird.gravity = n;
    }
}

Game.init();