// const path = require("path");
// const catContainer = document.getElementById("cat-container");
const canvas = document.getElementById("anim_canvas");
const ctx = canvas.getContext("2d");



function getRandomCat() {
    const catNames = [
        "black_1.png",
        "blue_1.png",
        "calico_0.png",
        "creme_0.png",
        "creme_1.png",
        "gold_0.png",
        "seal_point_0.png"
    ]
    return catNames[Math.floor(Math.random()*catNames.length)];
}

const spriteImg = new Image();
spriteImg.src = window.imgUri + "/" + getRandomCat();
const unhappyImg = new Image();
unhappyImg.src = window.imgUri + "/_cross.png";



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// let canvas.width = (canvas.width = 600);
// let canvas.height = (canvas.height = 600);

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

const FRAME_PER_SPRITE = 6;

const sprite_details = {
    sit: {
        start_x: 33,
        start_y: 0,
        sprite_num: 7,
        is_looping: false,
        frames_per_sprite: 12,
        custom_idx_lst: [],
        x_inc: 0,
        y_inc: 0,
    },

    look_around: {
        start_x: 33,
        start_y: 128,
        sprite_num: 5,
        is_looping: true,
        frames_per_sprite: 12,
        custom_idx_lst: [2, 1, 0, 0, 1, 2, 2, 2, 3, 4, 4, 3, 2, 2, 2, 2],
        x_inc: 0,
        y_inc: 0,
    },

    lay_down: {
        start_x: 33,
        start_y: 256,
        sprite_num: 8,
        is_looping: false,
        frames_per_sprite: 12,
        custom_idx_lst: [],
        x_inc: 0,
        y_inc: 0,
    },

    walk_left: {
        start_x: 32 * 5 + 1,
        start_y: 32 * 12,
        sprite_num: 4,
        is_looping: true,
        frames_per_sprite: 8,
        custom_idx_lst: [],
        x_inc: 0,
        y_inc: -1,
    },
    walk_right: {
        start_x: 32 * 13 + 1,
        start_y: 32 * 12,
        sprite_num: 4,
        is_looping: true,
        frames_per_sprite: 8,
        custom_idx_lst: [],
        x_inc: 0,
        y_inc: 1,
    },
    walk_up: {
        start_x: 32 * 9 + 1,
        start_y: 32 * 12,
        sprite_num: 4,
        is_looping: true,
        frames_per_sprite: 8,
        custom_idx_lst: [],
        x_inc: -1,
        y_inc: 0,
    },
    walk_down: {
        start_x: 32 + 1,
        start_y: 32 * 12,
        sprite_num: 4,
        is_looping: true,
        frames_per_sprite: 8,
        custom_idx_lst: [],
        x_inc: 1,
        y_inc: 0,
    },

    // special
    word: {
        start_x: 0,
        start_y: 32,
        sprite_num: 4,
        is_looping: true,
        frames_per_sprite: 12,
        custom_idx_lst: [],
        x_inc: null,
        y_inc: null,
    },
};

// parameters
let animName = null;
let startX = null;
let startY = null;
let spriteNum = null;
let currFrame = 0;
let isLooping = null;
let framePerSprite = null;
let spriteIdxLst = [];

let animRequest = null;

let canvasPosX = canvas.height / 2;
let canvasPosY = canvas.width / 2;
let canvasXInc;
let canvasYInc;

// set interval handle
let randomAnimHandle = null;
``
// set is range
let isUnhappy = false;
function animate() {
    if (animRequest !== null) {
        cancelAnimationFrame(animRequest);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let spriteIdx;
    if (isLooping) {
        if (spriteIdxLst.length > 0) {
            spriteIdx = Math.floor(currFrame / framePerSprite) % spriteIdxLst.length;
            spriteIdx = spriteIdxLst[spriteIdx];
        } else {
            spriteIdx = Math.floor(currFrame / framePerSprite) % spriteNum;
        }
    } else {
        spriteIdx = Math.min(Math.floor(currFrame / framePerSprite), spriteNum - 1);
    }

    // Calculate locations based on idx
    const currX = startX + 32 * Math.floor(spriteIdx / 4);
    const currY = startY + 32 * (spriteIdx % 4);
    // console.log(currX, currY);

    // Draw
    if (!isUnhappy) {
        ctx.drawImage(
            spriteImg,
            currY,
            currX,
            SPRITE_WIDTH,
            SPRITE_HEIGHT, // this is for sprite
            canvasPosY,
            canvasPosX,
            2 * SPRITE_WIDTH,
            2 * SPRITE_HEIGHT // this is for canvas
        );
    } else if (isUnhappy) {
        ctx.drawImage(
            spriteImg,
            8 * 32,
            33,
            SPRITE_WIDTH,
            SPRITE_HEIGHT, // this is for sprite
            canvasPosY,
            canvasPosX,
            2 * SPRITE_WIDTH,
            2 * SPRITE_HEIGHT // this is for canvas
        );

        ctx.drawImage(
            unhappyImg,
            0,
            0,
            SPRITE_WIDTH,
            SPRITE_HEIGHT, // this is for sprite
            canvasPosY - 2 * SPRITE_WIDTH,
            canvasPosX,
            2 * SPRITE_WIDTH,
            2 * SPRITE_HEIGHT // this is for canvas
        );
        ctx.drawImage(
            unhappyImg,
            0,
            0,
            SPRITE_WIDTH,
            SPRITE_HEIGHT, // this is for sprite
            canvasPosY + 2 * SPRITE_WIDTH,
            canvasPosX,
            2 * SPRITE_WIDTH,
            2 * SPRITE_HEIGHT // this is for canvas
        );
        ctx.drawImage(
            unhappyImg,
            0,
            0,
            SPRITE_WIDTH,
            SPRITE_HEIGHT, // this is for sprite
            canvasPosY,
            canvasPosX - 2 * SPRITE_WIDTH,
            2 * SPRITE_WIDTH,
            2 * SPRITE_HEIGHT // this is for canvas
        );
        ctx.drawImage(
            unhappyImg,
            0,
            0,
            SPRITE_WIDTH,
            SPRITE_HEIGHT, // this is for sprite
            canvasPosY,
            canvasPosX + 2 * SPRITE_WIDTH,
            2 * SPRITE_WIDTH,
            2 * SPRITE_HEIGHT // this is for canvas
        );        
    }

    currFrame++;

    // update 
    if (!isUnhappy) {
        canvasPosX += canvasXInc;
    } else {
        canvasPosX += Math.random() * 10 - 5;
    }
    if (!isUnhappy) {
        canvasPosY += canvasYInc;
    } else {
        canvasPosY += Math.random() * 10 - 5;
    }

    if (canvasPosX < 0) {
        canvasPosX = 0;
        playAnimation("walk_down");
    }
    if (canvasPosX > canvas.height - 2 * SPRITE_WIDTH) {
        canvasPosX = canvas.height - 2 * SPRITE_WIDTH;
        playAnimation("walk_up");
    }
    canvasPosY += canvasYInc;
    if (canvasPosY < 0) {
        canvasPosY = 0;
        playAnimation("walk_right");
    }
    if (canvasPosY > canvas.width - 2 * SPRITE_HEIGHT) {
        canvasPosY = canvas.width - 2 * SPRITE_HEIGHT;
        playAnimation("walk_left");
    }
    animRequest = requestAnimationFrame(animate);
}

function playAnimation(newAnimName) {
    // Reset animation and save params
    let animName = newAnimName;
    startX = sprite_details[animName]["start_x"];
    startY = sprite_details[animName]["start_y"];
    spriteNum = sprite_details[animName]["sprite_num"];
    isLooping = sprite_details[animName]["is_looping"];
    framePerSprite = sprite_details[animName]["frames_per_sprite"];
    currFrame = 0;
    spriteIdxLst = sprite_details[animName]["custom_idx_lst"];

    canvasXInc = sprite_details[animName]["x_inc"];
    canvasYInc = sprite_details[animName]["y_inc"];

    isUnhappy = animName == "word";

    animate();
}

window.addEventListener("resize", () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvasPosX = Math.min(Math.max(0, canvasPosX), canvas.height - 2 * SPRITE_WIDTH);
    canvasPosY = Math.min(Math.max(0, canvasPosY), canvas.width - 2 * SPRITE_HEIGHT);
    // animate();
});

window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
        case "special": {
            triggerSpecialAction(message.value);
            break;
        }
    }
});

function get_random_action() {
    const actions = ["walk_left", "walk_right", "walk_up", "walk_down", "look_around", "look_around", "lay_down", "lay_down"];
    const random_action = actions[Math.floor(Math.random() * actions.length)];
    return random_action;
}

function updateAnimationRandomDelay() {
    let randomDelay = Math.random() * 10000 + 5000; // 5~15 sec

    // Call myFunction after the random delay
    randomAnimHandle = setTimeout(function () {
        console.log("Gonna do this for", randomDelay / 1000, "sec");
        playAnimation(get_random_action());

        updateAnimationRandomDelay();
    }, randomDelay);
}

function triggerSepcialAction(specialName) {
    if (specialName == "unhappy") {
        isUnhappy = true;
        setTimeout(function() {
            console.log("The cat has been angry for 5 sec.");
            isUnhappy = false;
        }, 5000);
        // playAnimation("word");

        // // override the current animation, and cancel the current set time out, 
        // if (randomAnimHandle !== null) {
        //     clearTimeout(randomAnimHandle);
        // }
        // // reset the next random animation again, for the just resetted handle
        // updateAnimationRandomDelay();

    } else if (specialName == "rage") {

    }
}

playAnimation(get_random_action());
updateAnimationRandomDelay();
