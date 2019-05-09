var blessed = require('blessed');

const STARTING_SNAKE_LENGTH = 10

const DIRECTIONS = {
  up: {
    x: 0,
    y: -1
  },
  down: {
    x: 0,
    y: 1
  },
  left: {
    x: -1,
    y: 0
  },
  right: {
    x: 1,
    y: 0
  }
}

class SnakeGame {

  constructor () {

    this.currentDirection = DIRECTIONS.right
    this.screen = this.initScreen()
    this.gameView = this.initGameView()
    this.snake = this.initSnake()
    this.food = this.initFood()
    this.score = 0
    this.isGameOver = false
  }

  initScreen () {

    const screen = blessed.screen({
      title: `Snake`
    })

    screen.key([`up`, `down`, `left`, `right`], (ch, key) => {

      const proposedDirection = DIRECTIONS[key.name]

      if (this.snake.length > 1 &&
          this.snake[0].left + proposedDirection.x === this.snake[1].left &&
          this.snake[0].top + proposedDirection.y === this.snake[1].top) {

        return
      }

      this.currentDirection = proposedDirection
    })

    screen.key([`enter`], (ch, key) => {

      if (this.isGameOver) {

        this.currentDirection = DIRECTIONS.right
        this.snake = this.initSnake()
        this.food = this.initFood()
        this.score = 0
        this.isGameOver = false
      }
    })
    
    screen.key([`escape`, `q`, `C-c`], (ch, key) => {
    
      process.exit(0)
    })

    return screen
  }

  initGameView () {

    return blessed.box({
      parent: this.screen,
      width: `100%`,
      height: `100%`,
      top: `2%`,
      left: `0%`
    })
  }

  initSnake () {

    this.snake = [
      {
        top: Math.floor(this.gameView.height / 4),
        left: Math.floor(this.gameView.width / 4)
      }
    ]

    for (let i = 0; i < STARTING_SNAKE_LENGTH; i++) {

      this.addSegment()
    }
  
    return this.snake
  }

  initFood () {
    
    return {
      top: Math.floor(Math.random() * Math.floor(this.gameView.height) - 1) + 1,
      left: Math.floor(Math.random() * Math.floor(this.gameView.width) - 1) + 1,
    }
  }

  addSegment () {

    const tail = this.snake[this.snake.length - 1]

    this.snake.push({
      top: tail.top - this.currentDirection.y,
      left: tail.left - this.currentDirection.x
    })
  }

  moveSnake () {

    const head = {
      left: this.snake[0].left + this.currentDirection.x,
      top: this.snake[0].top + this.currentDirection.y
    }

    // the 1's being subtracted here here represent width/height
    if (head.left > this.gameView.width - 1) {

      head.left = 0
    }

    if (head.left < 0) {

      head.left = this.gameView.width - 1
    }

    if (head.top > this.gameView.height - 1) {

      head.top = 0
    }

    if (head.top < 0) {

      head.top = this.gameView.height - 1
    }


    if (this.snake.some(segment => segment.top === this.food.top && segment.left === this.food.left)) {

      this.score++
      this.food = this.initFood()
    } else {

      this.snake.pop()
    }

    if (this.snake.some(segment => segment.top === head.top && segment.left === head.left)) {

      this.isGameOver = true
    }

    this.snake.unshift(head)
  }

  clear () {

    this.gameView.detach()
    this.gameView = this.initGameView()
  }

  update () {

    if (!this.isGameOver) {

      this.moveSnake()
    }
  }

  draw () {

    // draw snake
    for (const segment of this.snake) {

      blessed.box({
        parent: this.gameView,
        width: 1,
        height: 1,
        top: segment.top,
        left: segment.left,
        style: {
          bg: `green`
        }
      })
    }

    blessed.box({
      parent: this.gameView,
      width: 1,
      height: 1,
      top: this.food.top,
      left: this.food.left,
      style: {
        bg: `white`
      }
    })

    blessed.box({
      parent: this.screen,
      width: `100%`,
      height: `2%`,
      top: `0%`,
      left: `0%`,
      content: `Score ${this.score}`,
      style: {
        bg: `white`,
        fg: `black`
      }
    })

    if (this.isGameOver) {

      blessed.box({
        parent: this.gameView,
        width: Math.floor(this.gameView.width / 2),
        height: Math.floor(this.gameView.height / 2),
        top: Math.floor(this.gameView.height / 4),
        left: Math.floor(this.gameView.width / 4),
        content: `Game over, press enter to try again!`,
        style: {
          bg: `white`,
          fg: `black`
        }
      })
    }

    this.screen.render()
  }

  run () {

    setInterval(() => {
      
      this.clear()
      this.update()
      this.draw()
    }, 50);
  }
}

const snakeGame = new SnakeGame()

snakeGame.run()