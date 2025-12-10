const scene = document.getElementById('scene');

(function() {
    const sprite = new Image();
    sprite.src = 'images/flappy-bird-sprite.png';
    sprite.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = 225;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // 从雪碧图中裁剪出背景区域 (x=0, y=0, w=225, h=400)
        ctx.drawImage(sprite, 0, 0, 225, 400, 0, 0, 225, 400);
        
        // 将裁剪后的图片设置为 #home 的背景
        scene.style.backgroundImage = `url(${canvas.toDataURL()})`;
    };
})();


function scaleScene() {
    // 计算缩放比例：让游戏画面高度始终填满屏幕高度
    const scale = window.innerHeight / 400;
    
    // 应用缩放
    scene.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleScene);
// 初始化时也执行一次
scaleScene();

// ready页
let game_state = "home";
let bird; // 小鸟元素

document.getElementById("start_button").addEventListener('click', function(){
    // 隐藏首页场景
    document.getElementById("scene_home").style.display = 'none';
    // 显示游戏场景
    document.getElementById("scene_ready").style.display = 'flex';
    
    // 创建小鸟元素
    bird = document.createElement('div');
    bird.id = 'bird';
    document.getElementById('scene').appendChild(bird);

    // 游戏状态进入ready
    game_state = "ready"; 
});

let birdPosY = 200;
let birdSpeedY = 0;

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();

        if (game_state === "ready") {
            game_state = "running";
            console.log("game running!");
            // 隐藏ready界面，显示游戏小鸟
            document.getElementById("scene_ready").style.display = 'none';
            bird.style.display = 'block';
            
            // 开始游戏循环
            GameLoop();
        }
        else if (game_state === "running") {
            console.log("tapped!");
            // 用户tap后获得向上速度
            birdSpeedY = -3;
        }
    }
});

// game页
const scrollSpeed = 0.5;
let backgroundX = 0;

// 小鸟动画配置
const birdFrames = [
    '-179px -513px', // 帧1：当前坐标
    '-179px -554px', // 帧2：请修改为第二张图的坐标，例如 '-179px -540px'
    '-179px -513px', // 帧1：当前坐标
    '-179px -593px'  // 帧3：请修改为第三张图的坐标
];

let birdFrameIndex = 0;
let birdFrameTimer = 0;

function GameLoop() {
    backgroundX += scrollSpeed;

    if (backgroundX > 225) {
        backgroundX -= 225;
    }

    scene.style.backgroundPosition = `-${backgroundX}px 0px`;

    // 小鸟扇翅膀动画
    birdFrameTimer++;
    if (birdFrameTimer % 10 === 0) { // 每10帧切换一次图片，数字越小越快
        birdFrameIndex = (birdFrameIndex + 1) % birdFrames.length;
        bird.style.backgroundPosition = birdFrames[birdFrameIndex];
    }
    
    // 重力加速度下降
    birdSpeedY += 0.1;
    birdPosY = birdPosY + birdSpeedY;

    // 边界碰撞检测
    if (birdPosY < 0 || birdPosY + 22 > 400) {
        console.log("Game Over");
        game_state = "ended";
        bird.style.display = "none";
        return; // 停止游戏循环
    }

    // console.log(`speed ${birdSpeedY}, pos ${birdPosY}`);
    bird.style.top = `${birdPosY}px`; 

    requestAnimationFrame(GameLoop);
}
