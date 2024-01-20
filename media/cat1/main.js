const path = require("path");

const catContainer = document.getElementById('cat-container');
const canvas = document.getElementById("anim_canvas");
const ctx = canvas.getContext("2d");

const spriteImg = new Image();

spriteImg.src = "media/black_1.png";

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;


const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

const FRAME_PER_SPRITE = 6;


const sprite_details = {
    "sit": {
        "start_x": 33,
        "start_y": 0,
        "sprite_num": 7,
        "is_looping": false,
        "frames_per_sprite": 12,
        "custom_idx_lst": [],
        "x_inc": 0,
        "y_inc": 0,
    },
    "look_around": {
        "start_x": 33,
        "start_y": 128,
        "sprite_num": 5,
        "is_looping": true,
        "frames_per_sprite": 12,
        "custom_idx_lst": [2, 1, 0, 0, 1, 2, 2, 2, 3, 4, 4, 3, 2, 2, 2, 2],
        "x_inc": 0,
        "y_inc": 0,
    },


    "lay_down": {},


    "walk_left": {
        "start_x": 32 * 5 + 1,
        "start_y": 32 * 12,
        "sprite_num": 4,
        "is_looping": true,
        "frames_per_sprite": 8,
        "custom_idx_lst": [],
        "x_inc": 0,
        "y_inc": -1,
    },
    "walk_right": {
        "start_x": 32 * 13 + 1,
        "start_y": 32 * 12,
        "sprite_num": 4,
        "is_looping": true,
        "frames_per_sprite": 8,
        "custom_idx_lst": [],
        "x_inc": 0,
        "y_inc": 1,
    },
    "walk_up": {
        "start_x": 32 * 9 + 1,
        "start_y": 32 * 12,
        "sprite_num": 4,
        "is_looping": true,
        "frames_per_sprite": 8,
        "custom_idx_lst": [],
        "x_inc": -1,
        "y_inc": 0,
    },
    "walk_down": {
        "start_x": 32 + 1,
        "start_y": 32 * 12,
        "sprite_num": 4,
        "is_looping": true,
        "frames_per_sprite": 8,
        "custom_idx_lst": [],
        "x_inc": 1,
        "y_inc": 0,
    },
}


// parameters
let animName = null;
let startX = null;
let startY = null;
let spriteNum = null;
let currFrame = null;
let isLooping = null;
let framePerSprite = null;
let spriteIdxLst = [];

let animRequest = null;

let canvasPosX = 320;
let canvasPosY = 320;
let canvasXInc;
let canvasYInc;

function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let spriteIdx;
    if (isLooping) {
        if (spriteIdxLst.length > 0) {
            spriteIdx = Math.floor(currFrame / framePerSprite) % spriteIdxLst.length;
            spriteIdx = spriteIdxLst[spriteIdx];
        } else {
            spriteIdx = Math.floor(currFrame / framePerSprite) % spriteNum;
        }
    }
    else {
        spriteIdx = Math.min(
            Math.floor(currFrame / framePerSprite),
            spriteNum - 1
        );
    }


    // Calculate locations based on idx
    const currX = startX + 32 * Math.floor(spriteIdx / 4);
    const currY = startY + 32 * (spriteIdx % 4);

    // Draw
    ctx.drawImage(
        spriteImg,
        currY, currX, SPRITE_WIDTH, SPRITE_HEIGHT,          // this is for sprite
        canvasPosY, canvasPosX, 5*SPRITE_WIDTH, 5*SPRITE_HEIGHT                   // this is for canvas
    );
    currFrame++;
    canvasPosX = Math.min(
        Math.max(
            0,
            canvasPosX + canvasXInc
        ),
        CANVAS_WIDTH - 5 * SPRITE_WIDTH,
    )
    canvasPosY = Math.min(
        Math.max(
            0,
            canvasPosY + canvasYInc
        ),
        CANVAS_HEIGHT - 5 * SPRITE_HEIGHT
    );
    animRequest = requestAnimationFrame(animate);
}

function playAnimation(newAnimName) {

    console.table("hi bitch", newAnimName);
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

    if (animRequest != null) {
        cancelAnimationFrame(animRequest);
    }

    animate();
}


// function playAnimation(animation) {
//     const frameCount = 10; // Adjust based on the number of frames in your sprite sheet
//     let frame = 0;
//
//     function updateFrame() {
//         catContainer.style.backgroundPosition = `-${frame * 100}px 0`; // Adjust the width of each frame
//         frame = (frame + 1) % frameCount;
//     }
//
//     function play() {
//         updateFrame();
//         requestAnimationFrame(play);
//     }
//
//     switch (animation) {
//         case 'idle':
//             // Define the range of frames for the idle animation in your sprite sheet
//             frame = 0;
//             break;
//         case 'walk':
//             // Define the range of frames for the walk animation in your sprite sheet
//             frame = 0;
//             break;
//         case 'jump':
//             // Define the range of frames for the jump animation in your sprite sheet
//             frame = 0;
//             break;
//         default:
//             console.error('Unknown animation:', animation);
//             return;
//     }
//
//     play();
// }

class AnimCharacter {
    //

}