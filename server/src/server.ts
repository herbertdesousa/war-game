import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, { transports: ["websocket"] });

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
  constructor(public socketId: string) {}
  
  position = new Position(0, 1);

  move(direction: UserMoveDirection) {
    switch (direction) {
      case UserMoveDirection.UP:
        this.position.y -= 1;
        break;
      case UserMoveDirection.DOWN:
        this.position.y += 1;
        break;
      case UserMoveDirection.LEFT:
        this.position.x -= 1;  
        break;
      case UserMoveDirection.RIGHT:
        this.position.x += 1;  
        break;
    }
  }
}

class UserManager {
  private users: User[] = []

  addUser(user: User): User {
    this.users.push(user);

    return user;
  }

  findBySocketId(socketId: string): User | undefined {
    return this.users.find(user => user.socketId === socketId)
  }
}

const userManager = new UserManager();

io.on("connection", (client) => {
  const user = userManager.addUser(new User(client.id));

  client.emit('connected', { position: user.position });

  client.on('player:move', (direction: UserMoveDirection) => {
    const user = userManager.findBySocketId(client.id);

    if (!user) return;

    user.move(direction);

    client.emit('player:move', { position: user.position });
  });
});

httpServer.listen(3000, () => {
  console.log('server started');
});
