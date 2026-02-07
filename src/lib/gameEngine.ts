import { GameState, Ball, Paddle, Block, Controls, GameConfig, Position } from '@/types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private controls: Controls;
  private config!: GameConfig;
  private animationId?: number;
  private lastTime = 0;
  private eventListeners: Array<{ element: Element | Document, event: string, handler: EventListener }> = [];
  private touchStartY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.updateConfig();

    this.controls = {
      leftPressed: false,
      rightPressed: false,
    };

    this.gameState = this.initializeGame();
    this.setupEventListeners();
  }

  private updateConfig() {
    this.config = {
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      ballSpeed: 6,
      paddleSpeed: 10,
      maxLives: 3,
    };
  }

  private initializeGame(): GameState {
    const ballRadius = 8;
    const paddleWidth = 100;
    const paddleHeight = 15;
    const paddleX = (this.config.canvasWidth - paddleWidth) / 2;
    const paddleY = this.config.canvasHeight - paddleHeight - 20;

    return {
      isRunning: false,
      isPaused: false,
      score: 0,
      lives: this.config.maxLives,
      level: 1,
      ball: {
        position: {
          x: this.config.canvasWidth / 2,
          y: paddleY - ballRadius - 5,
        },
        velocity: { x: 3, y: -3 },
        radius: ballRadius,
        color: '#ff6b6b',
      },
      paddle: {
        position: { x: paddleX, y: paddleY },
        width: paddleWidth,
        height: paddleHeight,
        speed: this.config.paddleSpeed,
        color: '#4ecdc4',
      },
      blocks: this.generateBlocks(1),
    };
  }

  private generateBlocks(level: number): Block[] {
    const blocks: Block[] = [];
    const blockWidth = 80;
    const blockHeight = 25;
    const padding = 5;
    const offsetTop = 60;
    const offsetLeft = 35;

    const rows = Math.min(3 + Math.floor(level / 2), 8);
    const cols = Math.floor((this.config.canvasWidth - 2 * offsetLeft) / (blockWidth + padding));

    const colors = [
      '#ff6b6b', '#feca57', '#48cae4', '#06ffa5',
      '#ff9ff3', '#f38ba8', '#a6e3a1', '#fab387'
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        blocks.push({
          position: {
            x: offsetLeft + c * (blockWidth + padding),
            y: offsetTop + r * (blockHeight + padding),
          },
          width: blockWidth,
          height: blockHeight,
          color: colors[r % colors.length],
          destroyed: false,
          points: (rows - r) * 10,
        });
      }
    }

    return blocks;
  }

  private setupEventListeners() {
    // Keyboard controls
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.controls.leftPressed = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.controls.rightPressed = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.gameState.isRunning) {
          this.start();
        } else if (this.gameState.isPaused) {
          this.resume();
        } else {
          this.pause();
        }
      }
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.controls.leftPressed = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.controls.rightPressed = false;
      }
    };

    // Touch controls with improved tracking
    const touchStartHandler = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      this.controls.touchX = (touch.clientX - rect.left) * scaleX;
      this.touchStartY = touch.clientY;

      if (!this.gameState.isRunning) {
        this.start();
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        this.controls.touchX = (touch.clientX - rect.left) * scaleX;
      }
    };

    const touchEndHandler = (e: TouchEvent) => {
      e.preventDefault();
      this.controls.touchX = undefined;
    };

    // Mouse controls with improved scaling
    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      this.controls.touchX = (e.clientX - rect.left) * scaleX;
    };

    const clickHandler = () => {
      if (!this.gameState.isRunning) {
        this.start();
      }
    };

    // Add event listeners and store references for cleanup
    this.addEventListenerWithTracking(document, 'keydown', keyDownHandler as EventListener);
    this.addEventListenerWithTracking(document, 'keyup', keyUpHandler as EventListener);
    this.addEventListenerWithTracking(this.canvas, 'touchstart', touchStartHandler as EventListener);
    this.addEventListenerWithTracking(this.canvas, 'touchmove', touchMoveHandler as EventListener);
    this.addEventListenerWithTracking(this.canvas, 'touchend', touchEndHandler as EventListener);
    this.addEventListenerWithTracking(this.canvas, 'mousemove', mouseMoveHandler as EventListener);
    this.addEventListenerWithTracking(this.canvas, 'click', clickHandler as EventListener);
  }

  private addEventListenerWithTracking(element: Element | Document, event: string, handler: EventListener) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  private update(deltaTime: number) {
    if (!this.gameState.isRunning || this.gameState.isPaused) return;

    this.updatePaddle();
    this.updateBall();
    this.checkCollisions();
    this.checkGameOver();
    this.checkLevelComplete();
  }

  private updatePaddle() {
    const paddle = this.gameState.paddle;

    if (this.controls.touchX !== undefined) {
      // Touch/mouse control
      paddle.position.x = this.controls.touchX - paddle.width / 2;
    } else {
      // Keyboard control
      if (this.controls.leftPressed) {
        paddle.position.x -= paddle.speed;
      }
      if (this.controls.rightPressed) {
        paddle.position.x += paddle.speed;
      }
    }

    // Keep paddle within bounds
    paddle.position.x = Math.max(0, Math.min(this.config.canvasWidth - paddle.width, paddle.position.x));
  }

  private updateBall() {
    const ball = this.gameState.ball;

    ball.position.x += ball.velocity.x;
    ball.position.y += ball.velocity.y;

    // Wall collisions
    if (ball.position.x <= ball.radius || ball.position.x >= this.config.canvasWidth - ball.radius) {
      ball.velocity.x = -ball.velocity.x;
      ball.position.x = Math.max(ball.radius, Math.min(this.config.canvasWidth - ball.radius, ball.position.x));
    }

    if (ball.position.y <= ball.radius) {
      ball.velocity.y = -ball.velocity.y;
      ball.position.y = ball.radius;
    }

    // Bottom boundary (lose life)
    if (ball.position.y >= this.config.canvasHeight + ball.radius) {
      this.loseLife();
    }
  }

  private checkCollisions() {
    const ball = this.gameState.ball;
    const paddle = this.gameState.paddle;

    // Paddle collision with improved positioning
    if (this.isColliding(ball, paddle) && ball.velocity.y > 0) {
      ball.velocity.y = -Math.abs(ball.velocity.y);

      // Add angle based on where ball hits paddle
      const paddleCenter = paddle.position.x + paddle.width / 2;
      const hitPos = Math.max(-1, Math.min(1, (ball.position.x - paddleCenter) / (paddle.width / 2)));
      ball.velocity.x = hitPos * 5;

      // Normalize speed
      const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
      const targetSpeed = this.config.ballSpeed;
      ball.velocity.x = (ball.velocity.x / speed) * targetSpeed;
      ball.velocity.y = (ball.velocity.y / speed) * targetSpeed;

      // Ensure ball is above paddle
      ball.position.y = paddle.position.y - ball.radius - 2;
    }

    // Block collisions with improved reflection
    for (let i = 0; i < this.gameState.blocks.length; i++) {
      const block = this.gameState.blocks[i];
      if (!block.destroyed && this.isColliding(ball, block)) {
        block.destroyed = true;
        this.gameState.score += block.points;

        // Improved collision detection
        const ballPrevX = ball.position.x - ball.velocity.x;
        const ballPrevY = ball.position.y - ball.velocity.y;

        const blockLeft = block.position.x;
        const blockRight = block.position.x + block.width;
        const blockTop = block.position.y;
        const blockBottom = block.position.y + block.height;

        // Determine which side was hit based on previous position
        const fromLeft = ballPrevX < blockLeft;
        const fromRight = ballPrevX > blockRight;
        const fromTop = ballPrevY < blockTop;
        const fromBottom = ballPrevY > blockBottom;

        if (fromLeft || fromRight) {
          ball.velocity.x = -ball.velocity.x;
          ball.position.x = fromLeft ? blockLeft - ball.radius : blockRight + ball.radius;
        } else if (fromTop || fromBottom) {
          ball.velocity.y = -ball.velocity.y;
          ball.position.y = fromTop ? blockTop - ball.radius : blockBottom + ball.radius;
        } else {
          // Corner collision - bounce both directions
          ball.velocity.x = -ball.velocity.x;
          ball.velocity.y = -ball.velocity.y;
        }

        break; // Only handle one collision per frame
      }
    }
  }

  private isColliding(ball: Ball, rect: { position: Position; width: number; height: number }): boolean {
    const distX = Math.abs(ball.position.x - rect.position.x - rect.width / 2);
    const distY = Math.abs(ball.position.y - rect.position.y - rect.height / 2);

    if (distX > (rect.width / 2 + ball.radius)) return false;
    if (distY > (rect.height / 2 + ball.radius)) return false;

    if (distX <= (rect.width / 2)) return true;
    if (distY <= (rect.height / 2)) return true;

    const dx = distX - rect.width / 2;
    const dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (ball.radius * ball.radius));
  }

  private loseLife() {
    this.gameState.lives--;
    if (this.gameState.lives > 0) {
      this.resetBall();
    } else {
      this.gameOver();
    }
  }

  private resetBall() {
    const paddleX = this.gameState.paddle.position.x;
    const paddleY = this.gameState.paddle.position.y;

    this.gameState.ball.position = {
      x: paddleX + this.gameState.paddle.width / 2,
      y: paddleY - this.gameState.ball.radius - 5,
    };
    this.gameState.ball.velocity = { x: 3, y: -3 };
  }

  private checkGameOver() {
    if (this.gameState.lives <= 0) {
      this.gameOver();
    }
  }

  private checkLevelComplete() {
    const remainingBlocks = this.gameState.blocks.filter(block => !block.destroyed);
    if (remainingBlocks.length === 0) {
      this.nextLevel();
    }
  }

  private nextLevel() {
    this.gameState.level++;
    this.gameState.blocks = this.generateBlocks(this.gameState.level);
    this.resetBall();

    // Increase ball speed slightly
    const speedIncrease = 0.2;
    const currentSpeed = Math.sqrt(this.gameState.ball.velocity.x ** 2 + this.gameState.ball.velocity.y ** 2);
    const newSpeed = currentSpeed + speedIncrease;
    const normalizedVel = {
      x: (this.gameState.ball.velocity.x / currentSpeed) * newSpeed,
      y: (this.gameState.ball.velocity.y / currentSpeed) * newSpeed,
    };
    this.gameState.ball.velocity = normalizedVel;
  }

  private gameOver() {
    this.gameState.isRunning = false;
  }

  private render() {
    // Clear canvas with subtle background
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Draw blocks with Apple design
    this.gameState.blocks.forEach(block => {
      if (!block.destroyed) {
        this.drawAppleBlock(block);
      }
    });

    // Draw paddle with Apple design
    this.drawApplePaddle(this.gameState.paddle);

    // Draw ball with Apple design
    this.drawAppleBall(this.gameState.ball);

    // Draw UI
    this.drawUI();
  }

  private drawAppleBlock(block: Block) {
    const ctx = this.ctx;
    const cornerRadius = 8;

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Main block with gradient
    const gradient = ctx.createLinearGradient(
      block.position.x,
      block.position.y,
      block.position.x,
      block.position.y + block.height
    );

    // Apple-inspired color palette
    const appleColors = {
      '#ff6b6b': { start: '#ff6b6b', end: '#ee5a24' },
      '#feca57': { start: '#feca57', end: '#ff9f43' },
      '#48cae4': { start: '#48cae4', end: '#0077b6' },
      '#06ffa5': { start: '#06ffa5', end: '#00d4aa' },
      '#ff9ff3': { start: '#ff9ff3', end: '#f368e0' },
      '#f38ba8': { start: '#f38ba8', end: '#e55381' },
      '#a6e3a1': { start: '#a6e3a1', end: '#74c69d' },
      '#fab387': { start: '#fab387', end: '#f79256' }
    };

    const colorMap = appleColors[block.color as keyof typeof appleColors] ||
                     { start: block.color, end: block.color };

    gradient.addColorStop(0, colorMap.start);
    gradient.addColorStop(1, colorMap.end);
    ctx.fillStyle = gradient;

    // Draw rounded rectangle
    this.drawRoundedRect(
      block.position.x,
      block.position.y,
      block.width,
      block.height,
      cornerRadius
    );

    ctx.restore();

    // Subtle inner highlight
    ctx.save();
    const highlightGradient = ctx.createLinearGradient(
      block.position.x,
      block.position.y,
      block.position.x,
      block.position.y + block.height / 2
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    this.drawRoundedRect(
      block.position.x,
      block.position.y,
      block.width,
      block.height / 2,
      cornerRadius
    );
    ctx.restore();
  }

  private drawApplePaddle(paddle: Paddle) {
    const ctx = this.ctx;
    const cornerRadius = 12;

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Gradient from Apple's design language
    const gradient = ctx.createLinearGradient(
      paddle.position.x,
      paddle.position.y,
      paddle.position.x,
      paddle.position.y + paddle.height
    );
    gradient.addColorStop(0, '#007AFF');
    gradient.addColorStop(1, '#0056CC');

    ctx.fillStyle = gradient;
    this.drawRoundedRect(
      paddle.position.x,
      paddle.position.y,
      paddle.width,
      paddle.height,
      cornerRadius
    );

    ctx.restore();

    // Inner highlight
    ctx.save();
    const highlightGradient = ctx.createLinearGradient(
      paddle.position.x,
      paddle.position.y,
      paddle.position.x,
      paddle.position.y + paddle.height / 2
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    this.drawRoundedRect(
      paddle.position.x,
      paddle.position.y,
      paddle.width,
      paddle.height / 2,
      cornerRadius
    );
    ctx.restore();
  }

  private drawAppleBall(ball: Ball) {
    const ctx = this.ctx;

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    // Radial gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      ball.position.x - ball.radius / 3,
      ball.position.y - ball.radius / 3,
      0,
      ball.position.x,
      ball.position.y,
      ball.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#f0f0f0');
    gradient.addColorStop(1, '#d0d0d0');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Subtle rim
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius - 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawUI() {
    const ctx = this.ctx;

    // Apple-style UI cards
    ctx.save();

    // Score card
    this.drawUICard(10, 10, 80, 35, `${this.gameState.score}`, 'Score');

    // Lives card
    this.drawUICard(10, 55, 80, 35, `${this.gameState.lives}`, 'Lives');

    // Level card
    this.drawUICard(this.config.canvasWidth - 90, 10, 80, 35, `${this.gameState.level}`, 'Level');

    ctx.restore();

    // Game states with Apple-style overlays
    if (!this.gameState.isRunning && this.gameState.lives > 0) {
      this.drawAppleOverlay(
        'Ready to Play?',
        'Tap to start • Move with touch or keys',
        '#007AFF'
      );
    }

    if (this.gameState.lives <= 0) {
      this.drawAppleOverlay(
        'Game Over',
        `Final Score: ${this.gameState.score}`,
        '#FF3B30'
      );
    }

    if (this.gameState.isPaused) {
      this.drawAppleOverlay(
        'Paused',
        'Tap to continue',
        '#8E8E93'
      );
    }
  }

  private drawUICard(x: number, y: number, width: number, height: number, value: string, label: string) {
    const ctx = this.ctx;

    // Card background with blur effect (simplified)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.drawRoundedRect(x, y, width, height, 8);

    ctx.restore();

    // Value text
    ctx.fillStyle = '#1D1D1F';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(value, x + width / 2, y + height / 2);

    // Label text
    ctx.fillStyle = '#8E8E93';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui';
    ctx.fillText(label, x + width / 2, y + height - 5);

    ctx.textAlign = 'left';
  }

  private drawAppleOverlay(title: string, subtitle: string, accentColor: string) {
    const ctx = this.ctx;
    const centerX = this.config.canvasWidth / 2;
    const centerY = this.config.canvasHeight / 2;

    // Backdrop blur effect (simplified)
    ctx.save();
    ctx.fillStyle = 'rgba(248, 249, 250, 0.95)';
    ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Main card
    const cardWidth = Math.min(300, this.config.canvasWidth - 40);
    const cardHeight = 120;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = '#ffffff';
    this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 16);

    ctx.restore();

    // Title
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, centerY - 10);

    // Subtitle
    ctx.fillStyle = '#8E8E93';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui';
    ctx.fillText(subtitle, centerX, centerY + 20);

    ctx.textAlign = 'left';
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (!this.gameState.isRunning) {
      this.gameState.isRunning = true;
      this.gameState.isPaused = false;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  public pause() {
    this.gameState.isPaused = true;
  }

  public resume() {
    this.gameState.isPaused = false;
  }

  public reset() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.gameState = this.initializeGame();
    this.render();
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public updateCanvasSize() {
    this.updateConfig();

    // Update paddle and ball positions to stay within new bounds
    if (this.gameState.paddle) {
      this.gameState.paddle.position.x = Math.min(
        this.gameState.paddle.position.x,
        this.config.canvasWidth - this.gameState.paddle.width
      );
    }

    if (this.gameState.ball) {
      this.gameState.ball.position.x = Math.max(
        this.gameState.ball.radius,
        Math.min(this.config.canvasWidth - this.gameState.ball.radius, this.gameState.ball.position.x)
      );
    }

    // Re-generate blocks for new canvas size
    if (this.gameState.level) {
      this.gameState.blocks = this.generateBlocks(this.gameState.level);
    }
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}