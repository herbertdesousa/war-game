import chalk from "chalk";
import { io } from 'socket.io-client';
import Readline from "readline";

Readline.createInterface({
  input: process.stdin,
  terminal: true,
  historySize: 0,
});

process.stdin.setEncoding("utf8");

const SCREEN_PIXELS_X = 12;
const SCREEN_PIXELS_Y = 12;
const PIXEL = "  ";

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

interface ConnectedReq {
  position: Position;
}

socket.on('connected', ({ position }: ConnectedReq) => {
  user.position = position;
});

socket.on('player:join', () => {

});

socket.on('player:move', ({ position }: ConnectedReq) => {
  user.position = position;
  render();
});

class Position {
  constructor(public x: number, public y: number) {}
}

enum UserMoveDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
}

class User {
  position = new Position(0, 1);

  move(direction: UserMoveDirection) {
    socket.emit('player:move', direction);
  }
}

const user = new User();

process.stdin.on("keypress", (_, key) => {
  const moves = {
    right: UserMoveDirection.RIGHT,
    left: UserMoveDirection.LEFT,
    up: UserMoveDirection.UP,
    down: UserMoveDirection.DOWN,
  }

  const movement = (moves as any)[key]

  if (movement) {
    user.move(movement)
  }
});

function render() {
  console.clear();

  for (let y = 0; y < SCREEN_PIXELS_X; y++) {
    const row = [];

    for (let x = 0; x < SCREEN_PIXELS_Y; x++) {
      const isRowEven = y % 2 === 0;
      const isColumnEven = x % 2 === 0;
      const isEven =
        (isRowEven && isColumnEven) || (!isRowEven && !isColumnEven);

      row.push(isEven ? chalk.bgGreen(PIXEL) : chalk.bgGreenBright(PIXEL));

      if (user.position.x === x && user.position.y === y) {
        row[x] = chalk.bgRed(PIXEL);
      }
    }

    console.log('    ' + row.join(""));
  }
}

render();
