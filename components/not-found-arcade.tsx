"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Gamepad2,
  Home,
  RefreshCcw,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiteLogo } from "@/components/site-logo";

type Direction = "up" | "down" | "left" | "right";

type Tile = {
  id: number;
  value: number;
};

type Cell = Tile | null;
type Board = Cell[][];

type GameState = {
  best: number;
  board: Board;
  gameOver: boolean;
  glitchUnlocked: boolean;
  highestTile: number;
  moves: number;
  score: number;
  status: string;
  won: boolean;
};

const GRID_SIZE = 4;
const GOAL_TILE = 2048;
const BEST_SCORE_STORAGE_KEY = "not-found-route-merge-best";
const SWIPE_THRESHOLD = 36;
const STATIC_SEED = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [2, 2, 0, 0],
];

const directions: { direction: Direction; icon: typeof ChevronUp; label: string }[] = [
  { direction: "up", icon: ChevronUp, label: "Move up" },
  { direction: "left", icon: ChevronLeft, label: "Move left" },
  { direction: "down", icon: ChevronDown, label: "Move down" },
  { direction: "right", icon: ChevronRight, label: "Move right" },
];

const createSeedBoard = (): Board => {
  let nextStaticId = 1;

  return STATIC_SEED.map((row) =>
    row.map((value) => (value > 0 ? { id: nextStaticId++, value } : null)),
  );
};

const getHighestTile = (board: Board) =>
  board.reduce((highest, row) => {
    const rowHighest = row.reduce((max, tile) => Math.max(max, tile?.value ?? 0), 0);
    return Math.max(highest, rowHighest);
  }, 0);

const createInitialGameState = (): GameState => {
  const board = createSeedBoard();

  return {
    best: 0,
    board,
    gameOver: false,
    glitchUnlocked: false,
    highestTile: getHighestTile(board),
    moves: 0,
    score: 0,
    status: "Merge matching route tiles. Arrow keys, WASD, or swipe all work.",
    won: false,
  };
};

const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

const countEmptyCells = (board: Board) =>
  board.reduce(
    (count, row) => count + row.filter((tile) => tile === null).length,
    0,
  );

const hasMovesLeft = (board: Board) => {
  if (countEmptyCells(board) > 0) {
    return true;
  }

  for (let rowIndex = 0; rowIndex < GRID_SIZE; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex += 1) {
      const current = board[rowIndex][columnIndex];
      const right = board[rowIndex][columnIndex + 1];
      const down = board[rowIndex + 1]?.[columnIndex];

      if (current && ((right && right.value === current.value) || (down && down.value === current.value))) {
        return true;
      }
    }
  }

  return false;
};

const spawnRandomTile = (
  board: Board,
  idRef: React.MutableRefObject<number>,
  glitchUnlocked: boolean,
) => {
  const emptyCells: { row: number; column: number }[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((tile, columnIndex) => {
      if (!tile) {
        emptyCells.push({ row: rowIndex, column: columnIndex });
      }
    });
  });

  if (emptyCells.length === 0) {
    return board;
  }

  const selectedCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < (glitchUnlocked ? 0.25 : 0.12) ? 4 : 2;
  const nextBoard = cloneBoard(board);

  nextBoard[selectedCell.row][selectedCell.column] = {
    id: idRef.current,
    value,
  };
  idRef.current += 1;

  return nextBoard;
};

const readLine = (board: Board, index: number, direction: Direction): Cell[] => {
  if (direction === "left") {
    return board[index];
  }

  if (direction === "right") {
    return [...board[index]].reverse();
  }

  if (direction === "up") {
    return board.map((row) => row[index]);
  }

  return [...board.map((row) => row[index])].reverse();
};

const writeLine = (board: Board, index: number, direction: Direction, line: Cell[]) => {
  const nextLine = direction === "right" || direction === "down" ? [...line].reverse() : line;

  if (direction === "left" || direction === "right") {
    board[index] = nextLine;
    return;
  }

  nextLine.forEach((tile, rowIndex) => {
    board[rowIndex][index] = tile;
  });
};

const slideLine = (
  line: Cell[],
  idRef: React.MutableRefObject<number>,
) => {
  const compacted = line.filter((tile): tile is Tile => tile !== null);
  const nextLine: Cell[] = [];
  let lineScore = 0;
  let lineHighest = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index];
    const next = compacted[index + 1];

    if (next && next.value === current.value) {
      const mergedValue = current.value * 2;

      nextLine.push({
        id: idRef.current,
        value: mergedValue,
      });
      idRef.current += 1;
      lineScore += mergedValue;
      lineHighest = Math.max(lineHighest, mergedValue);
      index += 1;
      continue;
    }

    nextLine.push(current);
    lineHighest = Math.max(lineHighest, current.value);
  }

  while (nextLine.length < GRID_SIZE) {
    nextLine.push(null);
  }

  const moved = line.some((tile, index) => tile?.id !== nextLine[index]?.id);

  return {
    highest: lineHighest,
    line: nextLine,
    moved,
    score: lineScore,
  };
};

const moveBoard = (
  board: Board,
  direction: Direction,
  idRef: React.MutableRefObject<number>,
  glitchUnlocked: boolean,
) => {
  const nextBoard = cloneBoard(board);
  let moved = false;
  let moveScore = 0;
  let moveHighest = 0;

  for (let index = 0; index < GRID_SIZE; index += 1) {
    const currentLine = readLine(nextBoard, index, direction);
    const slidLine = slideLine(currentLine, idRef);

    writeLine(nextBoard, index, direction, slidLine.line);
    moved = moved || slidLine.moved;
    moveScore += slidLine.score;
    moveHighest = Math.max(moveHighest, slidLine.highest);
  }

  if (!moved) {
    return {
      board,
      highest: Math.max(moveHighest, getHighestTile(board)),
      moved: false,
      score: 0,
    };
  }

  const spawnedBoard = spawnRandomTile(nextBoard, idRef, glitchUnlocked);

  return {
    board: spawnedBoard,
    highest: Math.max(moveHighest, getHighestTile(spawnedBoard)),
    moved: true,
    score: moveScore,
  };
};

const getTileTone = (value: number) => {
  if (value <= 2) {
    return "border-white/10 bg-[#0c1521] text-[#e6eef8]";
  }

  if (value <= 4) {
    return "border-[#89AACC]/18 bg-[#112235] text-[#e6eef8]";
  }

  if (value <= 8) {
    return "border-[#89AACC]/24 bg-[#15304a] text-[#eff7ff]";
  }

  if (value <= 16) {
    return "border-[#89AACC]/28 bg-[#1a3d60] text-[#f3f9ff]";
  }

  if (value <= 32) {
    return "border-[#89AACC]/32 bg-[#21507b] text-white";
  }

  if (value <= 64) {
    return "border-[#89AACC]/36 bg-[#2b679b] text-white";
  }

  if (value <= 128) {
    return "border-[#cfe4fa]/40 bg-linear-to-br from-[#386f9f] to-[#1d3d61] text-white";
  }

  if (value <= 512) {
    return "border-[#ddecfb]/45 bg-linear-to-br from-[#4a84b7] to-[#224769] text-white shadow-[0_0_24px_rgba(137,170,204,0.2)]";
  }

  return "border-[#edf6ff]/55 bg-linear-to-br from-[#8cb7df] to-[#2c557c] text-white shadow-[0_0_30px_rgba(137,170,204,0.28)]";
};

const getTileTextSize = (value: number) => {
  const length = String(value).length;

  if (length <= 2) {
    return "text-3xl sm:text-4xl";
  }

  if (length === 3) {
    return "text-2xl sm:text-3xl";
  }

  return "text-xl sm:text-2xl";
};

function DirectionPad({ onMove }: { onMove: (direction: Direction) => void }) {
  return (
    <div className="grid w-full max-w-[220px] grid-cols-3 gap-2">
      <div />
      <button
        type="button"
        onClick={() => onMove("up")}
        className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-text-primary transition hover:border-[#89AACC]/35 hover:bg-[#89AACC]/10"
        aria-label="Move up"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <div />

      {directions.slice(1).map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.direction}
            type="button"
            onClick={() => onMove(item.direction)}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-text-primary transition hover:border-[#89AACC]/35 hover:bg-[#89AACC]/10"
            aria-label={item.label}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}

export function NotFoundArcade() {
  const nextTileIdRef = useRef(3);
  const secretBufferRef = useRef("");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [game, setGame] = useState<GameState>(() => createInitialGameState());

  const emptyCells = useMemo(() => countEmptyCells(game.board), [game.board]);

  const startNewRun = (keepBest = true, keepGlitch = true) => {
    nextTileIdRef.current = 3;

    setGame((current) => {
      const seed = createInitialGameState();

      return {
        ...seed,
        best: keepBest ? current.best : 0,
        glitchUnlocked: keepGlitch ? current.glitchUnlocked : false,
        status: keepGlitch && current.glitchUnlocked
          ? "Glitch booster still armed. New tiles can appear as 4 more often."
          : "Fresh grid loaded. Merge matching route tiles and keep the corner stable.",
      };
    });
  };

  const handleMove = (direction: Direction) => {
    setGame((current) => {
      if (current.gameOver) {
        return current;
      }

      const result = moveBoard(current.board, direction, nextTileIdRef, current.glitchUnlocked);

      if (!result.moved) {
        return {
          ...current,
          status: "That move didn’t shift the grid. Try another lane.",
        };
      }

      const score = current.score + result.score;
      const best = Math.max(current.best, score);
      const won = current.won || result.highest >= GOAL_TILE;
      const gameOver = !hasMovesLeft(result.board);
      const status = won && !current.won
        ? "2048 reached. Keep pushing if you want a bigger tile."
        : gameOver
          ? "Grid locked. Start another run and chase a cleaner line."
          : result.score > 0
            ? `Merge confirmed. Score +${result.score}.`
            : "Route shifted. Keep the chain organized.";

      return {
        ...current,
        best,
        board: result.board,
        gameOver,
        highestTile: result.highest,
        moves: current.moves + 1,
        score,
        status,
        won,
      };
    });
  };

  useEffect(() => {
    try {
      const storedBest = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);

      if (!storedBest) {
        return;
      }

      const parsed = Number.parseInt(storedBest, 10);

      if (!Number.isNaN(parsed)) {
        setGame((current) => ({
          ...current,
          best: Math.max(current.best, parsed),
        }));
      }
    } catch {
      // Ignore storage errors silently.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(game.best));
    } catch {
      // Ignore storage errors silently.
    }
  }, [game.best]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (/^\d$/.test(key)) {
        secretBufferRef.current = `${secretBufferRef.current}${key}`.slice(-3);

        if (secretBufferRef.current === "404") {
          setGame((current) =>
            current.glitchUnlocked
              ? current
              : {
                  ...current,
                  glitchUnlocked: true,
                  status: "404 code accepted. Glitch booster armed for this session.",
                },
          );
        }
      }

      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        handleMove("up");
      } else if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        handleMove("down");
      } else if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        handleMove("left");
      } else if (key === "arrowright" || key === "d") {
        event.preventDefault();
        handleMove("right");
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    let titleIndex = 0;

    const rotateTitle = () => {
      const titles = [
        "404 // Route Merge",
        `404 // Score ${game.score}`,
        `404 // Best ${game.best}`,
        game.gameOver
          ? "404 // Grid Locked"
          : game.won
            ? "404 // 2048 Reached"
            : `404 // Tile ${game.highestTile}`,
      ];

      document.title = titles[titleIndex % titles.length];
      titleIndex += 1;
    };

    rotateTitle();
    const timer = window.setInterval(rotateTitle, 1600);

    return () => {
      window.clearInterval(timer);
      document.title = previousTitle;
    };
  }, [game.best, game.gameOver, game.highestTile, game.score, game.won]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(137,170,204,0.2),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(78,133,191,0.18),transparent_24%),linear-gradient(180deg,rgba(6,9,15,0.96)_0%,rgba(3,6,10,1)_100%)]" />
        <div className="grid-overlay absolute inset-0 opacity-20" />
        <div className="absolute left-[-8%] top-12 h-56 w-56 rounded-full bg-[#173050] blur-3xl" />
        <div className="absolute bottom-0 right-[-8%] h-72 w-72 rounded-full bg-[#2d5f96] blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-[1260px] px-4 py-12 sm:px-6 md:px-10 md:py-16 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pt-2"
          >
            <Link href="/" className="inline-flex items-center gap-3 text-sm text-text-primary">
              <SiteLogo className="h-12 w-12" imageClassName="p-1.5" priority />
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-muted">404 Arcade</p>
                <p className="mt-1 text-sm text-text-primary/78">Portfolio route not found</p>
              </div>
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#89AACC]/20 bg-[#89AACC]/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#c6ddf3]">
              <Sparkles className="h-3.5 w-3.5" />
              Addictive puzzle mode
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-4xl italic leading-[0.94] text-text-primary sm:text-5xl md:text-7xl">
              Wrong route. Better game.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted md:text-base">
              This page is gone, so the 404 now turns into a polished tile-merging puzzle instead. It works with
              keyboard, swipe, and touch controls, and there&apos;s still a hidden easter egg if you type{" "}
              <span className="text-text-primary">404</span>.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Best Score",
                  value: String(game.best),
                  hint: "Stored on this device",
                  icon: Trophy,
                },
                {
                  label: "Top Tile",
                  value: String(game.highestTile),
                  hint: game.won ? "Goal reached" : `Goal is ${GOAL_TILE}`,
                  icon: Zap,
                },
                {
                  label: "Mode",
                  value: game.glitchUnlocked ? "Boosted" : "Classic",
                  hint: game.glitchUnlocked ? "404 code active" : "Type 404 for a boost",
                  icon: Gamepad2,
                },
              ].map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                  >
                    <Icon className="h-4 w-4 text-[#89AACC]" />
                    <p className="mt-4 text-[11px] uppercase tracking-[0.26em] text-muted">{card.label}</p>
                    <p className="mt-2 text-2xl text-text-primary">{card.value}</p>
                    <p className="mt-2 text-sm text-muted">{card.hint}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="gradient-ring inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-text-primary"
              >
                <span className="rounded-full bg-surface px-2 py-1">Return home</span>
                <Home className="h-4 w-4" />
              </Link>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-text-primary transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                Browse blogs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-muted">Quick Tips</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-text-primary/76">
                <p>Keep your biggest tile pinned to one corner.</p>
                <p>Swipe mostly in two directions to avoid breaking your chain.</p>
                <p>Typing 404 activates a small secret spawn boost for this session.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="w-full"
          >
            <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(137,170,204,0.16),transparent_34%),linear-gradient(180deg,rgba(10,15,23,0.96)_0%,rgba(5,8,13,1)_100%)] p-4 shadow-[0_32px_110px_rgba(0,0,0,0.34)] sm:p-6">
              <div className="pointer-events-none absolute inset-0 grid-overlay opacity-10" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px accent-gradient opacity-60" />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#89AACC]/85">Route Merge</p>
                    <p className="mt-2 text-sm text-text-primary/76">
                      Merge matching tiles, reach {GOAL_TILE}, then keep climbing.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-text-primary/78">
                    {game.moves} moves
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Score</p>
                    <p className="mt-2 text-2xl text-text-primary">{game.score}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Best</p>
                    <p className="mt-2 text-2xl text-text-primary">{game.best}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Empty</p>
                    <p className="mt-2 text-2xl text-text-primary">{emptyCells}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm leading-6 text-text-primary/80" aria-live="polite">
                    {game.status}
                  </p>
                </div>

                <div
                  className={`mt-5 rounded-[30px] border p-3 sm:p-4 ${
                    game.glitchUnlocked
                      ? "border-[#89AACC]/25 bg-[radial-gradient(circle_at_top,rgba(137,170,204,0.14),transparent_44%),rgba(6,10,16,0.92)]"
                      : "border-white/10 bg-[#05070d]/90"
                  }`}
                  onTouchStart={(event) => {
                    const touch = event.touches[0];
                    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
                  }}
                  onTouchEnd={(event) => {
                    const start = touchStartRef.current;

                    if (!start) {
                      return;
                    }

                    const touch = event.changedTouches[0];
                    const deltaX = touch.clientX - start.x;
                    const deltaY = touch.clientY - start.y;

                    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD) {
                      return;
                    }

                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                      handleMove(deltaX > 0 ? "right" : "left");
                    } else {
                      handleMove(deltaY > 0 ? "down" : "up");
                    }
                  }}
                >
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {game.board.flatMap((row, rowIndex) =>
                      row.map((tile, columnIndex) => (
                        <div
                          key={`cell-${rowIndex}-${columnIndex}`}
                          className="relative aspect-square overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03]"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_52%)]" />
                          {tile ? (
                            <motion.div
                              layout
                              key={tile.id}
                              initial={{ scale: 0.82, opacity: 0.35 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className={`absolute inset-0 flex items-center justify-center rounded-[20px] border font-semibold tracking-tight ${getTileTone(tile.value)} ${getTileTextSize(tile.value)}`}
                            >
                              {tile.value}
                            </motion.div>
                          ) : null}
                        </div>
                      )),
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-sm">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Controls</p>
                    <p className="mt-2 text-sm leading-6 text-text-primary/74">
                      Use arrow keys or WASD on desktop. Swipe or use the touch pad below on mobile.
                    </p>
                  </div>
                  <DirectionPad onMove={handleMove} />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startNewRun(true, true)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-text-primary transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    New run
                  </button>
                  {game.glitchUnlocked ? (
                    <button
                      type="button"
                      onClick={() => startNewRun(true, false)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#89AACC]/30 bg-[#89AACC]/12 px-5 py-3 text-sm text-text-primary transition hover:border-[#89AACC]/45 hover:bg-[#89AACC]/18"
                    >
                      <Zap className="h-4 w-4" />
                      Reset to classic
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
