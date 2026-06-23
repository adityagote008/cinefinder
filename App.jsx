import { useState, useRef, useEffect } from "react";

// ── Gemini API Key ───────────────────────────────────────────────────────────
const GEMINI_KEY = (() => {
  // 1. Vercel env var (set in Vercel dashboard)
  try { if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY; } catch(e) {}
  // 2. index.html window variable
  try { if (window.__GEMINI_KEY__) return window.__GEMINI_KEY__; } catch(e) {}
  return "";
})();
const IS_CLAUDE_ENV = !GEMINI_KEY;

const MOODS = ["Happy","Sad","Emotional","Romantic","Motivational","Dark","Mind Blowing","Family","Horror Night","Weekend Chill","Feel Good","Cozy","Action Packed","Suspense","Comedy","Cry Worthy","Inspirational","Thriller","Mystery","Adventure"];
const GENRES = ["Action","Adventure","Comedy","Crime","Drama","Fantasy","History","Horror","Mystery","Romance","Sci-Fi","Thriller","War","Animation","Documentary","Sports","Musical","Western"];
const CATEGORIES = ["Movie","TV Series","Anime","Mini Series","Web Series","Classic","Latest","Underrated","Cult Classic","Award Winning","Hidden Gem","International","Hollywood","Korean","Japanese","Indian","European"];
const STYLES = ["Fast Paced","Slow Burn","Cinematic","Visually Stunning","Psychological","Twist Ending","Dark","Wholesome","Emotional","Intelligent","Character Driven","Epic","Realistic","Non Linear"];

const QUICK_PICKS = [
  { emoji:"🔥", label:"Action Packed", mood:"Action Packed", color:"#FF6B35" },
  { emoji:"🧠", label:"Mind Blowing", mood:"Mind Blowing", color:"#A855F7" },
  { emoji:"😂", label:"Comedy", mood:"Comedy", color:"#F59E0B" },
  { emoji:"💀", label:"Horror Night", mood:"Horror Night", color:"#10B981" },
  { emoji:"❤️", label:"Romantic", mood:"Romantic", color:"#EC4899" },
  { emoji:"🌌", label:"Sci-Fi", mood:"Mind Blowing", color:"#3B82F6" },
];

const GENRE_EMOJIS = { Action:"⚡", Adventure:"🗺️", Comedy:"😂", Crime:"🔍", Drama:"🎭", Fantasy:"🧙", History:"📜", Horror:"👻", Mystery:"🕵️", Romance:"❤️", "Sci-Fi":"🚀", Thriller:"😰", War:"⚔️", Animation:"✨", Documentary:"📽️", Sports:"🏆", Musical:"🎵", Western:"🤠" };

// ── Inline CSS ──────────────────────────────────────────────────────────────
const css = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#080808;}
  ::-webkit-scrollbar{display:none;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(229,9,20,0.3)}50%{box-shadow:0 0 40px rgba(229,9,20,0.6)}}
  @keyframes cardIn{from{opacity:0;transform:translateY(30px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes dotBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .chip{transition:all 0.18s ease;user-select:none;}
  .chip:active{transform:scale(0.93);}
  .card-in{animation:cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;}
  .btn-press:active{transform:scale(0.97);opacity:0.9;}
`;

// ── Helpers ─────────────────────────────────────────────────────────────────
function Chip({ label, emoji, selected, onClick, color }) {
  return (
    <button className="chip" onClick={onClick} style={{
      padding:"7px 14px", borderRadius:"22px",
      border: selected ? `1.5px solid ${color||"#E50914"}` : "1.5px solid rgba(255,255,255,0.08)",
      background: selected ? `${color||"#E50914"}22` : "rgba(255,255,255,0.03)",
      color: selected ? (color||"#FF4D57") : "#888",
      fontSize:"12px", fontWeight: selected?700:400,
      cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit",
      display:"flex", alignItems:"center", gap:"5px",
    }}>
      {emoji && <span style={{fontSize:"13px"}}>{emoji}</span>}
      {label}
    </button>
  );
}

function Section({ title, icon, items, selected, onToggle, emojiMap }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, 9);
  return (
    <div style={{marginBottom:"24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
        <span style={{fontSize:"16px"}}>{icon}</span>
        <span style={{color:"#555",fontSize:"10px",letterSpacing:"1.8px",textTransform:"uppercase",fontWeight:700}}>{title}</span>
        {selected.length > 0 && (
          <span style={{background:"#E50914",color:"#fff",fontSize:"10px",fontWeight:700,borderRadius:"10px",padding:"1px 7px",marginLeft:"auto"}}>{selected.length}</span>
        )}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
        {shown.map(item => (
          <Chip key={item} label={item} emoji={emojiMap?.[item]} selected={selected.includes(item)} onClick={()=>onToggle(item)} />
        ))}
        {items.length > 9 && (
          <button onClick={()=>setOpen(!open)} style={{
            padding:"7px 14px",borderRadius:"22px",border:"1.5px dashed #2a2a2a",
            background:"transparent",color:"#444",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"
          }}>{open?"▲ less":`+${items.length-9}`}</button>
        )}
      </div>
    </div>
  );
}

// ── Skeleton Card ────────────────────────────────────────────────────────────
function Skeleton({ delay=0 }) {
  return (
    <div style={{borderRadius:"20px",overflow:"hidden",border:"1px solid #1c1c1c",marginBottom:"16px",animationDelay:`${delay}s`,animation:"cardIn 0.4s ease both"}}>
      <div style={{height:"260px",background:"linear-gradient(90deg,#161616 25%,#1e1e1e 50%,#161616 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>
      <div style={{padding:"16px",background:"#111",display:"flex",flexDirection:"column",gap:"10px"}}>
        <div style={{height:"18px",background:"#1c1c1c",borderRadius:"6px",width:"65%"}}/>
        <div style={{height:"12px",background:"#181818",borderRadius:"4px",width:"40%"}}/>
        <div style={{height:"50px",background:"#181818",borderRadius:"10px"}}/>
      </div>
    </div>
  );
}

// ── Movie Card ───────────────────────────────────────────────────────────────
function MovieCard({ rec, index }) {
  const [imgErr, setImgErr] = useState(false);
  const colors = ["#E50914","#A855F7","#3B82F6","#F59E0B","#10B981"];
  const accent = colors[index % colors.length];
  const stars = Math.round((rec.vote_average||7)/2);

  return (
    <div className="card-in" style={{
      borderRadius:"20px",overflow:"hidden",
      border:`1px solid ${accent}22`,
      marginBottom:"16px",
      background:"linear-gradient(160deg,#141414,#0e0e0e)",
      boxShadow:`0 8px 32px ${accent}18`,
      animationDelay:`${index*0.08}s`,
    }}>
      {/* Poster */}
      <div style={{position:"relative",width:"100%",aspectRatio:"16/9",overflow:"hidden",background:"#0a0a0a"}}>
        {!imgErr && rec.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`}
            alt={rec.title}
            onError={()=>setImgErr(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          />
        ) : (
          <div style={{
            width:"100%",height:"100%",display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:"10px",
            background:`linear-gradient(135deg,${accent}18,#0a0a0a)`,
          }}>
            <span style={{fontSize:"44px"}}>🎬</span>
            <span style={{color:"#333",fontSize:"12px",textAlign:"center",padding:"0 20px"}}>{rec.title}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(14,14,14,0.98))"}}/>
        {/* Rank badge */}
        <div style={{position:"absolute",top:"12px",left:"12px",
          background:accent,color:"#fff",fontSize:"11px",fontWeight:800,
          padding:"4px 10px",borderRadius:"8px",letterSpacing:"0.5px"
        }}>#{index+1}</div>
        {/* Rating */}
        <div style={{position:"absolute",top:"12px",right:"12px",
          background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.1)",
          padding:"5px 10px",borderRadius:"10px",
          display:"flex",alignItems:"center",gap:"5px"
        }}>
          <span style={{color:"#FFC107",fontSize:"12px"}}>⭐</span>
          <span style={{color:"#fff",fontSize:"13px",fontWeight:700}}>{rec.vote_average?.toFixed(1)||"?"}</span>
        </div>
        {/* Title overlay */}
        <div style={{position:"absolute",bottom:"14px",left:"14px",right:"14px"}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:800,lineHeight:1.25,letterSpacing:"-0.3px",marginBottom:"4px",textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{rec.title}</h3>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
            <span style={{color:"#aaa",fontSize:"11px"}}>{rec.year}</span>
            {rec.runtime && <><span style={{color:"#333"}}>•</span><span style={{color:"#aaa",fontSize:"11px"}}>{rec.runtime}</span></>}
            {rec.language && <><span style={{color:"#333"}}>•</span><span style={{color:"#aaa",fontSize:"11px"}}>{rec.language}</span></>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{padding:"14px"}}>
        {/* Genres */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
          {rec.genres?.slice(0,4).map(g=>(
            <span key={g} style={{
              background:`${accent}15`,border:`1px solid ${accent}30`,
              color:accent,fontSize:"10px",fontWeight:600,
              padding:"3px 10px",borderRadius:"12px",letterSpacing:"0.3px"
            }}>{g}</span>
          ))}
        </div>

        {/* Overview */}
        <p style={{color:"#999",fontSize:"13px",lineHeight:1.65,marginBottom:"12px"}}>{rec.overview}</p>

        {/* Why Watch box */}
        <div style={{
          background:`${accent}0d`,border:`1px solid ${accent}25`,
          borderRadius:"12px",padding:"12px 14px",marginBottom:"12px"
        }}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"6px"}}>
            <span style={{fontSize:"13px"}}>💡</span>
            <span style={{color:accent,fontSize:"10px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>Why You'll Love It</span>
          </div>
          <p style={{color:"#ccc",fontSize:"12.5px",lineHeight:1.6}}>{rec.why_watch}</p>
        </div>

        {/* Perfect for */}
        {rec.perfect_for?.length > 0 && (
          <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
            {rec.perfect_for.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{color:accent,fontSize:"13px"}}>✓</span>
                <span style={{color:"#777",fontSize:"12px"}}>{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  const [msg, setMsg] = useState(0);
  const msgs = ["Scanning 10,000+ titles...","Matching your vibe...","Curating hidden gems...","Almost ready..."];
  useEffect(()=>{
    const t = setInterval(()=>setMsg(m=>(m+1)%msgs.length),1200);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:200,
      background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"20px",
    }}>
      <div style={{position:"relative",width:"80px",height:"80px"}}>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          border:"2px solid #1a1a1a",
          borderTop:"2px solid #E50914",
          animation:"spin 0.9s linear infinite",
        }}/>
        <div style={{
          position:"absolute",inset:"12px",borderRadius:"50%",
          border:"2px solid #1a1a1a",
          borderTop:"2px solid #A855F7",
          animation:"spin 1.4s linear infinite reverse",
        }}/>
        <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px"}}>🎬</span>
      </div>
      <div style={{textAlign:"center"}}>
        <p style={{color:"#fff",fontSize:"16px",fontWeight:700,marginBottom:"8px"}}>Finding Your Perfect Watch</p>
        <p style={{color:"#555",fontSize:"13px",animation:"pulse 1.2s ease infinite",minHeight:"20px"}}>{msgs[msg]}</p>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width:"8px",height:"8px",borderRadius:"50%",background:"#E50914",
            animation:`dotBounce 0.8s ease ${i*0.15}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function CineFinder() {
  const [screen, setScreen] = useState("home");
  const [mood, setMood] = useState([]);
  const [genre, setGenre] = useState([]);
  const [category, setCategory] = useState([]);
  const [style, setStyle] = useState([]);
  const [freeText, setFreeText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [error, setError] = useState("");
  const seen = useRef(new Set());

  function tog(arr, set, val) { set(p=>p.includes(val)?p.filter(x=>x!==val):[...p,val]); }
  const hasFilters = mood.length||genre.length||category.length||style.length||freeText.trim();
  const totalSelected = mood.length+genre.length+category.length+style.length;

  function reset() {
    setMood([]); setGenre([]); setCategory([]); setStyle([]); setFreeText("");
    setResults([]); setError(""); setScreen("home"); seen.current=new Set();
  }

  async function getRecommendations(isMore=false) {
    if (!hasFilters) return;
    isMore ? setLoadMore(true) : setLoading(true);
    setError("");
    if (!isMore) { setResults([]); setScreen("results"); }

    const exclude = [...seen.current].slice(-20).join(", ");
    const prompt = `You are CineFinder. Recommend exactly 5 movies or TV series.

Filters:
Mood: ${mood.join(", ")||"any"}
Genre: ${genre.join(", ")||"any"}
Category: ${category.join(", ")||"any"}
Style: ${style.join(", ")||"any"}
Custom: ${freeText||"none"}
${exclude?`Skip these: ${exclude}`:""}

Rules: Mix 3 popular + 2 underrated. Min IMDb 7.0. No spoilers.

Return ONLY a raw JSON array of 5 objects. Each object on its own line inside the array:
[
{"title":"","year":"","vote_average":8.2,"runtime":"","language":"English","genres":[],"overview":"2 sentence spoiler-free hook.","why_watch":"1 punchy sentence why it matches.","perfect_for":["",""],"poster_path":""},
...
]
poster_path = real TMDB path like /abc123.jpg or ""`;

    try {
      const apiKey = GEMINI_KEY;

      // ── Use Anthropic API when running inside Claude.ai (no key needed) ──────
      // ── Use Gemini API when deployed on Vercel (free, set window.__GEMINI_KEY__) ─
      const useAnthropic = !apiKey;

      const res = await fetch(
        useAnthropic
          ? "https://api.anthropic.com/v1/messages"
          : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(useAnthropic ? {} : {}),
          },
          body: useAnthropic
            ? JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 1500,
                stream: true,
                system: "You are a movie recommendation expert. Always respond with only a valid JSON array. No markdown, no explanation, no backticks.",
                messages: [{ role: "user", content: prompt }],
              })
            : JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                systemInstruction: {
                  parts: [{ text: "You are a movie recommendation expert. Always respond with only a valid JSON array. No markdown, no explanation, no backticks." }]
                },
                generationConfig: { temperature: 0.8, maxOutputTokens: 1500 },
              }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      const addedTitles = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const evt = JSON.parse(jsonStr);
            // Anthropic format: evt.delta.text | Gemini format: evt.candidates[0].content.parts[0].text
            const chunk = useAnthropic
              ? (evt?.delta?.text || "")
              : (evt?.candidates?.[0]?.content?.parts?.[0]?.text || "");
            if (!chunk) continue;
            fullText += chunk;

            // Parse each complete JSON object as it streams in → card pops instantly
            const objRegex = /\{[^{}]*"title"[^{}]*\}/g;
            let m;
            while ((m = objRegex.exec(fullText)) !== null) {
              try {
                const obj = JSON.parse(m[0]);
                if (obj.title && !addedTitles.includes(obj.title)) {
                  addedTitles.push(obj.title);
                  seen.current.add(obj.title);
                  setLoading(false);
                  setResults(p => [...p, obj]);
                }
              } catch {}
            }
          } catch {}
        }
      }

      // Fallback: full array parse if streaming missed anything
      const arrMatch = fullText.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        try {
          const parsed = JSON.parse(arrMatch[0]);
          const newOnes = parsed.filter(r => !addedTitles.includes(r.title));
          newOnes.forEach(r => seen.current.add(r.title));
          if (newOnes.length) setResults(p => [...p, ...newOnes]);
        } catch {}
      }

      if (addedTitles.length === 0) throw new Error("No results returned. Please try again.");

    } catch(e) {
      setError(e.message || "Couldn't load recommendations. Please try again.");
      console.error(e);
    } finally {
      setLoading(false); setLoadMore(false);
    }
  }

  return (
    <div style={{
      minHeight:"100vh", maxWidth:"430px", margin:"0 auto",
      background:"#080808", fontFamily:"'Inter',-apple-system,sans-serif",
      color:"#fff", position:"relative", overflowX:"hidden",
    }}>
      <style>{css}</style>
      {loading && screen==="filters" && <LoadingScreen />}

      {/* ── HEADER ── */}
      <div style={{
        position:"sticky",top:0,zIndex:100,
        background:"rgba(8,8,8,0.92)",backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        padding:"13px 16px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{
            width:"32px",height:"32px",borderRadius:"10px",
            background:"linear-gradient(135deg,#E50914,#a00610)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"
          }}>🎬</div>
          <div>
            <span style={{fontSize:"17px",fontWeight:800,letterSpacing:"-0.5px"}}>
              Cine<span style={{color:"#E50914"}}>Finder</span>
            </span>
            <span style={{
              display:"block",fontSize:"9px",color:"#aaa",letterSpacing:"1.5px",
              textTransform:"uppercase",fontWeight:700,marginTop:"1px"
            }}>by <span style={{color:"#E50914",fontWeight:900}}>ASG</span></span>
          </div>
        </div>
        {screen!=="home" && (
          <button className="btn-press" onClick={reset} style={{
            background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",
            color:"#888",padding:"6px 14px",borderRadius:"20px",fontSize:"12px",
            cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"5px"
          }}>✕ Reset</button>
        )}
      </div>

      {/* ══════════════ HOME ══════════════ */}
      {screen==="home" && (
        <div style={{padding:"24px 16px 40px",animation:"fadeUp 0.4s ease"}}>
          {/* Hero */}
          <div style={{
            background:"linear-gradient(135deg,#1a0505,#0a0a0a)",
            border:"1px solid #1a0a0a",borderRadius:"24px",
            padding:"28px 20px",textAlign:"center",marginBottom:"28px",
            position:"relative",overflow:"hidden",
          }}>
            <div style={{
              position:"absolute",top:"-30px",left:"50%",transform:"translateX(-50%)",
              width:"200px",height:"200px",borderRadius:"50%",
              background:"radial-gradient(circle,rgba(229,9,20,0.12),transparent 70%)",
              pointerEvents:"none",
            }}/>
            <div style={{fontSize:"48px",marginBottom:"14px",lineHeight:1}}>🎬</div>
            <h1 style={{fontSize:"24px",fontWeight:900,margin:"0 0 8px",letterSpacing:"-0.5px",lineHeight:1.2}}>
              Discover Your<br/><span style={{color:"#E50914"}}>Perfect Watch</span>
            </h1>
            <p style={{color:"#555",fontSize:"13px",lineHeight:1.6}}>AI-powered recommendations<br/>tailored to your exact vibe</p>
          </div>

          {/* Quick picks */}
          <p style={{color:"#444",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:700,marginBottom:"14px"}}>Quick Pick</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"28px"}}>
            {QUICK_PICKS.map(q=>(
              <button key={q.label} className="btn-press"
                onClick={()=>{setMood([q.mood]);setScreen("filters");}}
                style={{
                  background:`linear-gradient(135deg,${q.color}18,${q.color}08)`,
                  border:`1px solid ${q.color}30`,borderRadius:"16px",
                  padding:"16px 14px",textAlign:"left",cursor:"pointer",fontFamily:"inherit",
                }}
              >
                <div style={{fontSize:"24px",marginBottom:"6px"}}>{q.emoji}</div>
                <div style={{color:"#e0e0e0",fontSize:"13px",fontWeight:700,marginBottom:"2px"}}>{q.label}</div>
              </button>
            ))}
          </div>

          <button className="btn-press" onClick={()=>setScreen("filters")} style={{
            width:"100%",background:"linear-gradient(135deg,#E50914,#a00610)",
            color:"#fff",border:"none",borderRadius:"16px",
            padding:"17px",fontSize:"15px",fontWeight:800,
            cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.2px",
            boxShadow:"0 4px 20px rgba(229,9,20,0.3)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
          }}>
            <span>🎯</span> Custom Filters
          </button>

          {/* ── Footer ── */}
          <div style={{marginTop:"40px",paddingBottom:"8px"}}>
            <div style={{
              background:"linear-gradient(135deg,rgba(229,9,20,0.1),rgba(229,9,20,0.04))",
              border:"1px solid rgba(229,9,20,0.25)",
              borderRadius:"20px",padding:"18px 20px",
              display:"flex",alignItems:"center",gap:"14px",
            }}>
              {/* Avatar */}
              <div style={{
                width:"46px",height:"46px",borderRadius:"14px",flexShrink:0,
                background:"linear-gradient(135deg,#E50914,#a00610)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"20px",fontWeight:900,color:"#fff",
                boxShadow:"0 4px 14px rgba(229,9,20,0.4)",
              }}>A</div>
              <div style={{flex:1}}>
                <p style={{color:"#888",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",margin:"0 0 4px",fontWeight:700}}>✦ Created by</p>
                <p style={{color:"#fff",fontSize:"16px",fontWeight:900,margin:"0 0 2px",letterSpacing:"-0.4px"}}>
                  Aditya Gote
                </p>
                <p style={{color:"#E50914",fontSize:"12px",fontWeight:700,margin:0,letterSpacing:"1px"}}>ASG</p>
              </div>
              <div style={{
                background:"rgba(229,9,20,0.15)",border:"1px solid rgba(229,9,20,0.3)",
                borderRadius:"10px",padding:"6px 12px",
              }}>
                <span style={{color:"#E50914",fontSize:"11px",fontWeight:700}}>🎬 Dev</span>
              </div>
            </div>
            <p style={{color:"#333",fontSize:"10px",marginTop:"14px",letterSpacing:"0.5px",textAlign:"center"}}>
              CineFinder © 2026 · Aditya Gote
            </p>
          </div>
        </div>
      )}

      {/* ══════════════ FILTERS ══════════════ */}
      {screen==="filters" && (
        <div style={{padding:"20px 16px 110px",animation:"fadeUp 0.3s ease"}}>
          {/* Search box */}
          <div style={{
            background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:"16px",padding:"4px 14px",
            display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px",
          }}>
            <span style={{fontSize:"16px",color:"#444"}}>🔍</span>
            <input
              value={freeText}
              onChange={e=>setFreeText(e.target.value)}
              placeholder='e.g. "like Parasite but faster paced"'
              style={{
                flex:1,background:"transparent",border:"none",color:"#e0e0e0",
                fontSize:"13px",padding:"12px 0",fontFamily:"inherit",
              }}
            />
            {freeText && <button onClick={()=>setFreeText("")} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"16px"}}>✕</button>}
          </div>

          <Section title="Mood" icon="🎭" items={MOODS} selected={mood} onToggle={v=>tog(mood,setMood,v)} />
          <Section title="Genre" icon="🎬" items={GENRES} selected={genre} onToggle={v=>tog(genre,setGenre,v)} emojiMap={GENRE_EMOJIS} />
          <Section title="Category" icon="📂" items={CATEGORIES} selected={category} onToggle={v=>tog(category,setCategory,v)} />
          <Section title="Style" icon="✨" items={STYLES} selected={style} onToggle={v=>tog(style,setStyle,v)} />

          {/* Selected pill row */}
          {totalSelected > 0 && (
            <div style={{
              background:"rgba(229,9,20,0.06)",border:"1px solid rgba(229,9,20,0.18)",
              borderRadius:"14px",padding:"12px 14px",marginTop:"4px"
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                <span style={{color:"#E50914",fontSize:"10px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>Selected · {totalSelected}</span>
                <button onClick={()=>{setMood([]);setGenre([]);setCategory([]);setStyle([]);}} style={{background:"none",border:"none",color:"#555",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>
              </div>
              <p style={{color:"#888",fontSize:"12px",lineHeight:1.6}}>
                {[...mood,...genre,...category,...style].join(" · ")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ RESULTS ══════════════ */}
      {screen==="results" && (
        <div style={{padding:"16px 16px 100px",animation:"fadeUp 0.3s ease"}}>
          {/* Results header */}
          <div style={{marginBottom:"20px"}}>
            <p style={{color:"#E50914",fontSize:"10px",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"6px"}}>
              🎯 Curated For You
            </p>
            <h2 style={{color:"#fff",fontSize:"20px",fontWeight:900,letterSpacing:"-0.5px"}}>
              {[...mood,...genre].slice(0,2).join(" × ") || "Your Picks"}
            </h2>
            <p style={{color:"#444",fontSize:"12px",marginTop:"4px"}}>
              {loading
                ? <span style={{animation:"pulse 1s ease infinite",display:"inline-block",color:"#E50914"}}>⏳ Finding matches…</span>
                : `${results.length} recommendations`}
            </p>
          </div>

          {results.map((r,i)=><MovieCard key={r.title+i} rec={r} index={i}/>)}

          {/* Streaming skeletons while loading */}
          {loading && results.length < 5 && Array.from({length:5-results.length}).map((_,i)=><Skeleton key={"sk"+i} delay={i*0.1}/>)}

          {loadMore && [0,1,2].map(i=><Skeleton key={i} delay={i*0.1}/>)}

          {!loading && !loadMore && (
            <button className="btn-press" onClick={()=>getRecommendations(true)} style={{
              width:"100%",background:"rgba(229,9,20,0.08)",
              border:"1.5px solid rgba(229,9,20,0.25)",
              color:"#E50914",borderRadius:"16px",padding:"16px",
              fontSize:"14px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",
              marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            }}>
              <span>🍿</span> Show 5 More
            </button>
          )}
          <button className="btn-press" onClick={()=>setScreen("filters")} style={{
            width:"100%",background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.07)",
            color:"#666",borderRadius:"16px",padding:"14px",
            fontSize:"13px",cursor:"pointer",fontFamily:"inherit",
          }}>← Adjust Filters</button>

          <p style={{textAlign:"center",color:"#666",fontSize:"11px",marginTop:"20px",letterSpacing:"0.5px"}}>
            🎬 CineFinder by <span style={{color:"#E50914",fontWeight:700}}>ASG</span> · Aditya Gote
          </p>
        </div>
      )}

      {/* ── Bottom CTA (filters screen) ── */}
      {screen==="filters" && (
        <div style={{
          position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
          width:"100%",maxWidth:"430px",zIndex:50,
          background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",
          borderTop:"1px solid rgba(255,255,255,0.05)",
          padding:"12px 16px 20px",
        }}>
          {error && (
            <div style={{
              background:"rgba(229,9,20,0.1)",border:"1px solid rgba(229,9,20,0.25)",
              borderRadius:"10px",padding:"9px 12px",marginBottom:"10px",
              display:"flex",alignItems:"center",gap:"8px",
            }}>
              <span style={{fontSize:"14px"}}>⚠️</span>
              <span style={{color:"#FF6B6B",fontSize:"12px"}}>{error}</span>
            </div>
          )}
          <button
            className="btn-press"
            onClick={()=>getRecommendations(false)}
            disabled={!hasFilters}
            style={{
              width:"100%",
              background: hasFilters
                ? "linear-gradient(135deg,#E50914,#a00610)"
                : "#1a1a1a",
              color: hasFilters?"#fff":"#333",
              border:"none",borderRadius:"14px",padding:"17px",
              fontSize:"15px",fontWeight:800,cursor: hasFilters?"pointer":"not-allowed",
              fontFamily:"inherit",
              boxShadow: hasFilters?"0 4px 20px rgba(229,9,20,0.35)":"none",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
              transition:"all 0.2s",
            }}
          >
            <span>🎬</span>
            {hasFilters ? `Find My Movies${totalSelected>0?` (${totalSelected} filters)`:""}` : "Select at least one filter"}
          </button>
        </div>
      )}
    </div>
  );
}
