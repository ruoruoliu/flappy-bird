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
        const home = document.getElementById('home');
        home.style.backgroundImage = `url(${canvas.toDataURL()})`;
        home.style.backgroundRepeat = 'no-repeat';
    };
})();

function scaleHome() {
    const home = document.getElementById('home');
    // 计算缩放比例：让游戏画面高度始终填满屏幕高度
    const scale = window.innerHeight / 400;
    
    // 应用缩放
    home.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleHome);
// 初始化时也执行一次
scaleHome();

document.getElementById("start_button").addEventListener('click', function(){
    // 隐藏首页场景
    document.getElementById("scene_home").style.display = 'none';
    // 显示游戏场景
    document.getElementById("scene_game").style.display = 'flex';
});
