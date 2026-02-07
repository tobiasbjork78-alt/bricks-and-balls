'use client';

import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { GameState } from '@/types/game';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Calculate responsive canvas size
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 800);
      const maxHeight = Math.min(window.innerHeight - 200, 600);
      const aspectRatio = 4 / 3;

      let width = maxWidth;
      let height = maxWidth / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }

      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (gameEngineRef.current) {
      // Update existing game engine with new canvas size
      gameEngineRef.current.updateCanvasSize();
    } else {
      // Create new game engine
      gameEngineRef.current = new GameEngine(canvas);
    }

    // Update game state periodically
    const interval = setInterval(() => {
      if (gameEngineRef.current) {
        setGameState(gameEngineRef.current.getGameState());
      }
    }, 60); // Faster updates for smoother UI

    return () => {
      clearInterval(interval);
    };
  }, [canvasSize]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  const handleReset = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      setGameState(gameEngineRef.current.getGameState());
    }
  };

  const handleStart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
    }
  };

  const handlePause = () => {
    if (gameEngineRef.current) {
      if (gameState?.isPaused) {
        gameEngineRef.current.resume();
      } else {
        gameEngineRef.current.pause();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-surface p-4">
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-4xl md:text-7xl font-bold text-text-primary mb-3 tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Bricks & Balls
        </h1>
        <p className="text-text-secondary text-xl font-medium tracking-wide">
          A beautiful breakout experience
        </p>
        <div className="mt-4 w-24 h-1 bg-gradient-primary rounded-full mx-auto animate-pulse-glow"></div>
      </div>

      <div className="game-container mb-8 animate-bounce-in">
        <div className="relative group">
          <canvas
            ref={canvasRef}
            className="game-canvas transition-all duration-300 ease-in-out"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              maxWidth: '100%',
            }}
          />
          {/* Game Status Overlay */}
          {gameState && !gameState.isRunning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="surface-primary rounded-2xl p-6 text-center border border-game-border shadow-game animate-bounce-in">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {gameState.lives === 0 ? 'Game Over!' : 'Ready to Play?'}
                </h3>
                <p className="text-text-secondary text-sm">
                  {gameState.lives === 0 ? 'Click Reset to try again' : 'Click Start to begin'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in-up">
        <button
          onClick={handleStart}
          className="btn-game inline-flex items-center px-8 py-4 bg-gradient-primary text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-game hover:shadow-game-strong transform hover:-translate-y-1"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start Game
        </button>

        {gameState?.isRunning && (
          <button
            onClick={handlePause}
            className="btn-game inline-flex items-center px-8 py-4 bg-gradient-accent text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-game hover:shadow-game-strong transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {gameState?.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}

        <button
          onClick={handleReset}
          className="btn-game inline-flex items-center px-8 py-4 bg-gradient-secondary text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-game hover:shadow-game-strong transform hover:-translate-y-1"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-2xl mb-8 animate-fade-in-up">
        <div className="stat-card surface-primary rounded-2xl p-6 shadow-soft">
          <div className="text-text-secondary text-sm font-semibold mb-2 uppercase tracking-wide">Score</div>
          <div className="text-3xl font-bold text-text-primary">{gameState?.score || 0}</div>
          <div className="mt-2 w-8 h-1 bg-gradient-primary rounded-full mx-auto"></div>
        </div>
        <div className="stat-card surface-primary rounded-2xl p-6 shadow-soft">
          <div className="text-text-secondary text-sm font-semibold mb-2 uppercase tracking-wide">Lives</div>
          <div className="text-3xl font-bold text-text-primary flex items-center justify-center">
            {Array.from({ length: gameState?.lives || 0 }, (_, i) => (
              <svg key={i} className="w-6 h-6 text-red-500 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            ))}
          </div>
          <div className="mt-2 w-8 h-1 bg-gradient-accent rounded-full mx-auto"></div>
        </div>
        <div className="stat-card surface-primary rounded-2xl p-6 shadow-soft">
          <div className="text-text-secondary text-sm font-semibold mb-2 uppercase tracking-wide">Level</div>
          <div className="text-3xl font-bold text-text-primary">{gameState?.level || 1}</div>
          <div className="mt-2 w-8 h-1 bg-gradient-secondary rounded-full mx-auto"></div>
        </div>
        <div className="stat-card surface-primary rounded-2xl p-6 shadow-soft">
          <div className="text-text-secondary text-sm font-semibold mb-2 uppercase tracking-wide">Blocks</div>
          <div className="text-3xl font-bold text-text-primary">
            {gameState?.blocks.filter(b => !b.destroyed).length || 0}
          </div>
          <div className="mt-2 w-8 h-1 bg-gradient-primary rounded-full mx-auto"></div>
        </div>
      </div>

      <div className="surface-secondary rounded-2xl p-6 text-center max-w-lg shadow-soft animate-fade-in-up">
        <h3 className="text-text-primary font-bold mb-4 text-lg">Game Controls</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="text-left">
            <div className="font-semibold text-text-primary mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              Desktop
            </div>
            <div className="text-text-secondary space-y-1">
              <p>← → or A/D to move</p>
              <p>Space to pause</p>
            </div>
          </div>
          <div className="text-left">
            <div className="font-semibold text-text-primary mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" />
              </svg>
              Mobile
            </div>
            <div className="text-text-secondary space-y-1">
              <p>Touch & drag to move paddle</p>
              <p>Tap to start/resume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}