import { useCallback, useEffect, useRef, useState } from 'react';
import { knowledge } from './data.js';
import './department.css';

type Language = 'en' | 'zh';
type Scene = 'review' | 'denied' | 'maze' | 'battle' | 'reward' | 'record' | 'dead' | 'clear';
type Direction = 0 | 1 | 2 | 3;
type CardKind = 'attack' | 'defense' | 'utility';
type Card = {
  id: string;
  name: [string, string];
  detail: [string, string];
  cost: number;
  kind: CardKind;
  damage?: number;
  block?: number;
  heal?: number;
  draw?: number;
  piercing?: boolean;
};
type Run = {
  scene: Scene;
  role: string;
  denials: number;
  x: number;
  y: number;
  dir: Direction;
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  turn: number;
  deck: string[];
  drawPile: string[];
  discard: string[];
  hand: string[];
  foeId: string;
  foeHp: number;
  foeBlock: number;
  intent: number;
  clearedFoes: string[];
  files: string[];
  record: string;
  visited: string[];
  note: string;
  moves: number;
  runs: number;
};

const GRID = [
  '###############',
  '#S#....E......#',
  '#.#.#########.#',
  '#.#.X.#...H...#',
  '#.#####.#####.#',
  '#.....#...#...#',
  '#####.#.#.#####',
  '#...#.#.#.....#',
  '#.#.#.#.#####.#',
  '#.#.#.#.....#.#',
  '#.#.#.#####.#.#',
  '#E#...#...#.#.#',
  '#.#####.#.###.#',
  '#.....A.#.....#',
  '###############',
] as const;
const DIRS: Array<[number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const DIR_NAMES = ['N', 'E', 'S', 'W'];
const RESUME = import.meta.env.BASE_URL + 'CV.pdf';
const RESUME_ZH = import.meta.env.BASE_URL + 'CV_zh_TW.pdf';
const FILES = {
  A: knowledge.projects[0],
  H: knowledge.projects[1],
};
const CARDS: Record<string, Card> = {
  python: { id: 'python', name: ['Python', 'PYTHON'], detail: ['Deal 7 damage.', '造成 7 傷害。'], cost: 1, kind: 'attack', damage: 7 },
  sql: { id: 'sql', name: ['SQL QUERY', 'SQL 查詢'], detail: ['Deal 10 damage.', '造成 10 傷害。'], cost: 2, kind: 'attack', damage: 10 },
  rag: { id: 'rag', name: ['RAG RETRIEVAL', 'RAG 檢索'], detail: ['Deal 4. Draw 1.', '造成 4 傷害，抽 1 張。'], cost: 1, kind: 'attack', damage: 4, draw: 1 },
  api: { id: 'api', name: ['REST API', 'REST API'], detail: ['Deal 6 through armor.', '無視護甲，造成 6 傷害。'], cost: 1, kind: 'attack', damage: 6, piercing: true },
  debug: { id: 'debug', name: ['BREAKPOINT', '中斷點'], detail: ['Deal 11 damage.', '造成 11 傷害。'], cost: 2, kind: 'attack', damage: 11 },
  script: { id: 'script', name: ['AUTOMATION', '自動化'], detail: ['Deal 5. Draw 1.', '造成 5 傷害，抽 1 張。'], cost: 1, kind: 'attack', damage: 5, draw: 1 },
  triage: { id: 'triage', name: ['TRIAGE', '檢傷分類'], detail: ['Gain 8 block.', '獲得 8 點護盾。'], cost: 1, kind: 'defense', block: 8 },
  assessment: { id: 'assessment', name: ['ASSESSMENT', '護理評估'], detail: ['Gain 6 block. Draw 1.', '獲得 6 護盾，抽 1 張。'], cost: 1, kind: 'defense', block: 6, draw: 1 },
  handoff: { id: 'handoff', name: ['HANDOFF', '交班'], detail: ['Gain 11 block.', '獲得 11 點護盾。'], cost: 2, kind: 'defense', block: 11 },
  document: { id: 'document', name: ['CHARTING', '護理紀錄'], detail: ['Gain 4 block. Draw 2.', '獲得 4 護盾，抽 2 張。'], cost: 1, kind: 'defense', block: 4, draw: 2 },
  stabilize: { id: 'stabilize', name: ['STABILIZE', '生命徵象'], detail: ['Heal 5. Gain 3 block.', '恢復 5 HP，獲得 3 護盾。'], cost: 2, kind: 'utility', heal: 5, block: 3 },
};
const START_DECK = ['python', 'python', 'sql', 'rag', 'api', 'debug', 'triage', 'triage', 'assessment', 'handoff'];
const REWARDS = ['script', 'document', 'stabilize', 'api', 'rag', 'assessment'];
const FIGHTS: Record<string, { name: [string, string]; hp: number; attack: number }> = {
  '1,11': { name: ['CREDENTIAL INSPECTOR', '資格審查員'], hp: 24, attack: 7 },
  '7,1': { name: ['CLASSIFICATION ENGINE', '分類引擎'], hp: 32, attack: 9 },
};
function label(language: Language, en: string, zh: string) { return language === 'en' ? en : zh; }
function cell(x: number, y: number) { return GRID[y]?.[x] ?? '#'; }
function key(x: number, y: number) { return x + ',' + y; }
function shuffled(items: string[], salt: number) {
  const result = [...items];
  let seed = (salt + 1733) >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function newRun(runs = 0): Run {
  return {
    scene: 'review', role: '', denials: 0,
    x: 1, y: 1, dir: 2, hp: 40, maxHp: 40, block: 0, energy: 3, turn: 1,
    deck: [...START_DECK], drawPile: [], discard: [], hand: [],
    foeId: '', foeHp: 0, foeBlock: 0, intent: 0, clearedFoes: [], files: [],
    record: '', visited: [key(1, 1)], note: '', moves: 0, runs,
  };
}
function drawCards(state: Run, n: number): Run {
  const g = { ...state, hand: [...state.hand], drawPile: [...state.drawPile], discard: [...state.discard] };
  for (let i = 0; i < n; i++) {
    if (!g.drawPile.length) {
      g.drawPile = shuffled(g.discard, g.turn * 37 + g.runs * 73);
      g.discard = [];
    }
    if (!g.drawPile.length) break;
    const card = g.drawPile.pop();
    if (card) g.hand.push(card);
  }
  return g;
}
function fight(state: Run, foeId: string): Run {
  const foe = FIGHTS[foeId];
  if (!foe) return state;
  const g: Run = {
    ...state, scene: 'battle', foeId, foeHp: foe.hp, foeBlock: 0,
    intent: foe.attack, turn: 1, energy: 3, block: 0,
    hand: [], discard: [], drawPile: shuffled(state.deck, state.moves + state.runs * 19),
    note: '',
  };
  return drawCards(g, 5);
}
function step(state: Run, command: 'left' | 'right' | 'forward' | 'back'): Run {
  if (state.scene !== 'maze') return state;
  if (command === 'left') return { ...state, dir: ((state.dir + 3) % 4) as Direction };
  if (command === 'right') return { ...state, dir: ((state.dir + 1) % 4) as Direction };
  const vector = DIRS[state.dir];
  const sign = command === 'back' ? -1 : 1;
  const x = state.x + vector[0] * sign;
  const y = state.y + vector[1] * sign;
  const location = cell(x, y);
  if (location === '#') return { ...state, note: 'WALL / ACCESS DENIED' };
  let next: Run = {
    ...state, x, y, moves: state.moves + 1, note: '',
    visited: state.visited.includes(key(x, y)) ? state.visited : [...state.visited, key(x, y)],
  };
  if (location === 'E' && !next.clearedFoes.includes(key(x, y))) return fight(next, key(x, y));
  if ((location === 'A' || location === 'H') && !next.files.includes(location)) {
    return { ...next, scene: 'record', record: location };
  }
  if (location === 'X') {
    if (next.files.includes('A') && next.files.includes('H') && next.clearedFoes.length === 2) {
      return { ...next, scene: 'clear', note: '' };
    }
    return { ...next, note: 'EXIT LOCKED / 2 FILES + 2 INSPECTIONS REQUIRED' };
  }
  return next;
}
function playCard(state: Run, index: number): Run {
  if (state.scene !== 'battle') return state;
  const id = state.hand[index];
  const card = CARDS[id];
  if (!card || card.cost > state.energy) return state;
  let foeHp = state.foeHp;
  let foeBlock = state.foeBlock;
  if (card.damage) {
    if (card.piercing) foeHp -= card.damage;
    else {
      const absorbed = Math.min(foeBlock, card.damage);
      foeBlock -= absorbed;
      foeHp -= card.damage - absorbed;
    }
  }
  let next: Run = {
    ...state, foeHp: Math.max(0, foeHp), foeBlock, energy: state.energy - card.cost,
    hp: Math.min(state.maxHp, state.hp + (card.heal ?? 0)),
    block: state.block + (card.block ?? 0),
    hand: state.hand.filter((_, i) => i !== index),
    discard: [...state.discard, id],
  };
  if (next.foeHp <= 0) {
    return {
      ...next, scene: 'reward', hp: Math.min(next.maxHp, next.hp + 5),
      clearedFoes: [...next.clearedFoes, next.foeId], note: 'NURSING PASSIVE +5 HP',
    };
  }
  if (card.draw) next = drawCards(next, card.draw);
  return next;
}
function endTurn(state: Run): Run {
  if (state.scene !== 'battle') return state;
  const damage = Math.max(0, state.intent - state.block);
  const hp = Math.max(0, state.hp - damage);
  if (!hp) return { ...state, hp: 0, scene: 'dead', note: 'CASE CLOSED' };
  const turn = state.turn + 1;
  const foe = FIGHTS[state.foeId];
  const next: Run = {
    ...state, hp, block: 0, turn, energy: 3, foeBlock: turn % 3 === 0 ? 5 : 0,
    intent: foe.attack + (turn % 3 === 0 ? 2 : 0),
    discard: [...state.discard, ...state.hand], hand: [],
    note: damage ? 'INCOMING DAMAGE -' + damage : 'ATTACK BLOCKED',
  };
  return drawCards(next, 5);
}
function selectReward(state: Run, id: string): Run {
  if (state.scene !== 'reward' || !REWARDS.includes(id)) return state;
  return {
    ...state, scene: 'maze', deck: [...state.deck, id],
    hand: [], drawPile: [], discard: [], block: 0,
    note: 'CARD ADDED / NURSING PASSIVE +5 HP',
  };
}

const TEXTURE_COLORS = [
  ['#343b31', '#525c49', '#737761', '#a2a087'],
  ['#41362e', '#655544', '#8f7b59', '#b4a17c'],
  ['#293b3f', '#406068', '#668389', '#9daca3'],
];
function textures() {
  const result: HTMLCanvasElement[] = [];
  for (let t = 0; t < 3; t++) {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const colors = TEXTURE_COLORS[t];
    ctx.fillStyle = colors[1]; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = colors[0];
    for (let y = 0; y < 16; y += 8) ctx.fillRect(0, y, 16, 1);
    ctx.fillStyle = colors[2];
    for (let y = 1; y < 16; y += 8) {
      const shift = (y % 3) * 3;
      for (let x = shift; x < 16; x += 8) ctx.fillRect(x, y, 1, 7);
    }
    for (let y = 0; y < 16; y += 2) {
      for (let x = 0; x < 16; x += 2) {
        const p = (x * 17 + y * 11 + t * 29) % 13;
        if (p < 3) {
          ctx.fillStyle = p === 0 ? colors[0] : colors[3];
          ctx.fillRect(x, y, 2, 1);
        }
      }
    }
    if (t === 2) {
      ctx.fillStyle = colors[3]; ctx.fillRect(7, 0, 2, 16);
      ctx.fillStyle = colors[0]; ctx.fillRect(6, 0, 1, 16);
    }
    result.push(canvas);
  }
  return result;
}
function renderMaze(canvas: HTMLCanvasElement, state: Run) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = 320, H = 200;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#19292b'; ctx.fillRect(0, 0, W, 99);
  ctx.fillStyle = '#252c26'; ctx.fillRect(0, 100, W, 100);
  for (let y = 0; y < 200; y += 8) {
    ctx.fillStyle = y < 100 ? '#223335' : '#34382e';
    ctx.fillRect(0, y, W, 1);
  }
  const angle = (state.dir - 1) * Math.PI / 2;
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const planeX = -dy * 0.75, planeY = dx * 0.75;
  const tx = textures();
  const depth = Array(W).fill(1000) as number[];
  for (let col = 0; col < W; col += 2) {
    const camera = 2 * col / W - 1;
    const rx = dx + planeX * camera, ry = dy + planeY * camera;
    let mx = Math.floor(state.x + 0.5), my = Math.floor(state.y + 0.5);
    const ddx = Math.abs(1 / (rx || 0.00001));
    const ddy = Math.abs(1 / (ry || 0.00001));
    const sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
    let sideX = rx < 0 ? (state.x + 0.5 - mx) * ddx : (mx + 1 - state.x - 0.5) * ddx;
    let sideY = ry < 0 ? (state.y + 0.5 - my) * ddy : (my + 1 - state.y - 0.5) * ddy;
    let side = 0, ticks = 0;
    while (ticks++ < 32 && cell(mx, my) !== '#') {
      if (sideX < sideY) { sideX += ddx; mx += sx; side = 0; }
      else { sideY += ddy; my += sy; side = 1; }
    }
    let dist = side === 0 ? sideX - ddx : sideY - ddy;
    dist = Math.max(0.15, dist);
    const wallHeight = Math.min(H * 2, Math.floor(H / dist));
    const top = Math.floor((H - wallHeight) / 2);
    const hitX = side === 0 ? state.y + 0.5 + dist * ry : state.x + 0.5 + dist * rx;
    let textureX = Math.floor((hitX - Math.floor(hitX)) * 16);
    if ((side === 0 && rx > 0) || (side === 1 && ry < 0)) textureX = 15 - textureX;
    const tile = ((mx * 3 + my * 7) % 5 === 0) ? 2 : ((mx + my) % 3 === 0 ? 1 : 0);
    const texture = tx[tile];
    if (texture) ctx.drawImage(texture, textureX, 0, 1, 16, col, top, 2, wallHeight);
    if (side === 1) {
      ctx.fillStyle = 'rgba(10,18,17,.28)';
      ctx.fillRect(col, Math.max(0, top), 2, Math.min(H, wallHeight));
    }
    if (dist > 4) {
      ctx.fillStyle = 'rgba(9,16,15,' + Math.min(0.6, (dist - 4) * .09) + ')';
      ctx.fillRect(col, Math.max(0, top), 2, Math.min(H, wallHeight));
    }
    depth[col] = dist; depth[col + 1] = dist;
  }
  const sprites: Array<{x:number; y:number; kind:string; dist:number}> = [];
  GRID.forEach((row,y) => {
    [...row].forEach((kind,x) => {
      if (!'AEHX'.includes(kind)) return;
      if (kind === 'E' && state.clearedFoes.includes(key(x,y))) return;
      sprites.push({ x, y, kind, dist: Math.hypot(x - state.x, y - state.y) });
    });
  });
  sprites.sort((a, b) => b.dist - a.dist);
  for (const sprite of sprites) {
    const relX = sprite.x - state.x, relY = sprite.y - state.y;
    const inverse = 1 / (planeX * dy - dx * planeY);
    const transformX = inverse * (dy * relX - dx * relY);
    const transformY = inverse * (-planeY * relX + planeX * relY);
    if (transformY <= 0.25) continue;
    const center = Math.floor((W / 2) * (1 + transformX / transformY));
    const size = Math.min(180, Math.floor(H / transformY * .45));
    const start = Math.max(0, center - Math.floor(size / 2));
    if (depth[Math.max(0, Math.min(W-1, center))] < transformY - 0.2) continue;
    const top = Math.floor(H / 2 - size / 2);
    const color = sprite.kind === 'E' ? '#bb5448' : sprite.kind === 'X' ? '#cfb56a' : '#b5bfa0';
    ctx.fillStyle = '#171a17'; ctx.fillRect(start - 2, top - 3, size + 4, size + 6);
    ctx.fillStyle = color; ctx.fillRect(start, top, size, size);
    ctx.fillStyle = '#24302c'; ctx.fillRect(start + 4, top + 4, Math.max(1, size - 8), Math.max(1, size - 8));
    if (size > 18) {
      ctx.fillStyle = color; ctx.textAlign = 'center';
      ctx.font = 'bold ' + Math.max(9, Math.floor(size / 3)) + 'px monospace';
      ctx.fillText(sprite.kind === 'E' ? '!' : sprite.kind === 'X' ? 'X' : 'F', center, top + size * .65);
    }
  }
  ctx.fillStyle = '#d2cba8'; ctx.fillRect(156, 98, 8, 1); ctx.fillRect(159, 95, 2, 7);
  ctx.fillStyle = 'rgba(0,0,0,.1)';
  for (let y = 1; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
function MiniMap({ run }: {run: Run}) {
  return <div className="dm-minimap" aria-label="Explored map">
    {GRID.map((row,y) => <div className="dm-maprow" key={y}>
      {[...row].map((spot,x) => {
        const visible = run.visited.some(v => {
          const [vx,vy] = v.split(',').map(Number);
          return Math.abs(vx-x) + Math.abs(vy-y) <= 2;
        });
        return <span key={x} className={'dm-mapcell ' +
          (run.x === x && run.y === y ? 'you' : !visible ? 'fog' : spot === '#' ? 'wall' : spot === 'X' ? 'exit' : 'floor')}>
          {run.x === x && run.y === y ? DIR_NAMES[run.dir] : visible && spot !== '#' && spot !== '.' && spot !== 'S' ? spot : ''}
        </span>;
      })}
    </div>)}
  </div>;
}

export function Department({language, onNavigate}: {language:Language; onNavigate:(page:'portfolio'|'weekly'|'chat')=>void}) {
  const [run, setRun] = useState<Run>(() => newRun());
  const [showMap, setShowMap] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const go = useCallback((direction: 'left'|'right'|'forward'|'back') => setRun(g => step(g, direction)),[]);
  useEffect(() => {
    if (canvas.current && ['maze', 'battle', 'reward', 'record'].includes(run.scene)) renderMaze(canvas.current, run);
  }, [run]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const commands: Record<string,'left'|'right'|'forward'|'back'> = {
        ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right',
        ArrowUp:'forward', w:'forward', W:'forward', ArrowDown:'back', s:'back', S:'back',
      };
      if (run.scene === 'maze' && commands[event.key]) {
        event.preventDefault(); go(commands[event.key]);
      }
      if (run.scene === 'battle' && event.key === 'Enter') { event.preventDefault(); setRun(endTurn); }
      if (run.scene === 'maze' && (event.key === 'm' || event.key === 'M')) setShowMap(v => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [run.scene, go]);
  const chooseRole = (role: string) => {
    setRun(g => ({ ...g, scene: 'denied', denials: g.denials + 1, role }));
  };
  const start = () => {
    setRun(g => ({ ...g, scene: 'maze', note: 'APPEAL ACCEPTED / FILES REQUIRED' }));
  };
  const reset = () => { setRun(g => newRun(g.runs + 1)); setShowMap(false); };
  const record = run.record === 'A' ? FILES.A : FILES.H;
  const foe = FIGHTS[run.foeId];
  const cards = (run.clearedFoes.length === 1 ? ['script','document','api'] : ['rag','stabilize','assessment']);
  const canSeeMaze = ['maze','battle','reward','record'].includes(run.scene);
  return <main className="dm" id="department">
    <div className="dm-frame">
      <header className="dm-top">
        <button type="button" className="dm-logo" onClick={reset}>D.O.C. <span>§ 0451</span></button>
        <div className="dm-top-links">
          <button type="button" onClick={() => onNavigate('portfolio')}>{label(language,'WORK','作品')}</button>
          <a href={language === 'en' ? RESUME : RESUME_ZH} target="_blank" rel="noreferrer">CV</a>
          <button type="button" onClick={() => onNavigate('weekly')}>{label(language,'WRITING','文章')}</button>
          <button type="button" onClick={() => onNavigate('chat')}>MARK I</button>
        </div>
      </header>

      {run.scene === 'review' || run.scene === 'denied' ? <div className="dm-paper-stage">
        <div className="dm-counter"><span>{label(language,'CLASSIFICATION OFFICE','職業分類局')}</span><span>DAY 001 · 08:00</span></div>
        <div className="dm-paper">
          <div className="dm-paper-corner">№ 0000451</div>
          <div className="dm-seal"><span>DOC</span><small>APPROVED?</small></div>
          <div className="dm-paper-head">{label(language,'PERSONNEL RECORD','人事登錄表')}</div>
          <div className="dm-divider" />
          <div className="dm-fields"><div><small>{label(language,'SUBJECT','受審者')}</small><strong>ERIC TUNG</strong></div>
          <div><small>{label(language,'ACADEMIC RECORD','學歷')}</small><strong>NTU · B.S. NURSING</strong></div>
          <div><small>{label(language,'OCCUPATION','職業')}</small><strong>SOFTWARE ENGINEER</strong></div>
          <div><small>{label(language,'SPECIALIZATION','專長')}</small><strong>BACKEND / AI / CLINICAL</strong></div></div>
          <div className="dm-divider" />
          <div className="dm-prompt">{label(language,'SELECT ONE CLASSIFICATION','請選擇一項分類')}</div>
          <div className="dm-choices">
            <button type="button" onClick={() => chooseRole('ENGINEER')}>{label(language,'ENGINEER','工程師')}</button>
            <button type="button" onClick={() => chooseRole('NURSE')}>{label(language,'NURSE','護理師')}</button>
            <button type="button" onClick={() => chooseRole('OTHER')}>{label(language,'OTHER','其他')}</button>
          </div>
          {run.scene === 'denied' && <div className="dm-rejection" role="status">
            <div className="dm-stamp">REJECTED</div>
            <p>{run.role === 'ENGINEER'
              ? label(language,'DISCREPANCY: DEGREE DOES NOT MATCH OCCUPATION.','資料不符：學位與職業分類衝突。')
              : run.role === 'NURSE'
                ? label(language,'DISCREPANCY: WORK HISTORY CONTAINS TOO MUCH CODE.','資料不符：工作紀錄包含過多程式碼。')
                : label(language,'DISCREPANCY: OTHER IS NOT AN ACCEPTED ANSWER.','資料不符：「其他」不是可接受的答案。')}</p>
            <div className="dm-reject-actions">
              <button type="button" onClick={() => setRun(g => ({...g,scene:'review'}))}>{label(language,'RECLASSIFY','重新分類')}</button>
              <button type="button" className="dm-appeal" onClick={start}>{label(language,'FILE APPEAL','提出申訴')} ▸</button>
            </div>
          </div>}
          <div className="dm-paper-foot">FORM 17-C · {label(language,'ALL FIELDS MANDATORY','所有欄位均需填寫')}</div>
        </div>
        <div className="dm-desk-bottom"><span>MINISTRY OF APPROPRIATE TITLES</span><span>EST. 19██</span></div>
      </div> : null}

      {canSeeMaze && <div className="dm-play-area">
        <div className="dm-status">
          <div><span className="dm-tag">CASE 0451</span><span>FLOOR 01</span></div>
          <span>{label(language,'APPEAL IN PROGRESS','申訴審理中')}</span>
        </div>
        <div className="dm-viewport">
          <canvas ref={canvas} width={320} height={200} role="img" aria-label={label(language,'First-person pixel maze corridor','第一人稱像素迷宮走廊')} />
          <div className="dm-viewport-label">X:{String(run.x).padStart(2,'0')} Y:{String(run.y).padStart(2,'0')} / {DIR_NAMES[run.dir]}</div>
          <div className="dm-viewport-flag">FILE: {run.files.length}/2</div>
        </div>
        <div className="dm-hud">
          <div className="dm-vitals">
            <div className="dm-vitals-top"><strong>ERIC</strong><span>HP {run.hp}/{run.maxHp}</span></div>
            <div className="dm-meter"><span style={{width: (run.hp/run.maxHp*100)+'%'}} /></div>
            <div className="dm-passive">{label(language,'NURSING TRAINING','護理訓練')} · +5 HP {label(language,'AFTER VICTORY','戰鬥勝利後')}</div>
          </div>
          {run.scene === 'maze' && <div className="dm-transport">
            <div className="dm-pad">
              <span/><button type="button" onClick={() => go('forward')} aria-label="Forward">▲</button><span/>
              <button type="button" onClick={() => go('left')} aria-label="Turn left">◀</button>
              <button type="button" onClick={() => go('back')} aria-label="Back">▼</button>
              <button type="button" onClick={() => go('right')} aria-label="Turn right">▶</button>
            </div>
            <div className="dm-controls-text">
              <p>WASD / ↑↓←→</p>
              <button type="button" onClick={() => setShowMap(v=>!v)}>{label(language,showMap?'CLOSE MAP [M]':'MAP [M]',showMap?'關閉地圖 [M]':'地圖 [M]')}</button>
            </div>
          </div>}
        </div>
        {showMap && run.scene === 'maze' && <MiniMap run={run}/>}
        {run.scene === 'maze' && <div className="dm-console" role="status"><span>▸</span> {run.note || label(language,'LOCATE THE FILES. CHALLENGE THE INSPECTORS.','尋找檔案，通過審查。')}</div>}
        {run.scene === 'battle' && <section className="dm-battle" aria-label="Card battle">
          <div className="dm-enemy">
            <div className="dm-enemy-icon" aria-hidden="true"><div>▚▞</div><div>▓▓</div><div>▐▌</div></div>
            <div><strong>{foe?.name[language==='en'?0:1] ?? 'INSPECTOR'}</strong>
            <div>HP {run.foeHp} / {foe?.hp} · {label(language,'ARMOR','護甲')} {run.foeBlock}</div>
            <div className="dm-enemy-intent">{label(language,'NEXT: ATTACK','下回合攻擊')} {run.intent}</div></div>
          </div>
          <div className="dm-battle-resources"><span>ENERGY {'■'.repeat(run.energy)}{'□'.repeat(3-run.energy)}</span><span>{label(language,'BLOCK','護盾')} {run.block}</span><span>{label(language,'TURN','回合')} {run.turn}</span></div>
          <div className="dm-hand">
            {run.hand.map((id,i) => {
              const card = CARDS[id];
              return <button key={id+'-'+i} type="button" disabled={card.cost > run.energy}
                className={'dm-card dm-card-'+card.kind} onClick={() => setRun(g=>playCard(g,i))}>
                <span className="dm-card-cost">{card.cost}</span>
                <strong>{card.name[language==='en'?0:1]}</strong>
                <small>{card.kind.toUpperCase()}</small>
                <p>{card.detail[language==='en'?0:1]}</p>
              </button>;
            })}
          </div>
          <div className="dm-battle-bottom"><span>{run.note || label(language,'SELECT AN ACTION','選擇行動')}</span><button type="button" onClick={() => setRun(endTurn)}>{label(language,'END TURN','結束回合')} ▸</button></div>
        </section>}
        {run.scene === 'reward' && <section className="dm-result">
          <div className="dm-result-stamp">INSPECTION PASSED</div>
          <p>{label(language,'NURSING TRAINING: RECOVER 5 HP.','護理訓練：恢復 5 HP。')}</p>
          <h2>{label(language,'SELECT ONE ACTION','選擇一張行動卡')}</h2>
          <div className="dm-reward-cards">{cards.map(id=><button key={id} type="button" className={'dm-card dm-card-'+CARDS[id].kind} onClick={()=>setRun(g=>selectReward(g,id))}>
            <span className="dm-card-cost">{CARDS[id].cost}</span><strong>{CARDS[id].name[language==='en'?0:1]}</strong>
            <small>{CARDS[id].kind.toUpperCase()}</small><p>{CARDS[id].detail[language==='en'?0:1]}</p>
          </button>)}</div>
        </section>}
        {run.scene === 'record' && <section className="dm-record">
          <div className="dm-record-head"><span>EXHIBIT {run.record === 'A' ? '01' : '02'}</span><span>VERIFIED</span></div>
          <h2>{record.title}</h2>
          <p>{record.description[0]}</p>
          <div className="dm-stack">{record.stack.slice(0,6).join(' / ')}</div>
          <div className="dm-record-buttons">
            <a href={record.link} target="_blank" rel="noreferrer">{label(language,'SOURCE CODE','原始碼')} ↗</a>
            <button type="button" onClick={()=>setRun(g=>({ ...g, scene:'maze', files:g.files.includes(g.record)?g.files:[...g.files,g.record], note:'EXHIBIT REGISTERED' }))}>
              {label(language,'REGISTER FILE','登錄檔案')} ▸
            </button>
          </div>
        </section>}
        <footer className="dm-maze-footer"><span>DEPARTMENT OF OCCUPATIONAL CLASSIFICATION</span><span>{label(language,'NO SAVES · RESTART ON FAILURE','無存檔 · 失敗後重新開始')}</span></footer>
      </div>}

      {(run.scene === 'dead' || run.scene === 'clear') && <div className="dm-ending">
        <div className="dm-end-code">{run.scene === 'clear' ? 'ERR_409' : 'ERR_404'}</div>
        <h1>{run.scene === 'clear' ? label(language,'UNCLASSIFIABLE','無法分類') : label(language,'APPLICATION TERMINATED','申請已終止')}</h1>
        <div className="dm-end-seal">{run.scene === 'clear' ? 'APPROVED' : 'REJECTED'}</div>
        <p>{run.scene === 'clear' ? label(language,'The occupation field has been removed from the form.','職業欄位已自表單中移除。') : label(language,'File lost. Appeal may be resubmitted.','檔案遺失，可重新提出申訴。')}</p>
        <div className="dm-end-actions">
          <button type="button" onClick={reset}>{label(language,'NEW APPLICATION','重新申請')}</button>
          <button type="button" onClick={()=>onNavigate('portfolio')}>{label(language,'VIEW WORK','查看作品')}</button>
          <a href={language === 'en' ? RESUME : RESUME_ZH} target="_blank" rel="noreferrer">CV ↗</a>
        </div>
      </div>}
      <div className="dm-bottom"><span>ERIC TUNG</span><span>BACKEND · AI · NURSING</span><span>© 2026</span></div>
    </div>
  </main>;
}
