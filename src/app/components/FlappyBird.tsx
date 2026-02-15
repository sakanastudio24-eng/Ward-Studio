import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface FlappyBirdProps {
  onClose: () => void;
}

// FlappyBird: Runs a tap-to-fly canvas game for smaller viewports.
export function FlappyBird({ onClose }: FlappyBirdProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game constants
    const GRAVITY = 0.3;
    const JUMP = -7.5;
    const PIPE_WIDTH = 60;
    const PIPE_GAP = 150;
    const PIPE_SPEED = 3;

    // Bird
    let bird = {
      x: 80,
      y: canvas.height / 2,
      velocity: 0,
      radius: 15,
    };

    // Pipes
    let pipes: Array<{ x: number; topHeight: number }> = [];
    let frameCount = 0;
    let currentScore = 0;

    // addPipe: Spawns a new obstacle pair with a randomized gap position.
    const addPipe = () => {
      const minHeight = 50;
      const maxHeight = canvas.height - PIPE_GAP - minHeight;
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      pipes.push({ x: canvas.width, topHeight });
    };

    // reset: Restores initial game state for a fresh round.
    const reset = () => {
      bird = {
        x: 80,
        y: canvas.height / 2,
        velocity: 0,
        radius: 15,
      };
      pipes = [];
      frameCount = 0;
      currentScore = 0;
      setScore(0);
      setGameOver(false);
    };

    // handleJump: Starts gameplay, restarts after game over, or applies bird lift.
    const handleJump = () => {
      if (!gameStarted) {
        setGameStarted(true);
        return;
      }
      if (gameOver) {
        reset();
        return;
      }
      bird.velocity = JUMP;
    };

    // handleTouch: Converts touch interactions into jump actions.
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      handleJump();
    };

    // handleClick: Converts click interactions into jump actions.
    const handleClick = () => {
      handleJump();
    };

    canvas.addEventListener("touchstart", handleTouch);
    canvas.addEventListener("click", handleClick);

    // gameLoop: Updates game state and renders each animation frame.
    const gameLoop = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!gameStarted) {
        // Draw bird
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw instructions
        ctx.fillStyle = "#000000";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Tap to Start", canvas.width / 2, canvas.height / 2 - 50);

        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (!gameOver) {
        // Update bird
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;

        // Add pipes
        frameCount++;
        if (frameCount % 90 === 0) {
          addPipe();
        }

        // Update pipes
        pipes = pipes.filter((pipe) => {
          pipe.x -= PIPE_SPEED;
          return pipe.x > -PIPE_WIDTH;
        });

        // Check collisions
        if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
          setGameOver(true);
        }

        pipes.forEach((pipe) => {
          // Check if bird passed pipe (for scoring)
          if (pipe.x + PIPE_WIDTH === bird.x) {
            currentScore++;
            setScore(currentScore);
          }

          // Check collision with pipes
          if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + PIPE_WIDTH
          ) {
            if (
              bird.y - bird.radius < pipe.topHeight ||
              bird.y + bird.radius > pipe.topHeight + PIPE_GAP
            ) {
              setGameOver(true);
            }
          }
        });
      }

      // Draw pipes
      ctx.fillStyle = "#000000";
      pipes.forEach((pipe) => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(
          pipe.x,
          pipe.topHeight + PIPE_GAP,
          PIPE_WIDTH,
          canvas.height - pipe.topHeight - PIPE_GAP
        );
      });

      // Draw bird
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw score
      ctx.fillStyle = "#000000";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${currentScore}`, 10, 30);

      if (gameOver) {
        ctx.fillStyle = "#000000";
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "20px sans-serif";
        ctx.fillText("Tap to Restart", canvas.width / 2, canvas.height / 2 + 20);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      canvas.removeEventListener("touchstart", handleTouch);
      canvas.removeEventListener("click", handleClick);
    };
  }, [gameOver, gameStarted]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black/80 hover:text-black transition-colors z-10"
          aria-label="Close game"
        >
          <X className="size-7" />
        </button>
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="bg-background p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">Score: {score}</p>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={600}
            className="w-full touch-none"
          />
        </div>
      </div>
    </div>
  );
}
