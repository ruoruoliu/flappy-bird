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
const bird = document.getElementById('bird'); // 获取已有的小鸟元素

document.getElementById("start_button").addEventListener('click', function(){
    // 隐藏首页场景
    document.getElementById("scene_home").style.display = 'none';
    // 显示游戏场景
    document.getElementById("scene_ready").style.display = 'flex';
    // 游戏状态进入ready
    game_state = "ready"; 
});

document.getElementById("ok_button").addEventListener('click', function(){
    // 隐藏首页场景
    document.getElementById("scene_over").style.display = 'none';
    // 隐藏游戏层
    document.getElementById("scene_play").style.display = 'none'; 
    // 显示游戏场景
    document.getElementById("scene_ready").style.display = 'flex';
    
    // 游戏状态进入ready
    game_state = "ready"; 
});

document.getElementById("menu_button").addEventListener('click', function(){
    // 隐藏首页场景
    document.getElementById("scene_over").style.display = 'none';
    // 隐藏游戏层
    document.getElementById("scene_play").style.display = 'none'; 
    // 显示游戏场景
    document.getElementById("scene_home").style.display = 'flex';
    
    // 游戏状态进入home
    game_state = "home"; 
});

let birdPosY;
let birdSpeedY;

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();

        if (game_state === "ready") {
            game_state = "running";
            console.log("game running!");
            // 隐藏ready界面，显示游戏层
            document.getElementById("scene_ready").style.display = 'none';
            document.getElementById("scene_play").style.display = 'block';
            bird.style.display = 'block';
            
            GameInit();
            
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
const scrollSpeed = 1;
let backgroundX = 0;

// 小鸟动画配置
const birdFrames = [
    '-179px -513px', // 帧1：当前坐标
    '-179px -554px', // 帧2：请修改为第二张图的坐标，例如 '-179px -540px'
    '-179px -513px', // 帧1：当前坐标
    '-179px -593px'  // 帧3：请修改为第三张图的坐标
];

const scorePos = [
    '-774px -93px', // 0
    '-210px -710px', // 1
    '-454px -249px', // 2
    '-476px -249px', // 3
    '-498px -249px', // 4
    '-521px -249px', // 5
    '-454px -286px', // 6
    '-476px -286px', // 7
    '-498px -286px', // 8
    '-521px -286px' // 9
];

const smallScorePos = [
    '-215px -504px', // 0
    '-215px -518px', // 1
    '-215px -545px', // 2
    '-215px -559px', // 3
    '-215px -585px', // 4
    '-215px -599px', // 5
    '-215px -626px', // 6
    '-215px -640px', // 7
    '-215px -667px', // 8
    '-215px -681px' // 9
]

let birdFrameIndex;
let birdFrameTimer;
const birdWingRate = 10;

// 管道配置
const pipeGap = 100;
const pipeWidth = 42;
const pipeDistance = 170; // 管道间距
// 获取管道 DOM 元素并初始化数据结构
const pipesData = [
    { scored: false, x: 0, y: 0, topPipe: document.getElementById('pipe1t'), bottomPipe: document.getElementById('pipe1b') },
    { scored: false, x: 0, y: 0, topPipe: document.getElementById('pipe2t'), bottomPipe: document.getElementById('pipe2b') },
    { scored: false, x: 0, y: 0, topPipe: document.getElementById('pipe3t'), bottomPipe: document.getElementById('pipe3b') }
];
const gameData = { score: 0, best: 0 };

function GameInit() {
    birdPosY = 200;
    birdSpeedY = 0;
    birdFrameTimer = 0;
    birdFrameIndex = 0;

    // 初始化管道位置
    let startX = 300; // 第一根管道的初始位置
    pipesData.forEach((pipe, index) => {
        pipe.x = startX + index * pipeDistance;
        pipe.y = Math.floor(Math.random() * (300 - 100)) + 100;
        updatePipeTransform(pipe);
    });

    // 初始化游戏分数
    gameData.score = 9;
    document.getElementById("score").style.display = 'flex';
    document.getElementById("medal").style.backgroundPosition = '-188px -402px'; 
}

function updateGameScore() {
    const ones_digit = document.getElementById("ones_digit");
    const tens_digit = document.getElementById("tens_digit");
    const hundreds_digit = document.getElementById("hundreds_digit");
    
    const setDigitStyle = (element, num) => {
        element.style.backgroundPosition = scorePos[num];
        // 数字1比较窄，特殊处理宽度，避免间距过大
        if (num === 1) {
            element.style.width = '16px'; 
        } else {
            element.style.width = '22px';
        }
    };

    ones_digit.style.display = 'block'; 
    tens_digit.style.display = 'none'; 
    hundreds_digit.style.display = 'none'; 
    
    const ones = gameData.score % 10;
    setDigitStyle(ones_digit, ones);
    
    if (gameData.score >= 10) {
        tens_digit.style.display = 'block'; 
        const tens = Math.floor(gameData.score / 10) % 10;
        setDigitStyle(tens_digit, tens);
    }
    
    if (gameData.score >= 100) {
        hundreds_digit.style.display = 'block'; 
        const hundreds = Math.floor(gameData.score / 100) % 10;
        setDigitStyle(hundreds_digit, hundreds);
    }
}

function updatePipeTransform(pipe) {
    // Top pipe
    // top pipe height is 251.
    // y is gap center.
    // top pipe bottom edge should be at y - pipeGap/2
    // so top pipe top edge (translate Y) should be (y - pipeGap/2) - 251
    let topY = (pipe.y - pipeGap / 2) - 251;
    pipe.topPipe.style.transform = `translate(${pipe.x}px, ${topY}px)`;

    // Bottom pipe
    // bottom pipe top edge should be at y + pipeGap/2
    let bottomY = pipe.y + pipeGap / 2;
    pipe.bottomPipe.style.transform = `translate(${pipe.x}px, ${bottomY}px)`;
}

function updatePipes() {
    // Move pipes
    pipesData.forEach(pipe => {
        pipe.x -= scrollSpeed;
        // 如果pipe没有得分，且pipe的右边已经移动到小鸟的左侧，则得分 
        if (pipe.x + pipeWidth < 225 * 0.3 && !pipe.scored) {
            pipe.scored = true;
            gameData.score += gameData.score < 999 ? 1 : 0;
        }
        // 如果移出屏幕左侧，移动到最右侧
        if (pipe.x < -pipeWidth) {
            // 找到当前最右边的管道的 x 坐标
            let maxX = Math.max(...pipesData.map(p => p.x));
            pipe.x = maxX + pipeDistance;
            // 重新随机高度
            pipe.y = Math.floor(Math.random() * (300 - 100)) + 100;
            pipe.scored = false;
        }
        
        // 更新 DOM
        updatePipeTransform(pipe);
    });
}

function updateSmallScore(prefix, score) {
    const ones = document.getElementById(prefix + "_ones_digit");
    const tens = document.getElementById(prefix + "_tens_digit");
    const hundreds = document.getElementById(prefix + "_hundreds_digit");
    
    // Reset display
    ones.style.display = 'block';
    tens.style.display = 'none';
    hundreds.style.display = 'none';

    ones.style.backgroundPosition = smallScorePos[score % 10];

    if (score >= 10) {
        tens.style.display = 'block';
        tens.style.backgroundPosition = smallScorePos[Math.floor(score / 10) % 10];
    }

    if (score >= 100) {
        hundreds.style.display = 'block';
        hundreds.style.backgroundPosition = smallScorePos[Math.floor(score / 100) % 10];
    }
}

function GameLoop() {
    backgroundX += scrollSpeed;
    // 避免backgroundX过大
    if (backgroundX > 225) {
        backgroundX -= 225;
    }

    scene.style.backgroundPosition = `-${backgroundX}px 0px`;

    // 小鸟扇翅膀动画
    birdFrameTimer++;
    if (birdFrameTimer % birdWingRate === 0) { // 每10帧切换一次图片，数字越小越快
        birdFrameIndex = (birdFrameIndex + 1) % birdFrames.length;
        bird.style.backgroundPosition = birdFrames[birdFrameIndex];
        if (birdFrameTimer === birdWingRate) {
            birdFrameTimer = 0;
        }
    }
    
    // 重力加速度下降
    birdSpeedY += 0.1;
    birdPosY = birdPosY + birdSpeedY;
    bird.style.top = `${birdPosY}px`; 

    // 更新游戏分数
    updateGameScore();
    
    // 更新pipes的状态
    updatePipes();

    // 边界碰撞检测
    if (birdPosY < 0 || birdPosY + 22 > 400) {
        console.log("Hit Boundary");
        game_state = "ended";
    }
    else {
        // 管道碰撞检测
        // 小鸟水平位置：CSS中 left: 30%, transform: translateX(-50%)
        // 225 * 0.3 - 28/2 = 67.5 - 14 = 53.5
        const birdVisualLeft = 53.5;
        const birdLeft = birdVisualLeft;
        const birdRight = birdVisualLeft + 28;
        const birdTop = birdPosY;
        const birdBottom = birdPosY + 22;

        for (let pipe of pipesData) {
            // 检查水平碰撞
            if (pipe.x + pipeWidth > birdLeft && pipe.x < birdRight) {
                // 检查垂直碰撞
                // 上管道底部 y
                const topPipeBottom = pipe.y - pipeGap / 2;
                // 下管道顶部 y
                const bottomPipeTop = pipe.y + pipeGap / 2;

                if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
                    console.log("Hit Pipe!");
                    game_state = "ended";
                    break;
                }
            }
        }
    }

    if (game_state === "ended") {
        document.getElementById("scene_over").style.display = 'flex';
        document.getElementById("score").style.display = 'none';
        if (gameData.score > gameData.best) {
            gameData.best = gameData.score;
            document.getElementById("medal").style.backgroundPosition = '-188px -439px'; 
        }
        
        updateSmallScore("over_score", gameData.score);
        updateSmallScore("best_score", gameData.best);
        
        console.log("Game Over!");
        return;
    }

    requestAnimationFrame(GameLoop);
}
