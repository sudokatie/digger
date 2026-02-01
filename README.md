# Digger

Lode Runner style puzzle platformer. You can't jump - only dig.

## Why This Exists

Lode Runner was a 1983 masterpiece that understood a fundamental truth: constraints breed creativity. Take away the ability to jump, and suddenly every ladder, every brick, every hole you dig becomes a strategic decision.

Most remakes miss the point. They add power-ups, fancy graphics, complicated mechanics. Digger keeps it simple: run, climb, hang, and dig. That's it. That's all you need.

## Features

- **No jumping** - Use the level geometry or make your own path
- **Dig holes** - Trap guards, create shortcuts, solve puzzles
- **Smart guards** - They'll find you, but they're not invincible
- **10 handcrafted levels** - From tutorial to "why did I do this to myself"
- **Lives system** - Three strikes and you're out
- **8-bit aesthetic** - Because nostalgia is a valid design choice

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Pick a level. Try not to die.

## Controls

| Action | Keys |
|--------|------|
| Move | Arrow Keys / WASD |
| Dig Left | Q / Z |
| Dig Right | E / X |
| Pause | ESC / P |
| Restart | R |

## How to Play

1. Collect all the gold pieces
2. Exit appears when all gold is collected
3. Reach the exit to complete the level

**The twist:** You can't jump. You can only:
- Run left/right on solid ground
- Climb up/down ladders
- Hang and move along bars
- Dig holes in brick (not stone)

**Guards:**
- They chase you using the shortest path
- Dig a hole, they fall in and get stuck
- Walk over their heads while they're trapped
- They escape after a few seconds (and drop any gold they're carrying)
- If a hole fills while you're in it: you die

## Philosophy

1. Constraints are features, not limitations
2. Simple mechanics, complex emergent gameplay  
3. Fair but challenging - every death is learnable
4. No hand-holding after the tutorial

## Tech Stack

- Next.js 14 + TypeScript
- HTML5 Canvas (no game engine dependencies)
- Tailwind CSS for UI chrome
- 170 tests because I have trust issues with my own code

## License

MIT

## Author

Katie

---

*The guard is coming. Better start digging.*
