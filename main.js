import './style.css'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const $sprite = document.querySelector('#sprite')
const $bricks = document.querySelector('#bricks')

canvas.width = 448
canvas.height = 400

const ballRadius = 4

let x = canvas.width / 2
let y = canvas.height - 30

let dx = 2
let dy = -2

const paddleHeight = 10
const paddleWidth = 50

let paddleX = (canvas.width - paddleWidth) / 2
let paddleY = canvas.height - paddleHeight - 10

let rightPressed = false
let leftPressed = false

let isGameOver = false
let isFalling = false
let fallSpeed = 2

const brickRowCount = 6
const brickColumnCount = 12
const brickWidth = 30   
const brickHeight = 14
const brickPadding = 2
const brickOffsetTop = 80
const brickOffsetLeft = 34
const bricks = []

const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = []
    for (let r = 0; r < brickRowCount; r++) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop
        const random = Math.floor(Math.random() * 8)
        bricks[c][r] = { 
            x: brickX, 
            y: brickY, 
            status: BRICK_STATUS.ACTIVE,
            color: random,
            fallY: brickY
        }
    }
}

const PADDLE_SENSITIVITY = 8

function drawBall() {
    ctx.beginPath()
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath()
}

function drawPaddle() {
    ctx.drawImage(
        $sprite, 
        29, 
        174, 
        paddleWidth, 
        paddleHeight, 
        paddleX, 
        paddleY, 
        paddleWidth, 
        paddleHeight
    )
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue
            
            ctx.drawImage(
                $bricks, 
                currentBrick.color * 32, 0, 32, 16, 
                currentBrick.x, 
                currentBrick.fallY, 
                brickWidth, 
                brickHeight)
        }
    }
}

function drawGameOver() {
    ctx.fillStyle = 'yellow'
    ctx.font = 'bold 30px Arial'
    ctx.fillText('Game Over', canvas.width / 2 - ctx.measureText('Game Over').width / 2, canvas.height / 2)
    
    ctx.font = 'bold 20px Arial'
    ctx.fillText('Press "R" to restart', canvas.width / 2 - ctx.measureText('Press "R" to restart').width / 2, canvas.height / 2 + 30)
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue

            const isBallTouchingBrick = 
                x > currentBrick.x && 
                x < currentBrick.x + brickWidth && 
                y > currentBrick.y && 
                y < currentBrick.y + brickHeight

            if (isBallTouchingBrick) {
                dy = -dy
                currentBrick.status = BRICK_STATUS.DESTROYED
            }
        }
    }
}

function ballMovement() {
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx
    }

    if (y + dy < ballRadius) {
        dy = -dy
    } 

    const isBallSameXAsPaddle = 
        x > paddleX && 
        x < paddleX + paddleWidth

    const isBallTouchingPaddle =
        y + dy > paddleY

    if ( isBallSameXAsPaddle && isBallTouchingPaddle ) {
        dy = -dy
    } else if (
        y + dy > canvas.height - ballRadius ||
        y + dy > paddleY + paddleHeight       
    ) {
        isFalling = true
    }

    x += dx
    y += dy

}

function paddleMovement() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += PADDLE_SENSITIVITY
    } else if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_SENSITIVITY
    }
}

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    function keyDownHandler(e) {
        const { key } = e
        if (key === 'Right' || key === 'ArrowRight' || key === 'd' || key === 'D') {
            rightPressed = true
        } else if (key === 'Left' || key === 'ArrowLeft' || key === 'a' || key === 'A') {
            leftPressed = true
        } else if (key === 'r' || key === 'R') {
            if (isGameOver) {
                document.location.reload()
            }
        }
    }

    function keyUpHandler(e) {
        const { key } = e
        if (key === 'Right' || key === 'ArrowRight' || key === 'd' || key === 'D') {
            rightPressed = false
        } else if (key === 'Left' || key === 'ArrowLeft' || key === 'a' || key === 'A') {
            leftPressed = false
        }
    }
}

function makeBricksFall() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue

            currentBrick.fallY += fallSpeed
        }
    }

    setTimeout(() => {
        isGameOver = bricks[0][brickRowCount - 1].fallY > canvas.height
    }, 3000)
}

function draw() {
    cleanCanvas()

    if (isFalling) {
        makeBricksFall()
    }

    if (isGameOver) {
        drawGameOver()
        return
    }

    drawBall()
    drawPaddle()
    drawBricks()

    collisionDetection()
    ballMovement()
    paddleMovement()

    window.requestAnimationFrame(draw)
}

draw()
initEvents()

