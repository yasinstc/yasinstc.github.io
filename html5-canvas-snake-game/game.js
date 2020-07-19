class Apple {
    constructor(context, options) {
        this.context = context;
        this.src = "apple.png";
        this.x = 160;
        this.y = 160;
        this.w = 15;
        this.h = 15;
    }

    create() {
        this.image = new Image();
        this.image.src = this.src;
    }

    update() {
        this.context.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
}


class Score {
    constructor(context) {
        this.context = context;
        this.x = 16;
        this.y = 16;
        this.font = {
            family: "Tahoma",
            size: "12px",
            color: "#333"
        }
    }

    write(text) {
        this.text = text;
        this.context.font = this.font.size + " " + this.font.family;
        this.context.fillStyle = this.font.color;
        this.context.fillText(this.text, this.x, this.y);
    }
}


class Snake {
    constructor(context) {
        this.context = context;
        this.piece = 3;
        this.start = {
            x: 80,
            y: 80
        }
        this.size = {
            w: 15,
            h: 15
        }
        this.pos = [];
        this.direction = {
            old: "right",
            new: "right"
        }
    }

    create() {
        this.pos = [];

        for(let i = 0; i < this.piece; i++) {
            let x, y;

            if(this.direction.new == "left" || this.direction.new == "right") {
                x = this.start.x - (this.size.w * i) - i;
                y = this.start.y;
            } else if(this.direction.new == "top" || this.direction.new == "bottom") {
                x = this.start.x;
                y = this.start.y - (this.size.h * i) - i;
            }

            this.pos.push({
                x: x,
                y: y
            });
        }

        this.draw();
    }

    draw() {
        this.context.fillStyle = "#000";

        this.pos.forEach( (obj) => {
            this.context.fillRect(obj.x, obj.y, obj.w, obj.h);
        });
    }

    update_direction() {
        var arr_pos = [];
        var NEW = this.direction.new;

        this.pos.forEach( (obj, key) => {
            if(key == 0) {
                if(NEW == "bottom") {
                    arr_pos.push({ x: obj.x, y: obj.y + this.size.h + 1 });
                } else if(NEW == "top") {
                    arr_pos.push({ x: obj.x, y: obj.y - (this.size.h + 1) });
                } else if(NEW == "left") {
                    arr_pos.push({ x: obj.x - (this.size.w + 1), y: obj.y });
                } else if(NEW == "right") {
                    arr_pos.push({ x: obj.x + this.size.w + 1, y: obj.y });
                }
            } else {
                var prev_pos = this.pos[ key - 1 ];

                arr_pos.push({
                    x: prev_pos.x,
                    y: prev_pos.y
                });
            }
        });

        this.pos = arr_pos;
        this.direction.old = this.direction.new;
    }

    update() {
        this.pos.forEach( (obj, key) => {
            if(key == 0) {
                this.context.fillStyle = "#000";
            } else {
                this.context.fillStyle = "#999";
            }
            this.context.fillRect(obj.x, obj.y, this.size.w, this.size.h);
        });
    }

    set(k, v) {
        this[k] = v;
    }

    get(k) {
        return this[k];
    }
}


var Game = {
    canvas: null,
    canvas_size: {
        w: 500,
        h: 500
    },
    context: null,
    objects: {
        snake: null,
        apple: null,
        score: null,
    },
    interval: null,
    frameNo: 0,
    score: 0,

    init: function() {
        this.canvas = $("#game-canvas")[0];
        this.context = this.canvas.getContext("2d");

        this.events();
    },

    start: function() {
        $("#game-canvas").removeClass("opacity-2");
        $('#start-game').hide();

        this.score = 0;
        this.frameNo = 0;

        this.create_snake();
        this.create_apple();
        this.create_score();

        this.interval = setInterval(this.update_game.bind(this), 150);
    },

    update_game: function() {
        var crash = false;

        // Check: Canvas
        if(this.objects.snake.pos[0].x <= 0) {
            crash = true;
        }

        if(this.objects.snake.pos[0].y <= 0) {
            crash = true;
        }

        if(this.objects.snake.pos[0].x + this.objects.snake.size.w > this.canvas_size.w) {
            crash = true;
        }

        if(this.objects.snake.pos[0].y + this.objects.snake.size.h > this.canvas_size.h) {
            crash = true;
        }

        // Check: Own Tail
        for(i = 1; i < this.objects.snake.pos.length; i++) {
            var pos = this.objects.snake.pos[i];
            var x = pos.x;
            var y = pos.y;

            if(this.objects.snake.pos[0].x == x && this.objects.snake.pos[0].y == y) {
                crash = true;
            }
        }

        if(crash) {
            $("#game-canvas").addClass("opacity-2");
            $("#start-game").show().html('Restart');
            this.stop();

            return;
        }

        this.frameNo++;
        
        this.clear();
        this.objects.snake.update_direction();
        this.objects.snake.update();

        if( this.objects.snake.pos[0].x >= this.objects.apple.x &&
            this.objects.snake.pos[0].x <= this.objects.apple.x &&
            this.objects.snake.pos[0].y >= this.objects.apple.y &&
            this.objects.snake.pos[0].y <= this.objects.apple.y
        ) {
            var rand_2_20 = Math.floor((Math.random() * 20) + 2);

            this.objects.apple.x = rand_2_20 * 16;
            this.objects.apple.y = rand_2_20 * 16;
            this.objects.apple.update();

            var snake_length = this.objects.snake.pos.length;

            this.objects.snake.pos[snake_length] = this.objects.snake.pos[snake_length - 1];

            this.score++;
        } else {
            this.objects.apple.update();
        }
        this.objects.score.write('Score: ' + this.score);
    },

    clear: function() {
        this.context.clearRect(0, 0, this.canvas_size.w, this.canvas_size.h);
    },

    stop: function() {
        clearInterval(this.interval);
    },

    events: function() {
        $(document).on('click', '#start-game', this.start.bind(this));
        window.addEventListener('keydown', this.keyDown.bind(this));
    },

    create_snake: function() {
        this.objects.snake = new Snake(this.context);
        this.objects.snake.create();
        this.objects.snake.update();
    },

    create_apple: function() {
        this.objects.apple = new Apple(this.context);
        this.objects.apple.create();
    },

    create_score: function() {
        this.objects.score = new Score(this.context);
    },

    keyDown: function(e) {
        var key_code = e.keyCode;
        var obj_direction = this.objects.snake.get("direction");
        var current_direction = obj_direction.new;

        // Right
        if(current_direction != "left" && key_code === 39) {
            this.objects.snake.set("direction", {
                old: current_direction,
                new: "right"
            });
        // Left
        } else if(current_direction != "right" && key_code === 37) {
            this.objects.snake.set("direction", {
                old: current_direction,
                new: "left"
            });
        // Down
        } else if(current_direction != "top" && key_code === 40) {
            this.objects.snake.set("direction", {
                old: current_direction,
                new: "bottom"
            });
        // Up
        } else if(current_direction!= "bottom" && key_code === 38) {
            this.objects.snake.set("direction", {
                old: current_direction,
                new: "top"
            });
        }
    }
}

Game.init();