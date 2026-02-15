import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface DinoGameProps {
  onClose: () => void;
}

// DinoGame: Runs a canvas-based endless runner experience for desktop users.
export function DinoGame({ onClose }: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef({
    zechY: 200,
    zechVelocity: 0,
    obstacles: [] as { x: number; width: number; height: number }[],
    score: 0,
    gameSpeed: 3,
    isJumping: false,
    obstacleTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fix blurry canvas on high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const GRAVITY = 0.3;
    const JUMP_STRENGTH = -8;
    const GROUND_Y = 300;
    const ZECH_X = 100;
    const ZECH_HEIGHT = 30;

    let animationId: number;
    let lastTime = 0;

    // handleKeyPress: Handles keyboard jump and restart input.
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
      if (e.code === "KeyR" && gameOver) {
        resetGame();
      }
    };

    // handleClick: Handles click input for jump or restart actions.
    const handleClick = () => {
      if (gameOver) {
        resetGame();
      } else {
        jump();
      }
    };

    // jump: Applies jump velocity when the player is grounded.
    const jump = () => {
      const state = gameStateRef.current;
      if (state.zechY >= GROUND_Y - ZECH_HEIGHT - 5) {
        state.zechVelocity = JUMP_STRENGTH;
        state.isJumping = true;
      }
    };

    // resetGame: Restores initial game state for a new run.
    const resetGame = () => {
      gameStateRef.current = {
        zechY: GROUND_Y - ZECH_HEIGHT,
        zechVelocity: 0,
        obstacles: [],
        score: 0,
        gameSpeed: 3,
        isJumping: false,
        obstacleTimer: 0,
      };
      setScore(0);
      setGameOver(false);
    };

    // spawnObstacle: Creates a random obstacle entering from the right.
    const spawnObstacle = () => {
      const state = gameStateRef.current;
      const width = 20 + Math.random() * 30;
      const height = 40 + Math.random() * 40;
      state.obstacles.push({
        x: canvas.width,
        width,
        height,
      });
    };

    // checkCollision: Detects collisions between the player and obstacles.
    const checkCollision = () => {
      const state = gameStateRef.current;
      const zechWidth = 80;

      for (const obstacle of state.obstacles) {
        if (
          ZECH_X < obstacle.x + obstacle.width &&
          ZECH_X + zechWidth > obstacle.x &&
          state.zechY < GROUND_Y &&
          state.zechY + ZECH_HEIGHT > GROUND_Y - obstacle.height
        ) {
          return true;
        }
      }
      return false;
    };

    // update: Advances physics, obstacle positions, score, and fail state.
    const update = (deltaTime: number) => {
      if (gameOver) return;

      const state = gameStateRef.current;

      // Update ZECH position
      state.zechVelocity += GRAVITY;
      state.zechY += state.zechVelocity;

      if (state.zechY > GROUND_Y - ZECH_HEIGHT) {
        state.zechY = GROUND_Y - ZECH_HEIGHT;
        state.zechVelocity = 0;
        state.isJumping = false;
      }

      // Update obstacles
      state.obstacleTimer += deltaTime;
      if (state.obstacleTimer > 1800 - Math.min(state.score * 2, 600)) {
        spawnObstacle();
        state.obstacleTimer = 0;
      }

      state.obstacles = state.obstacles.filter((obstacle) => {
        obstacle.x -= state.gameSpeed;
        return obstacle.x + obstacle.width > 0;
      });

      // Update score
      state.score += deltaTime * 0.01;
      setScore(Math.floor(state.score));

      // Increase speed over time (slower progression)
      state.gameSpeed = 3 + state.score * 0.002;

      // Check collision
      if (checkCollision()) {
        setGameOver(true);
      }
    };

    // draw: Paints the current game frame to the canvas.
    const draw = () => {
      if (!ctx || !canvas) return;

      const state = gameStateRef.current;
      const displayWidth = 800;
      const displayHeight = 400;

      // Clear canvas - light theme
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Draw ground
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(displayWidth, GROUND_Y);
      ctx.stroke();

      // Draw ZECH
      ctx.fillStyle = "#000000";
      ctx.font = "bold 32px monospace";
      ctx.fillText("ZECH", ZECH_X, state.zechY + 25);

      // Draw obstacles
      ctx.fillStyle = "#000000";
      state.obstacles.forEach((obstacle) => {
        ctx.fillRect(
          obstacle.x,
          GROUND_Y - obstacle.height,
          obstacle.width,
          obstacle.height
        );
      });

      // Draw score
      ctx.fillStyle = "#cccccc";
      ctx.font = "20px monospace";
      ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 20, 30);

      // Draw game over
      if (gameOver) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 48px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", displayWidth / 2, displayHeight / 2 - 40);
        ctx.font = "24px monospace";
        ctx.fillText(
          `SCORE: ${Math.floor(state.score)}`,
          displayWidth / 2,
          displayHeight / 2 + 10
        );
        ctx.font = "20px monospace";
        ctx.fillText(
          "PRESS SPACE OR CLICK TO RESTART",
          displayWidth / 2,
          displayHeight / 2 + 60
        );
        ctx.textAlign = "left";
      }
    };

    // gameLoop: Drives frame-by-frame updates and rendering.
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      update(deltaTime);
      draw();

      animationId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyPress);
    canvas.addEventListener("click", handleClick);

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 text-black hover:bg-black/10"
      >
        <X className="size-6" />
      </Button>

      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">ZECH RUNNER</h2>
          <p className="text-black/60">Press SPACE or click to jump</p>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full max-w-[800px] h-auto border-2 border-black/20 rounded-lg bg-white"
        />

        <div className="text-center">
          <p className="text-2xl font-bold text-black">
            Score: {score}
          </p>
          {gameOver && (
            <p className="text-black/60 mt-2">Press SPACE or click to restart</p>
          )}
        </div>
      </div>
    </div>
  );
}
