import { Position, TileType } from './types';
import { Level } from './Level';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

interface PathNode {
  position: Position;
  g: number;  // Cost from start
  h: number;  // Heuristic (estimated cost to goal)
  f: number;  // Total cost (g + h)
  parent: PathNode | null;
}

function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

function heuristic(a: Position, b: Position): number {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(pos: Position, level: Level, holePositions: Position[]): Position[] {
  const neighbors: Position[] = [];
  const holeSet = new Set(holePositions.map(p => posKey(p)));
  
  const current = level.getTile(pos.x, pos.y);
  
  // Check horizontal movement
  for (const dx of [-1, 1]) {
    const nx = pos.x + dx;
    const ny = pos.y;
    
    if (nx < 0 || nx >= GRID_WIDTH) continue;
    
    // Skip holes
    if (holeSet.has(posKey({ x: nx, y: ny }))) continue;
    
    const neighbor = level.getTile(nx, ny);
    
    // Can move horizontally if:
    // - Current is ladder/bar (can move off it)
    // - Neighbor is traversable (not solid block at same level)
    // - There's support at neighbor position
    if (current === TileType.Ladder || current === TileType.Bar ||
        neighbor === TileType.Empty || neighbor === TileType.Ladder || 
        neighbor === TileType.Bar || neighbor === TileType.Gold) {
      // Check if there's support at the destination or it's a bar
      if (neighbor === TileType.Bar || neighbor === TileType.Ladder ||
          level.hasSupport(nx, ny)) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  
  // Check vertical movement (ladders only)
  if (level.isClimbable(pos.x, pos.y)) {
    // Can go up
    if (pos.y > 0) {
      const above = level.getTile(pos.x, pos.y - 1);
      if (above === TileType.Ladder || above === TileType.Empty || 
          above === TileType.Bar || above === TileType.Gold) {
        if (!holeSet.has(posKey({ x: pos.x, y: pos.y - 1 }))) {
          neighbors.push({ x: pos.x, y: pos.y - 1 });
        }
      }
    }
    // Can go down
    if (pos.y < GRID_HEIGHT - 1) {
      const below = level.getTile(pos.x, pos.y + 1);
      if (below === TileType.Ladder || below === TileType.Empty ||
          below === TileType.Gold) {
        if (!holeSet.has(posKey({ x: pos.x, y: pos.y + 1 }))) {
          neighbors.push({ x: pos.x, y: pos.y + 1 });
        }
      }
    }
  }
  
  // Can climb up to ladder above
  if (pos.y > 0 && level.isClimbable(pos.x, pos.y - 1)) {
    if (!holeSet.has(posKey({ x: pos.x, y: pos.y - 1 }))) {
      neighbors.push({ x: pos.x, y: pos.y - 1 });
    }
  }
  
  // Can fall down if bar (drop from bar)
  if (current === TileType.Bar && pos.y < GRID_HEIGHT - 1) {
    const below = level.getTile(pos.x, pos.y + 1);
    if (below !== TileType.Brick && below !== TileType.Stone) {
      if (!holeSet.has(posKey({ x: pos.x, y: pos.y + 1 }))) {
        neighbors.push({ x: pos.x, y: pos.y + 1 });
      }
    }
  }
  
  return neighbors;
}

export function findPath(
  start: Position,
  goal: Position,
  level: Level,
  holePositions: Position[] = []
): Position[] {
  const openSet: Map<string, PathNode> = new Map();
  const closedSet: Set<string> = new Set();
  
  const startNode: PathNode = {
    position: { ...start },
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  };
  
  openSet.set(posKey(start), startNode);
  
  while (openSet.size > 0) {
    // Find node with lowest f score
    let current: PathNode | null = null;
    let lowestF = Infinity;
    
    for (const node of openSet.values()) {
      if (node.f < lowestF) {
        lowestF = node.f;
        current = node;
      }
    }
    
    if (!current) break;
    
    // Goal reached?
    if (current.position.x === goal.x && current.position.y === goal.y) {
      return reconstructPath(current);
    }
    
    // Move current from open to closed
    openSet.delete(posKey(current.position));
    closedSet.add(posKey(current.position));
    
    // Check neighbors
    const neighbors = getNeighbors(current.position, level, holePositions);
    
    for (const neighborPos of neighbors) {
      const neighborKey = posKey(neighborPos);
      
      if (closedSet.has(neighborKey)) continue;
      
      const tentativeG = current.g + 1;
      
      const existingNode = openSet.get(neighborKey);
      
      if (!existingNode) {
        // New node
        const h = heuristic(neighborPos, goal);
        const newNode: PathNode = {
          position: neighborPos,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current,
        };
        openSet.set(neighborKey, newNode);
      } else if (tentativeG < existingNode.g) {
        // Better path found
        existingNode.g = tentativeG;
        existingNode.f = tentativeG + existingNode.h;
        existingNode.parent = current;
      }
    }
  }
  
  // No path found
  return [];
}

function reconstructPath(endNode: PathNode): Position[] {
  const path: Position[] = [];
  let current: PathNode | null = endNode;
  
  while (current) {
    path.unshift({ ...current.position });
    current = current.parent;
  }
  
  // Remove start position (we're already there)
  if (path.length > 0) {
    path.shift();
  }
  
  return path;
}

export { heuristic, getNeighbors };
