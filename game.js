const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isGameOver = false;
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    color: 'blue',
    hp: 5
};

const enemy = {
    x: 100,
    y: 100,
    size: 10,
    color: 'red',
    speed: 7,
    hp: 30,
    stopTime: 0, 
    accelerateTime: 0,
    maxStopTime: 60, 
    maxAccelerateTime: 30, 
    isStopping: false ,
    isCharging: false,
    chargeSpeed: 10,
};
const bullets = [];
const bulletSpeed = 13;
const bulletSize = 5;
const TELEPORT_MARGIN = 20; 
const TELEPORT_DISTANCE = 30; // プレイヤーからの距離で瞬間移動をトリガーする

const teleportAndCharging = () => {
    // プレイヤーの近くに瞬間移動するぜ
    enemy.x = player.x;
    enemy.y = player.y;

    // 走るぜ
    enemy.isCharging = true;
    enemy.accelerateTime = enemy.maxAccelerateTime;
};

const updateEnemyPosition = () => {
    if (isGameOver) return;
    if (enemy.isStopping) {
        updateEnemyStop();
    } else {
        updateEnemyMove();
    }
    checkAndInitiateStopping();
    checkAndInitiateTeleportingAndCharging();
   
};
const checkAndInitiateTeleportingAndCharging = () => {
    const distance = calculateDistance(player.x - enemy.x, player.y - enemy.y);
    if (!enemy.isStopping && distance < TELEPORT_DISTANCE && !enemy.isCharging) {
        teleportAndCharging();
    }
}

const updateEnemyStop = () => {
    enemy.stopTime--;
    if (enemy.stopTime <= 0) {
        enemy.isStopping = false;
        enemy.accelerateTime = enemy.maxAccelerateTime;
    }
}

const updateEnemyMove = () => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = calculateDistance(dx, dy);
    let moveSpeed = calculateMoveSpeed(distance);

    enemy.x += moveSpeed * (dx / distance);
    enemy.y += moveSpeed * (dy / distance);
}

const calculateDistance = (dx, dy) => Math.sqrt(dx * dx + dy * dy);

const calculateMoveSpeed = (distance) => {
    let moveSpeed = enemy.speed;
    if (enemy.accelerateTime > 0) {
        const ACCELERATION_FACTOR = 3;
        moveSpeed *= ACCELERATION_FACTOR;
        enemy.accelerateTime--;
    }
    return distance > (enemy.size + player.size) ? moveSpeed : 0;
}

const checkAndInitiateStopping = () => {
    const STOP_CHANCE = 0.01;
    if (!enemy.isStopping && Math.random() < STOP_CHANCE) { 
        enemy.isStopping = true;
        enemy.stopTime = enemy.maxStopTime;
    }
}


const drawPlayer = () => {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.fillText(`プレイヤーのHP: ${player.hp}`, player.x - 20, player.y - 20);
}

const shootBullet = (x, y, targetX, targetY) => {
    const dx = targetX - x;
    const dy = targetY - y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 1e-2) return; 

    const velocityX = bulletSpeed * (dx / distance);
    const velocityY = bulletSpeed * (dy / distance);

    bullets.push({ x, y, velocityX, velocityY });
}

const updateBullets = () =>{
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;


        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }


        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bulletSize + enemy.size) {
            bullets.splice(index, 1);
            enemy.hp -= 1;
            
               if (!isGameOver && enemy.hp <= 0) {
                
                alert('あなたの勝ち！');
                enemy.hp = 0;
                isGameOver = true;
            }
        }
    });
}

const drawBullets =()=> {
    bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletSize, 0, Math.PI * 2);
        ctx.fill();
    });
}

const drawEnemy = ()=> {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.fillText(`敵のHP: ${enemy.hp}`, enemy.x - 20, enemy.y - 20);
}

canvas.addEventListener('mousemove', (e)=> {
    player.x = e.offsetX;
    player.y = e.offsetY;
});

canvas.addEventListener('click', (e) =>{
    shootBullet(player.x, player.y, enemy.x, enemy.y);
});

const getMousePos = (canvas, evt) => {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


const checkCollision = () => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + enemy.size) {
        player.hp -= 1;

 
        const knockback = 100;


        const knockbackX = dx / distance;
        const knockbackY = dy / distance;


        player.x += knockbackX * knockback;
        player.y += knockbackY * knockback;
        enemy.x -= knockbackX * knockback;
        enemy.y -= knockbackY * knockback;

        if (player.hp <= 0 && !isGameOver) {
            alert('あなたの負けです');
            isGameOver = true;
        }
    }
}



const update =()=> {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemy();
    updateEnemyPosition();
    updateBullets();
    drawBullets();
    checkCollision(); 
    requestAnimationFrame(update);
}

update();
