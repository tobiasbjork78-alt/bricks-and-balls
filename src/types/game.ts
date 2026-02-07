export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Ball {
  position: Position;
  velocity: Velocity;
  radius: number;
  color: string;
}

export interface Paddle {
  position: Position;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export interface Block {
  position: Position;
  width: number;
  height: number;
  color: string;
  destroyed: boolean;
  points: number;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  lives: number;
  level: number;
  ball: Ball;
  paddle: Paddle;
  blocks: Block[];
}

export interface Controls {
  leftPressed: boolean;
  rightPressed: boolean;
  touchX?: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  ballSpeed: number;
  paddleSpeed: number;
  maxLives: number;
}