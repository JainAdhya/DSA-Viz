import { useState, useEffect, useRef, useCallback } from "react";

// ─── Color Palette & Theme ───────────────────────────────────────────────────
const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  card: "#1a1a26",
  border: "#2a2a3d",
  accent: "#6c63ff",
  accentGlow: "#6c63ff40",
  green: "#00d4aa",
  red: "#ff4f6e",
  yellow: "#ffd166",
  blue: "#4facfe",
  purple: "#c77dff",
  text: "#e8e8f0",
  muted: "#6b6b8a",
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.accent}; border-radius: 3px; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 ${COLORS.accentGlow}; }
    50% { box-shadow: 0 0 20px 8px ${COLORS.accentGlow}; }
  }
  @keyframes slideIn {
    from { transform: translateY(-40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-40px); opacity: 0; }
  }
  @keyframes popIn {
    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
    70% { transform: scale(1.1) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes highlight {
    0%, 100% { background: ${COLORS.card}; }
    50% { background: ${COLORS.accentGlow}; }
  }
  @keyframes traverseHighlight {
    0% { background: ${COLORS.card}; transform: scale(1); }
    50% { background: ${COLORS.green}30; transform: scale(1.1); border-color: ${COLORS.green}; }
    100% { background: ${COLORS.green}15; transform: scale(1); }
  }
  @keyframes gridPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes bfsWave {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes edgeTraverse {
    from { stroke-dashoffset: 200; }
    to { stroke-dashoffset: 0; }
  }
`;

// ─── Utility ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ─── Code Snippets ────────────────────────────────────────────────────────────
const CODE_SNIPPETS = {
  array: {
    insert: `// Insert element at index
function insert(arr, idx, val) {
  arr.splice(idx, 0, val);
  return arr;   // O(n) time
}`,
    delete: `// Delete element at index
function remove(arr, idx) {
  arr.splice(idx, 1);
  return arr;   // O(n) time
}`,
  },
  stack: {
    push: `// Push to stack (LIFO)
function push(stack, val) {
  stack.push(val);
  // O(1) time
}`,
    pop: `// Pop from stack
function pop(stack) {
  if (stack.length === 0)
    throw "Stack underflow";
  return stack.pop();  // O(1)
}`,
    peek: `// Peek top element
function peek(stack) {
  return stack[stack.length - 1];
  // O(1) time
}`,
  },
  queue: {
    enqueue: `// Enqueue (add to rear)
function enqueue(queue, val) {
  queue.push(val);
  // O(1) amortized
}`,
    dequeue: `// Dequeue (remove from front)
function dequeue(queue) {
  if (queue.length === 0)
    throw "Queue underflow";
  return queue.shift(); // O(n)
  // Use circular buffer for O(1)
}`,
  },
  bst: {
    insert: `// BST Insert
function insert(root, val) {
  if (!root) return new Node(val);
  if (val < root.val)
    root.left = insert(root.left, val);
  else
    root.right = insert(root.right, val);
  return root;  // O(log n) avg
}`,
    inorder: `// Inorder Traversal (LNR)
function inorder(root, result=[]) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;  // O(n)
}`,
  },
  graph: {
    bfs: `// BFS Traversal
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const nbr of graph[node] || [])
      if (!visited.has(nbr)) {
        visited.add(nbr);
        queue.push(nbr);
      }
  }
  return order;  // O(V+E)
}`,
    dfs: `// DFS Traversal
function dfs(graph, node, visited=new Set()) {
  visited.add(node);
  const order = [node];
  for (const nbr of graph[node] || [])
    if (!visited.has(nbr))
      order.push(...dfs(graph, nbr, visited));
  return order;  // O(V+E)
}`,
  },
};

// ─── Header Component ─────────────────────────────────────────────────────────
function Header({ view, setView }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: `${COLORS.bg}cc`,
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "0 2rem",
      display: "flex", alignItems: "center", gap: "1.5rem",
      height: "60px",
    }}>
      <button onClick={() => setView("home")} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "0.5rem",
        color: COLORS.text, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem",
      }}>
        <span style={{ color: COLORS.accent, fontSize: "1.4rem" }}>◈</span>
        DSA<span style={{ color: COLORS.accent }}>Viz</span>
      </button>
      <div style={{ flex: 1 }} />
      <span style={{ color: COLORS.muted, fontSize: "0.8rem", fontFamily: "'Space Mono', monospace" }}>
        {view !== "home" ? `→ ${view.toUpperCase()}` : "INTERACTIVE LEARNING"}
      </span>
    </header>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
const DS_CARDS = [
  {
    id: "array", icon: "▦", name: "Array", color: COLORS.blue,
    desc: "Linear collection of elements stored at contiguous memory locations.",
    complexity: "Access O(1) · Insert O(n)",
  },
  {
    id: "stack", icon: "⊞", name: "Stack", color: COLORS.green,
    desc: "LIFO structure — last element pushed is the first to be popped.",
    complexity: "Push/Pop O(1)",
  },
  {
    id: "queue", icon: "⊟", name: "Queue", color: COLORS.yellow,
    desc: "FIFO structure — elements are added at rear, removed from front.",
    complexity: "Enqueue/Dequeue O(1)",
  },
  {
    id: "linkedlist", icon: "⊸", name: "Linked List", color: COLORS.purple,
    desc: "Nodes linked via pointers — dynamic size, efficient insertions.",
    complexity: "Insert O(1) · Search O(n)",
  },
  {
    id: "tree", icon: "⊺", name: "Binary Tree / BST", color: COLORS.accent,
    desc: "Hierarchical structure — BST enables fast search and sort.",
    complexity: "Search O(log n) avg",
  },
  {
    id: "graph", icon: "⊛", name: "Graph", color: COLORS.red,
    desc: "Nodes and edges — models networks, routes, dependencies.",
    complexity: "BFS/DFS O(V+E)",
  },
];

function HomeCard({ card, idx, onExplore }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.card,
        border: `1px solid ${hovered ? card.color + "60" : COLORS.border}`,
        borderRadius: "16px",
        padding: "1.8rem",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 20px 40px ${card.color}20` : "none",
        animation: `fadeInUp 0.5s ease ${idx * 0.08}s both`,
        display: "flex", flexDirection: "column", gap: "1rem",
      }}
    >
      <div style={{
        width: "52px", height: "52px",
        background: `${card.color}18`,
        border: `1px solid ${card.color}40`,
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.6rem", color: card.color,
        transition: "all 0.3s",
        transform: hovered ? "rotate(8deg) scale(1.1)" : "none",
      }}>
        {card.icon}
      </div>
      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>{card.name}</h3>
        <p style={{ color: COLORS.muted, fontSize: "0.85rem", lineHeight: 1.6 }}>{card.desc}</p>
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
        color: card.color, background: `${card.color}12`,
        padding: "0.3rem 0.6rem", borderRadius: "6px", alignSelf: "flex-start",
      }}>
        {card.complexity}
      </div>
      <button
        onClick={() => onExplore(card.id)}
        style={{
          background: hovered ? card.color : "transparent",
          border: `1px solid ${card.color}`,
          color: hovered ? "#000" : card.color,
          borderRadius: "8px", padding: "0.5rem 1rem",
          cursor: "pointer", fontFamily: "'Syne', sans-serif",
          fontWeight: 700, fontSize: "0.85rem",
          transition: "all 0.2s",
        }}
      >
        Explore →
      </button>
    </div>
  );
}

function HomePage({ setView }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem", animation: "fadeInUp 0.6s ease both" }}>
        <div style={{
          display: "inline-block",
          fontFamily: "'Space Mono', monospace", fontSize: "0.75rem",
          color: COLORS.accent, border: `1px solid ${COLORS.accent}40`,
          padding: "0.3rem 0.8rem", borderRadius: "20px", marginBottom: "1.5rem",
          background: `${COLORS.accent}0a`,
        }}>
          INTERACTIVE DSA LEARNING PLATFORM
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1,
          marginBottom: "1rem",
        }}>
          Visualize Data Structures<br />
          <span style={{ color: COLORS.accent }}>Like Never Before</span>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: "1.05rem", maxWidth: "540px", margin: "0 auto" }}>
          Step-by-step animated visualizations of every major data structure.
          Learn through interaction, not memorization.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.2rem",
      }}>
        {DS_CARDS.map((card, i) => (
          <HomeCard key={card.id} card={card} idx={i} onExplore={setView} />
        ))}
      </div>
    </div>
  );
}

// ─── Controls Panel ────────────────────────────────────────────────────────────
function ControlPanel({ children, title, color = COLORS.accent }) {
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: "12px", padding: "1.2rem",
      display: "flex", flexDirection: "column", gap: "0.8rem",
    }}>
      <div style={{ fontWeight: 700, fontSize: "0.8rem", color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Btn({ onClick, color = COLORS.accent, children, disabled, small }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled ? color : `${color}18`,
        border: `1px solid ${color}`,
        color: hov && !disabled ? "#000" : color,
        borderRadius: "8px", padding: small ? "0.3rem 0.8rem" : "0.5rem 1rem",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        fontSize: small ? "0.75rem" : "0.85rem",
        transition: "all 0.15s",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: "8px", padding: "0.5rem 0.8rem",
        color: COLORS.text, fontFamily: "'Space Mono', monospace", fontSize: "0.85rem",
        outline: "none", width: "100%",
      }}
    />
  );
}

// ─── Speed / Step Controls ────────────────────────────────────────────────────
function SpeedControl({ speed, setSpeed, paused, setPaused }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
      <span style={{ color: COLORS.muted, fontSize: "0.75rem", fontFamily: "'Space Mono'" }}>
        Speed: {speed}x
      </span>
      <input
        type="range" min="0.5" max="3" step="0.5" value={speed}
        onChange={(e) => setSpeed(parseFloat(e.target.value))}
        style={{ width: "90px", accentColor: COLORS.accent }}
      />
      <Btn small onClick={() => setPaused((p) => !p)} color={paused ? COLORS.green : COLORS.yellow}>
        {paused ? "▶ Resume" : "⏸ Pause"}
      </Btn>
    </div>
  );
}

// ─── Code Panel ───────────────────────────────────────────────────────────────
function CodePanel({ code }) {
  return (
    <div style={{
      background: "#0d0d14", border: `1px solid ${COLORS.border}`,
      borderRadius: "12px", padding: "1rem",
      fontFamily: "'Space Mono', monospace", fontSize: "0.75rem",
      color: "#a8b2d8", lineHeight: 1.7, whiteSpace: "pre",
      overflowX: "auto",
    }}>
      <div style={{ color: COLORS.muted, fontSize: "0.65rem", marginBottom: "0.5rem" }}>CODE SNIPPET</div>
      {code}
    </div>
  );
}

// ─── Step Log ─────────────────────────────────────────────────────────────────
function StepLog({ steps }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [steps]);
  return (
    <div ref={ref} style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderRadius: "12px", padding: "0.8rem",
      maxHeight: "140px", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "0.3rem",
    }}>
      <div style={{ color: COLORS.muted, fontSize: "0.65rem", fontFamily: "'Space Mono'", marginBottom: "0.2rem" }}>
        STEP LOG
      </div>
      {steps.length === 0 && <div style={{ color: COLORS.muted, fontSize: "0.78rem" }}>No steps yet…</div>}
      {steps.map((s, i) => (
        <div key={i} style={{
          fontSize: "0.78rem", color: i === steps.length - 1 ? COLORS.green : COLORS.muted,
          fontFamily: "'Space Mono'",
        }}>
          <span style={{ color: COLORS.border }}>›</span> {s}
        </div>
      ))}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function DSLayout({ title, color, left, viz, code, steps, speed, setSpeed, paused, setPaused }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h2 style={{
        fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.3rem",
        borderLeft: `4px solid ${color}`, paddingLeft: "0.8rem",
      }}>
        {title}
      </h2>
      <SpeedControl speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused} />
      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "1.2rem", marginTop: "1.2rem",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {left}
          <CodePanel code={code} />
          <StepLog steps={steps} />
        </div>
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: "16px", padding: "1.5rem", minHeight: "460px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Grid bg */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(${COLORS.border} 1px, transparent 1px)`,
            backgroundSize: "28px 28px", opacity: 0.4, pointerEvents: "none",
          }} />
          {viz}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ARRAY VISUALIZATION
// ═══════════════════════════════════════════════════════════════
function ArrayViz() {
  const [dim, setDim] = useState("1D");
  const [arr, setArr] = useState([10, 25, 7, 42, 18, 33]);
  const [highlighted, setHighlighted] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [inputIdx, setInputIdx] = useState("");
  const [steps, setSteps] = useState([]);
  const [code, setCode] = useState(CODE_SNIPPETS.array.insert);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const addStep = (s) => setSteps((p) => [...p.slice(-20), s]);

  const highlight = async (indices, ms = 600) => {
    setHighlighted(indices);
    await sleep(ms / speed);
    setHighlighted([]);
  };

  const insert = async () => {
    if (animating) return;
    const val = parseInt(inputVal);
    const idx = inputIdx === "" ? arr.length : clamp(parseInt(inputIdx), 0, arr.length);
    if (isNaN(val)) return;
    setAnimating(true);
    setCode(CODE_SNIPPETS.array.insert);
    addStep(`Inserting ${val} at index ${idx}`);
    await highlight(Array.from({ length: arr.length - idx }, (_, i) => idx + i));
    setArr((a) => {
      const na = [...a];
      na.splice(idx, 0, val);
      return na;
    });
    await sleep(300 / speed);
    await highlight([idx]);
    addStep(`✓ ${val} inserted at index ${idx}`);
    setInputVal(""); setInputIdx("");
    setAnimating(false);
  };

  const del = async () => {
    if (animating || arr.length === 0) return;
    const idx = inputIdx === "" ? arr.length - 1 : clamp(parseInt(inputIdx), 0, arr.length - 1);
    if (isNaN(idx)) return;
    setAnimating(true);
    setCode(CODE_SNIPPETS.array.delete);
    addStep(`Deleting element at index ${idx} (value: ${arr[idx]})`);
    await highlight([idx]);
    setArr((a) => {
      const na = [...a];
      na.splice(idx, 1);
      return na;
    });
    addStep(`✓ Element at index ${idx} deleted`);
    setInputIdx("");
    setAnimating(false);
  };

  const color = COLORS.blue;

  const viz1D = (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", zIndex: 1 }}>
      {arr.map((v, i) => (
        <div key={i} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          animation: `popIn 0.3s ease both`,
        }}>
          <div style={{
            width: "58px", height: "58px",
            background: highlighted.includes(i) ? `${color}30` : COLORS.surface,
            border: `2px solid ${highlighted.includes(i) ? color : COLORS.border}`,
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Mono'", fontWeight: 700, fontSize: "1rem",
            color: highlighted.includes(i) ? color : COLORS.text,
            transition: "all 0.3s", boxShadow: highlighted.includes(i) ? `0 0 16px ${color}40` : "none",
          }}>{v}</div>
          <span style={{ fontSize: "0.65rem", color: COLORS.muted, fontFamily: "'Space Mono'" }}>{i}</span>
        </div>
      ))}
      {arr.length === 0 && <div style={{ color: COLORS.muted }}>Array is empty</div>}
    </div>
  );

  const viz2D = (() => {
    const rows = Math.ceil(Math.sqrt(arr.length)) || 1;
    const cols = Math.ceil(arr.length / rows);
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        row.push(idx < arr.length ? arr[idx] : null);
      }
      grid.push(row);
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", zIndex: 1 }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: "6px" }}>
            {row.map((v, c) => {
              const fi = r * cols + c;
              return v !== null ? (
                <div key={c} style={{
                  width: "50px", height: "50px",
                  background: highlighted.includes(fi) ? `${color}30` : COLORS.surface,
                  border: `2px solid ${highlighted.includes(fi) ? color : COLORS.border}`,
                  borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Space Mono'", fontSize: "0.85rem",
                  color: highlighted.includes(fi) ? color : COLORS.text,
                  transition: "all 0.3s",
                }}>
                  {v}
                </div>
              ) : <div key={c} style={{ width: "50px", height: "50px" }} />;
            })}
          </div>
        ))}
      </div>
    );
  })();

  return (
    <DSLayout
      title="Array" color={color} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused}
      steps={steps} code={code}
      left={<>
        <ControlPanel title="Dimension" color={color}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["1D", "2D"].map((d) => (
              <Btn key={d} onClick={() => setDim(d)} color={color} small>{d}</Btn>
            ))}
          </div>
        </ControlPanel>
        <ControlPanel title="Operations" color={color}>
          <Input value={inputVal} onChange={setInputVal} placeholder="Value" type="number" />
          <Input value={inputIdx} onChange={setInputIdx} placeholder="Index (optional)" type="number" />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Btn onClick={insert} color={color} disabled={animating}>Insert</Btn>
            <Btn onClick={del} color={COLORS.red} disabled={animating}>Delete</Btn>
          </div>
        </ControlPanel>
      </>}
      viz={dim === "1D" ? viz1D : viz2D}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// STACK VISUALIZATION
// ═══════════════════════════════════════════════════════════════
function StackViz() {
  const [stack, setStack] = useState([40, 20, 10]);
  const [inputVal, setInputVal] = useState("");
  const [highlighted, setHighlighted] = useState(null);
  const [steps, setSteps] = useState([]);
  const [code, setCode] = useState(CODE_SNIPPETS.stack.push);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [enterAnim, setEnterAnim] = useState(false);
  const [exitAnim, setExitAnim] = useState(false);

  const addStep = (s) => setSteps((p) => [...p.slice(-20), s]);
  const color = COLORS.green;

  const push = async () => {
    if (animating) return;
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    if (stack.length >= 8) { addStep("Stack overflow!"); return; }
    setAnimating(true); setCode(CODE_SNIPPETS.stack.push);
    addStep(`Pushing ${val} onto stack`);
    setEnterAnim(true);
    await sleep(300 / speed);
    setStack((s) => [...s, val]);
    setEnterAnim(false);
    setHighlighted(stack.length);
    await sleep(500 / speed);
    setHighlighted(null);
    addStep(`✓ ${val} is now top of stack`);
    setInputVal(""); setAnimating(false);
  };

  const pop = async () => {
    if (animating || stack.length === 0) return;
    setAnimating(true); setCode(CODE_SNIPPETS.stack.pop);
    const top = stack[stack.length - 1];
    addStep(`Popping ${top} from stack`);
    setHighlighted(stack.length - 1);
    await sleep(300 / speed);
    setExitAnim(true);
    await sleep(300 / speed);
    setStack((s) => s.slice(0, -1));
    setExitAnim(false); setHighlighted(null);
    addStep(`✓ ${top} popped from stack`);
    setAnimating(false);
  };

  const peek = async () => {
    if (stack.length === 0) return;
    setCode(CODE_SNIPPETS.stack.peek);
    setHighlighted(stack.length - 1);
    addStep(`Peek → top element is ${stack[stack.length - 1]}`);
    await sleep(800 / speed);
    setHighlighted(null);
  };

  return (
    <DSLayout
      title="Stack" color={color} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused}
      steps={steps} code={code}
      left={<>
        <ControlPanel title="Operations" color={color}>
          <Input value={inputVal} onChange={setInputVal} placeholder="Value to push" type="number" />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Btn onClick={push} color={color} disabled={animating}>Push</Btn>
            <Btn onClick={pop} color={COLORS.red} disabled={animating}>Pop</Btn>
            <Btn onClick={peek} color={COLORS.yellow} disabled={animating}>Peek</Btn>
          </div>
        </ControlPanel>
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: "10px", padding: "0.8rem", fontSize: "0.78rem",
          color: COLORS.muted, fontFamily: "'Space Mono'",
        }}>
          Size: {stack.length}/8<br />
          Top: {stack.length > 0 ? stack[stack.length - 1] : "—"}
        </div>
      </>}
      viz={
        <div style={{
          display: "flex", flexDirection: "column-reverse", gap: "6px",
          alignItems: "center", zIndex: 1, width: "100%",
        }}>
          {/* Base */}
          <div style={{
            width: "160px", height: "8px",
            background: color, borderRadius: "4px",
            boxShadow: `0 0 16px ${color}60`,
          }} />
          {stack.map((v, i) => (
            <div key={i} style={{
              width: "160px", height: "52px",
              background: highlighted === i ? `${color}30` : COLORS.surface,
              border: `2px solid ${highlighted === i ? color : COLORS.border}`,
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 1rem",
              fontFamily: "'Space Mono'", fontWeight: 700,
              color: highlighted === i ? color : COLORS.text,
              transition: "all 0.3s",
              boxShadow: highlighted === i ? `0 0 16px ${color}40` : "none",
              animation: i === stack.length - 1 && enterAnim ? "slideIn 0.3s ease" : "none",
            }}>
              <span>{v}</span>
              {i === stack.length - 1 && (
                <span style={{
                  fontSize: "0.6rem", background: `${color}20`,
                  border: `1px solid ${color}`, color, padding: "0.1rem 0.4rem",
                  borderRadius: "4px",
                }}>TOP</span>
              )}
            </div>
          ))}
          {stack.length === 0 && (
            <div style={{ color: COLORS.muted, fontSize: "0.9rem" }}>Stack is empty</div>
          )}
          <div style={{
            fontFamily: "'Space Mono'", fontSize: "0.65rem",
            color: COLORS.muted, marginTop: "0.5rem",
          }}>BOTTOM →</div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// QUEUE VISUALIZATION
// ═══════════════════════════════════════════════════════════════
function QueueViz() {
  const [queue, setQueue] = useState([5, 12, 8, 24]);
  const [inputVal, setInputVal] = useState("");
  const [highlighted, setHighlighted] = useState([]);
  const [steps, setSteps] = useState([]);
  const [code, setCode] = useState(CODE_SNIPPETS.queue.enqueue);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const addStep = (s) => setSteps((p) => [...p.slice(-20), s]);
  const color = COLORS.yellow;

  const enqueue = async () => {
    if (animating) return;
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    if (queue.length >= 8) { addStep("Queue is full!"); return; }
    setAnimating(true); setCode(CODE_SNIPPETS.queue.enqueue);
    addStep(`Enqueueing ${val} at rear`);
    setQueue((q) => [...q, val]);
    setHighlighted([queue.length]);
    await sleep(500 / speed);
    setHighlighted([]);
    addStep(`✓ ${val} added to rear`);
    setInputVal(""); setAnimating(false);
  };

  const dequeue = async () => {
    if (animating || queue.length === 0) return;
    setAnimating(true); setCode(CODE_SNIPPETS.queue.dequeue);
    const front = queue[0];
    addStep(`Dequeuing ${front} from front`);
    setHighlighted([0]);
    await sleep(400 / speed);
    setQueue((q) => q.slice(1));
    setHighlighted([]);
    addStep(`✓ ${front} removed from front`);
    setAnimating(false);
  };

  return (
    <DSLayout
      title="Queue" color={color} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused}
      steps={steps} code={code}
      left={<>
        <ControlPanel title="Operations" color={color}>
          <Input value={inputVal} onChange={setInputVal} placeholder="Value to enqueue" type="number" />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Btn onClick={enqueue} color={color} disabled={animating}>Enqueue</Btn>
            <Btn onClick={dequeue} color={COLORS.red} disabled={animating}>Dequeue</Btn>
          </div>
        </ControlPanel>
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: "10px", padding: "0.8rem", fontSize: "0.78rem",
          color: COLORS.muted, fontFamily: "'Space Mono'",
        }}>
          Size: {queue.length}/8<br />
          Front: {queue[0] ?? "—"} | Rear: {queue[queue.length - 1] ?? "—"}
        </div>
      </>}
      viz={
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", zIndex: 1, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
            {/* FRONT arrow */}
            {queue.length > 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                marginRight: "4px",
              }}>
                <div style={{
                  fontFamily: "'Space Mono'", fontSize: "0.6rem", color: COLORS.green,
                  background: `${COLORS.green}18`, border: `1px solid ${COLORS.green}`,
                  padding: "0.1rem 0.4rem", borderRadius: "4px", marginBottom: "4px",
                }}>FRONT</div>
                <div style={{ color: COLORS.green, fontSize: "1.2rem" }}>→</div>
              </div>
            )}
            {queue.map((v, i) => (
              <div key={i} style={{
                width: "58px", height: "58px",
                background: highlighted.includes(i)
                  ? (i === 0 ? `${COLORS.red}30` : `${color}30`)
                  : COLORS.surface,
                border: `2px solid ${highlighted.includes(i) ? (i === 0 ? COLORS.red : color) : COLORS.border}`,
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Space Mono'", fontWeight: 700, fontSize: "1rem",
                color: highlighted.includes(i) ? color : COLORS.text,
                transition: "all 0.3s",
                animation: i === queue.length - 1 ? "popIn 0.3s ease" : "none",
                boxShadow: highlighted.includes(i) ? `0 0 12px ${color}40` : "none",
              }}>{v}</div>
            ))}
            {queue.length === 0 && <div style={{ color: COLORS.muted }}>Queue is empty</div>}
            {queue.length > 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                marginLeft: "4px",
              }}>
                <div style={{
                  fontFamily: "'Space Mono'", fontSize: "0.6rem", color: color,
                  background: `${color}18`, border: `1px solid ${color}`,
                  padding: "0.1rem 0.4rem", borderRadius: "4px", marginBottom: "4px",
                }}>REAR</div>
                <div style={{ color: color, fontSize: "1.2rem" }}>←</div>
              </div>
            )}
          </div>
          <div style={{
            display: "flex", gap: "4px", alignItems: "center",
            color: COLORS.muted, fontSize: "0.75rem", fontFamily: "'Space Mono'",
          }}>
            <span style={{ color: COLORS.red }}>← Dequeue</span>
            <span style={{ margin: "0 8px" }}>|</span>
            <span style={{ color: color }}>Enqueue →</span>
          </div>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// LINKED LIST VISUALIZATION
// ═══════════════════════════════════════════════════════════════
function LinkedListViz() {
  const [list, setList] = useState([12, 25, 8, 37, 6]);
  const [highlighted, setHighlighted] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const addStep = (s) => setSteps((p) => [...p.slice(-20), s]);
  const color = COLORS.purple;

  const insertHead = async () => {
    if (animating) return;
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setAnimating(true);
    addStep(`Inserting ${val} at head`);
    setHighlighted([0]);
    await sleep(400 / speed);
    setList((l) => [val, ...l]);
    await sleep(400 / speed);
    setHighlighted([]);
    addStep(`✓ ${val} is new head`);
    setInputVal(""); setAnimating(false);
  };

  const insertTail = async () => {
    if (animating) return;
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setAnimating(true);
    addStep(`Traversing to tail, inserting ${val}`);
    for (let i = 0; i < list.length; i++) {
      setHighlighted([i]);
      await sleep(200 / speed);
    }
    setList((l) => [...l, val]);
    setHighlighted([list.length]);
    await sleep(400 / speed);
    setHighlighted([]);
    addStep(`✓ ${val} appended at tail`);
    setInputVal(""); setAnimating(false);
  };

  const deleteHead = async () => {
    if (animating || list.length === 0) return;
    setAnimating(true);
    addStep(`Deleting head node (${list[0]})`);
    setHighlighted([0]);
    await sleep(500 / speed);
    setList((l) => l.slice(1));
    setHighlighted([]);
    addStep(`✓ Head deleted`);
    setAnimating(false);
  };

  return (
    <DSLayout
      title="Linked List" color={color} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused}
      steps={steps}
      code={`// Insert at head: O(1)
function insertHead(head, val) {
  const node = new Node(val);
  node.next = head;
  return node;
}

// Insert at tail: O(n)
function insertTail(head, val) {
  const node = new Node(val);
  let cur = head;
  while (cur.next) cur = cur.next;
  cur.next = node;
}`}
      left={<>
        <ControlPanel title="Operations" color={color}>
          <Input value={inputVal} onChange={setInputVal} placeholder="Value" type="number" />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Btn onClick={insertHead} color={color} disabled={animating} small>+ Head</Btn>
            <Btn onClick={insertTail} color={color} disabled={animating} small>+ Tail</Btn>
            <Btn onClick={deleteHead} color={COLORS.red} disabled={animating} small>- Head</Btn>
          </div>
        </ControlPanel>
      </>}
      viz={
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0", zIndex: 1, justifyContent: "center" }}>
          <div style={{
            fontFamily: "'Space Mono'", fontSize: "0.65rem", color: color,
            background: `${color}18`, border: `1px solid ${color}`,
            padding: "0.2rem 0.5rem", borderRadius: "4px", marginRight: "4px",
          }}>HEAD</div>
          {list.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", borderRadius: "10px", overflow: "hidden",
                border: `2px solid ${highlighted.includes(i) ? color : COLORS.border}`,
                background: highlighted.includes(i) ? `${color}20` : COLORS.surface,
                transition: "all 0.3s",
                animation: i === 0 && list.length > 0 ? "popIn 0.35s ease" : "none",
                boxShadow: highlighted.includes(i) ? `0 0 14px ${color}50` : "none",
              }}>
                <div style={{
                  padding: "0.5rem 0.9rem",
                  fontFamily: "'Space Mono'", fontWeight: 700,
                  color: highlighted.includes(i) ? color : COLORS.text,
                  borderRight: `1px solid ${COLORS.border}`,
                }}>{v}</div>
                <div style={{
                  padding: "0.5rem 0.6rem",
                  fontFamily: "'Space Mono'", fontSize: "0.7rem",
                  color: COLORS.muted,
                }}>
                  {i < list.length - 1 ? "→" : "∅"}
                </div>
              </div>
              {i < list.length - 1 && (
                <div style={{ width: "18px", height: "2px", background: COLORS.border }} />
              )}
            </div>
          ))}
          {list.length === 0 && <div style={{ color: COLORS.muted }}>List is empty (NULL)</div>}
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// TREE VISUALIZATION
// ═══════════════════════════════════════════════════════════════
class BSTNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

function bstInsert(root, val) {
  if (!root) return new BSTNode(val);
  if (val < root.val) root.left = bstInsert(root.left, val);
  else if (val > root.val) root.right = bstInsert(root.right, val);
  return root;
}

function bstToArray(root) {
  if (!root) return [];
  const result = [];
  const queue = [{ node: root, x: 0, y: 0, level: 0, parentX: null, parentY: null }];
  const positions = new Map();
  const levelWidths = {};

  // Compute positions
  const assignPos = (node, x, y, spread) => {
    if (!node) return;
    positions.set(node, { x, y });
    assignPos(node.left, x - spread, y + 80, spread / 2);
    assignPos(node.right, x + spread, y + 80, spread / 2);
  };
  assignPos(root, 200, 40, 100);

  const collect = (node) => {
    if (!node) return;
    const pos = positions.get(node);
    const leftPos = node.left ? positions.get(node.left) : null;
    const rightPos = node.right ? positions.get(node.right) : null;
    result.push({ node, ...pos, leftPos, rightPos });
    collect(node.left);
    collect(node.right);
  };
  collect(root);
  return result;
}

function getTraversal(root, type) {
  const res = [];
  const inorder = (n) => { if (!n) return; inorder(n.left); res.push(n.val); inorder(n.right); };
  const preorder = (n) => { if (!n) return; res.push(n.val); preorder(n.left); preorder(n.right); };
  const postorder = (n) => { if (!n) return; postorder(n.left); postorder(n.right); res.push(n.val); };
  if (type === "inorder") inorder(root);
  if (type === "preorder") preorder(root);
  if (type === "postorder") postorder(root);
  return res;
}

function TreeViz() {
  const [root, setRoot] = useState(() => {
    let r = null;
    for (const v of [40, 20, 60, 10, 30, 50, 70]) r = bstInsert(r, v);
    return r;
  });
  const [inputVal, setInputVal] = useState("");
  const [highlighted, setHighlighted] = useState(new Set());
  const [steps, setSteps] = useState([]);
  const [code, setCode] = useState(CODE_SNIPPETS.bst.insert);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [traversalResult, setTraversalResult] = useState([]);

  const addStep = (s) => setSteps((p) => [...p.slice(-20), s]);
  const color = COLORS.accent;

  const insertNode = () => {
    if (animating) return;
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setCode(CODE_SNIPPETS.bst.insert);
    addStep(`Inserting ${val} into BST`);
    setRoot((r) => bstInsert(r ? JSON.parse(JSON.stringify(r)) : null, val));
    addStep(`✓ ${val} inserted`);
    setInputVal("");
  };

  const traverse = async (type) => {
    if (animating || !root) return;
    setAnimating(true);
    setCode(CODE_SNIPPETS.bst.inorder);
    addStep(`Starting ${type} traversal`);
    const order = getTraversal(root, type);
    setTraversalResult(order);
    for (const val of order) {
      setHighlighted(new Set([val]));
      addStep(`Visit: ${val}`);
      await sleep(600 / speed);
    }
    setHighlighted(new Set());
    addStep(`✓ Traversal: [${order.join(", ")}]`);
    setAnimating(false);
  };

  const nodes = root ? bstToArray(root) : [];

  return (
    <DSLayout
      title="Binary Search Tree" color={color} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused}
      steps={steps} code={code}
      left={<>
        <ControlPanel title="Insert" color={color}>
          <Input value={inputVal} onChange={setInputVal} placeholder="Value" type="number" />
          <Btn onClick={insertNode} color={color} disabled={animating}>Insert Node</Btn>
          <Btn onClick={() => { setRoot(null); setTraversalResult([]); }} color={COLORS.red} small disabled={animating}>Clear Tree</Btn>
        </ControlPanel>
        <ControlPanel title="Traversal" color={color}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {["inorder", "preorder", "postorder"].map((t) => (
              <Btn key={t} onClick={() => traverse(t)} color={COLORS.purple} disabled={animating} small>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Btn>
            ))}
          </div>
          {traversalResult.length > 0 && (
            <div style={{
              fontFamily: "'Space Mono'", fontSize: "0.65rem", color: COLORS.green,
              padding: "0.4rem", background: `${COLORS.green}10`, borderRadius: "6px",
            }}>
              [{traversalResult.join(" → ")}]
            </div>
          )}
        </ControlPanel>
      </>}
      viz={
        <svg width="400" height="320" style={{ zIndex: 1, overflow: "visible" }}>
          {nodes.map(({ node, x, y, leftPos, rightPos }) => (
            <g key={node.val}>
              {leftPos && (
                <line x1={x} y1={y} x2={leftPos.x} y2={leftPos.y}
                  stroke={COLORS.border} strokeWidth="2" />
              )}
              {rightPos && (
                <line x1={x} y1={y} x2={rightPos.x} y2={rightPos.y}
                  stroke={COLORS.border} strokeWidth="2" />
              )}
            </g>
          ))}
          {nodes.map(({ node, x, y }) => (
            <g key={`n-${node.val}`}>
              <circle cx={x} cy={y} r={22}
                fill={highlighted.has(node.val) ? `${color}30` : COLORS.surface}
                stroke={highlighted.has(node.val) ? color : COLORS.border}
                strokeWidth="2"
                style={{ transition: "all 0.3s", filter: highlighted.has(node.val) ? `drop-shadow(0 0 8px ${color})` : "none" }}
              />
              <text x={x} y={y + 5} textAnchor="middle"
                fill={highlighted.has(node.val) ? color : COLORS.text}
                fontFamily="Space Mono" fontWeight="700" fontSize="13"
                style={{ transition: "all 0.3s" }}
              >{node.val}</text>
            </g>
          ))}
          {!root && (
            <text x="200" y="160" textAnchor="middle" fill={COLORS.muted} fontFamily="Syne" fontSize="14">
              Tree is empty — insert nodes
            </text>
          )}
        </svg>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// GRAPH VISUALIZATION
// ═══════════════════════════════════════════════════════════════
const INITIAL_NODES = [
  { id: "A", x: 200, y: 80 },
  { id: "B", x: 80, y: 200 },
  { id: "C", x: 320, y: 200 },
  { id: "D", x: 80, y: 320 },
  { id: "E", x: 200, y: 320 },
];
const INITIAL_EDGES = [["A","B"],["A","C"],["B","D"],["B","E"],["C","E"]];

function GraphViz() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [nodeInput, setNodeInput] = useState("");
  const [edgeSrc, setEdgeSrc] = useState("");
  const [edgeDst, setEdgeDst] = useState("");
  const [highlighted, setHighlighted] = useState(new Set());
  const [traversedEdges, setTraversedEdges] = useState(new Set());
  const [steps, setSteps] = useState([]);
  const [code, setCode] = useState(CODE_SNIPPETS.graph.bfs);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const svgRef = useRef();
  const dragging = useRef(null);

  const addStep = (s) => setSteps((p) => [...p.slice(-20), s]);
  const color = COLORS.red;

  const buildAdj = useCallback(() => {
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach(([s, d]) => {
      adj[s]?.push(d); adj[d]?.push(s);
    });
    return adj;
  }, [nodes, edges]);

  const addNode = () => {
    const id = nodeInput.trim().toUpperCase();
    if (!id || nodes.find((n) => n.id === id)) return;
    const x = 100 + Math.random() * 220;
    const y = 80 + Math.random() * 240;
    setNodes((n) => [...n, { id, x, y }]);
    addStep(`Added node ${id}`);
    setNodeInput("");
  };

  const addEdge = () => {
    const s = edgeSrc.trim().toUpperCase(), d = edgeDst.trim().toUpperCase();
    if (!s || !d || s === d) return;
    if (!nodes.find((n) => n.id === s) || !nodes.find((n) => n.id === d)) {
      addStep(`Node not found!`); return;
    }
    if (edges.find(([a, b]) => (a === s && b === d) || (a === d && b === s))) {
      addStep("Edge already exists"); return;
    }
    setEdges((e) => [...e, [s, d]]);
    addStep(`Added edge ${s} — ${d}`);
    setEdgeSrc(""); setEdgeDst("");
  };

  const bfs = async () => {
    if (animating || nodes.length === 0) return;
    setAnimating(true); setCode(CODE_SNIPPETS.graph.bfs);
    const start = nodes[0].id;
    const adj = buildAdj();
    const visited = new Set([start]);
    const queue = [start];
    const newHigh = new Set();
    const newEdges = new Set();
    addStep(`BFS from ${start}`);
    while (queue.length) {
      const node = queue.shift();
      newHigh.add(node);
      setHighlighted(new Set(newHigh));
      addStep(`Visiting: ${node}`);
      await sleep(600 / speed);
      for (const nbr of adj[node] || []) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push(nbr);
          const ek = [node, nbr].sort().join("-");
          newEdges.add(ek);
          setTraversedEdges(new Set(newEdges));
        }
      }
    }
    addStep(`✓ BFS order: ${[...newHigh].join(" → ")}`);
    await sleep(1000);
    setHighlighted(new Set()); setTraversedEdges(new Set());
    setAnimating(false);
  };

  const dfs = async () => {
    if (animating || nodes.length === 0) return;
    setAnimating(true); setCode(CODE_SNIPPETS.graph.dfs);
    const start = nodes[0].id;
    const adj = buildAdj();
    const visited = new Set();
    const newHigh = new Set();
    const newEdges = new Set();
    addStep(`DFS from ${start}`);

    const dfsVisit = async (node) => {
      visited.add(node);
      newHigh.add(node);
      setHighlighted(new Set(newHigh));
      addStep(`Visiting: ${node}`);
      await sleep(600 / speed);
      for (const nbr of adj[node] || []) {
        if (!visited.has(nbr)) {
          const ek = [node, nbr].sort().join("-");
          newEdges.add(ek);
          setTraversedEdges(new Set(newEdges));
          await dfsVisit(nbr);
        }
      }
    };

    await dfsVisit(start);
    addStep(`✓ DFS order: ${[...newHigh].join(" → ")}`);
    await sleep(1000);
    setHighlighted(new Set()); setTraversedEdges(new Set());
    setAnimating(false);
  };

  // Dragging
  const onMouseDown = (e, id) => {
    e.preventDefault();
    dragging.current = id;
  };
  const onMouseMove = (e) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setNodes((ns) => ns.map((n) => n.id === dragging.current ? { ...n, x, y } : n));
  };
  const onMouseUp = () => { dragging.current = null; };

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <DSLayout
      title="Graph" color={color} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused}
      steps={steps} code={code}
      left={<>
        <ControlPanel title="Add Node" color={color}>
          <Input value={nodeInput} onChange={setNodeInput} placeholder="Node label (e.g. F)" />
          <Btn onClick={addNode} color={color} disabled={animating}>Add Node</Btn>
        </ControlPanel>
        <ControlPanel title="Add Edge" color={color}>
          <Input value={edgeSrc} onChange={setEdgeSrc} placeholder="From node" />
          <Input value={edgeDst} onChange={setEdgeDst} placeholder="To node" />
          <Btn onClick={addEdge} color={COLORS.purple} disabled={animating}>Add Edge</Btn>
        </ControlPanel>
        <ControlPanel title="Algorithms" color={color}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Btn onClick={bfs} color={COLORS.blue} disabled={animating}>BFS</Btn>
            <Btn onClick={dfs} color={COLORS.green} disabled={animating}>DFS</Btn>
          </div>
          <div style={{ fontSize: "0.7rem", color: COLORS.muted, fontFamily: "'Space Mono'" }}>
            Drag nodes to rearrange
          </div>
        </ControlPanel>
      </>}
      viz={
        <svg
          ref={svgRef}
          width="400" height="360"
          style={{ zIndex: 1, cursor: dragging.current ? "grabbing" : "default", overflow: "visible" }}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Edges */}
          {edges.map(([s, d], i) => {
            const sn = nodeMap[s], dn = nodeMap[d];
            if (!sn || !dn) return null;
            const ek = [s, d].sort().join("-");
            const isTraversed = traversedEdges.has(ek);
            return (
              <line key={i}
                x1={sn.x} y1={sn.y} x2={dn.x} y2={dn.y}
                stroke={isTraversed ? COLORS.green : COLORS.border}
                strokeWidth={isTraversed ? 3 : 2}
                style={{ transition: "stroke 0.3s", filter: isTraversed ? `drop-shadow(0 0 6px ${COLORS.green})` : "none" }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((n) => (
            <g key={n.id} onMouseDown={(e) => onMouseDown(e, n.id)} style={{ cursor: "grab" }}>
              {highlighted.has(n.id) && (
                <circle cx={n.x} cy={n.y} r={28} fill="none"
                  stroke={COLORS.green} strokeWidth="2" opacity="0.5"
                  style={{ animation: "bfsWave 0.8s ease-out" }}
                />
              )}
              <circle cx={n.x} cy={n.y} r={22}
                fill={highlighted.has(n.id) ? `${COLORS.green}25` : COLORS.surface}
                stroke={highlighted.has(n.id) ? COLORS.green : color}
                strokeWidth="2"
                style={{ transition: "all 0.3s", filter: highlighted.has(n.id) ? `drop-shadow(0 0 8px ${COLORS.green})` : "none" }}
              />
              <text x={n.x} y={n.y + 5} textAnchor="middle"
                fill={highlighted.has(n.id) ? COLORS.green : COLORS.text}
                fontFamily="Space Mono" fontWeight="700" fontSize="13"
                style={{ pointerEvents: "none", transition: "fill 0.3s" }}
              >{n.id}</text>
            </g>
          ))}
        </svg>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
const VIEW_MAP = {
  home: HomePage,
  array: ArrayViz,
  stack: StackViz,
  queue: QueueViz,
  linkedlist: LinkedListViz,
  tree: TreeViz,
  graph: GraphViz,
};

export default function Homepage() {
  const [view, setView] = useState("home");

  const View = VIEW_MAP[view] || HomePage;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh" }}>
        <Header view={view} setView={setView} />
        <View setView={setView} />
      </div>
    </>
  );
}