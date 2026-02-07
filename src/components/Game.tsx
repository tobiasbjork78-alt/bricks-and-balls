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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-2 tracking-tight">
          Bricks & Balls
        </h1>
        <p className="text-slate-600 text-lg font-medium">
          A beautiful breakout experience
        </p>
      </div>

      <div className="game-container mb-8">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="game-canvas rounded-2xl shadow-2xl ring-1 ring-black/5"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              maxWidth: '100%',
              backgroundColor: '#f8f9fa'
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={handleStart}
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start Game
        </button>

        {gameState?.isRunning && (
          <button
            onClick={handlePause}
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {gameState?.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}

        <button
          onClick={handleReset}
          className="inline-flex items-center px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-lg">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-black/5">
          <div className="text-slate-600 text-sm font-medium mb-1">Score</div>
          <div className="text-2xl font-bold text-slate-900">{gameState?.score || 0}</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-black/5">
          <div className="text-slate-600 text-sm font-medium mb-1">Lives</div>
          <div className="text-2xl font-bold text-slate-900">{gameState?.lives || 0}</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-black/5">
          <div className="text-slate-600 text-sm font-medium mb-1">Level</div>
          <div className="text-2xl font-bold text-slate-900">{gameState?.level || 1}</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-black/5">
          <div className="text-slate-600 text-sm font-medium mb-1">Blocks</div>
          <div className="text-2xl font-bold text-slate-900">
            {gameState?.blocks.filter(b => !b.destroyed).length || 0}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-500 text-sm max-w-md">
        <p className="mb-2">
          <span className="font-semibold">Desktop:</span> Arrow keys or A/D to move, Space to pause
        </p>
        <p>
          <span className="font-semibold">Mobile:</span> Touch and drag to move paddle
        </p>
      </div>
    </div>
  );
}