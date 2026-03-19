import { useState } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg:       "#F5F4F0",
  surface:  "#FFFFFF",
  border:   "#E8E6E0",
  text:     "#1A1A1A",
  sub:      "#888880",
  accent:   "#1A1A1A",
  green:    "#1DB954",
  orange:   "#FF6B00",
  red:      "#E63946",
  blue:     "#0066FF",
  purple:   "#7C3AED",
};

// ─── ROLES ───────────────────────────────────────────────────────────────────
const ROLES = [
  { id:"staff", label:"スタッフ", emoji:"👤" },
  { id:"boss",  label:"上司",     emoji:"👔" },
];

// ─── FLOW STEPS ──────────────────────────────────────────────────────────────
const STEPS = [
  { id:"intake",     title:"案件受付",     emoji:"📥", role:"staff" },
  { id:"analyze",    title:"内容分析",     emoji:"🤖", role:"system" },
  { id:"boss_check", title:"上司へ確認",   emoji:"📨", role:"system" },
  { id:"approval",   title:"上司が承認",   emoji:"✅", role:"boss"  },
  { id:"staff_view", title:"スタッフ通知", emoji:"📢", role:"staff" },
  { id:"meeting",    title:"日程調整",     emoji:"📅", role:"all"   },
  { id:"exec",       title:"タスク実行",   emoji:"⚡", role:"staff" },
  { id:"report",     title:"成果報告",     emoji:"📊", role:"all"   },
];

const REASONS = [
  { id:"info",    emoji:"📋", text:"情報が足りない"       },
  { id:"budget",  emoji:"💰", text:"予算確認が必要"       },
  { id:"people",  emoji:"👥", text:"関係者と相談したい"   },
  { id:"timing",  emoji:"⏰", text:"時期が合わない"       },
  { id:"risk",    emoji:"⚠️", text:"リスクを確認したい"   },
  { id:"other",   emoji:"💬", text:"その他"               },
];

const SUBTASKS = [
  { id:1, text:"要件ヒアリング・整理",        est:"3h",  owner:"山田", done:true,  active:false },
  { id:2, text:"競合・市場リサーチ（3社）",   est:"5h",  owner:"鈴木", done:true,  active:false },
  { id:3, text:"提案資料ドラフト作成",         est:"8h",  owner:"田中", done:false, active:true  },
  { id:4, text:"上司レビュー＆修正対応",      est:"3h",  owner:"田中", done:false, active:false },
  { id:5, text:"クライアントへ最終提案",      est:"2h",  owner:"全員", done:false, active:false },
];

const SLOTS = [
  { id:0, date:"3月21日（金）", time:"14:00〜15:00" },
  { id:1, date:"3月24日（月）", time:"10:00〜11:00" },
  { id:2, date:"3月25日（火）", time:"16:00〜17:00" },
];

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function PhoneFrame({ children }) {
  return (
    <div style={{
      minHeight:"100vh",
      background:"#D8D6CF",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"flex-start",
      padding:"24px 0 40px",
      fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
    }}>
      <style>{`
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        input,textarea { color-scheme:light; -webkit-appearance:none; }
        textarea { resize:none; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes pulse {
          0%,100% { opacity:1; } 50% { opacity:.5; }
        }
        .tap-scale:active { transform:scale(0.97); }
      `}</style>

      {/* Phone shell */}
      <div style={{
        width:"100%", maxWidth:390,
        background:T.bg,
        borderRadius:44,
        overflow:"hidden",
        boxShadow:"0 32px 80px rgba(0,0,0,0.28), 0 0 0 10px #1A1A1A, 0 0 0 12px #333",
        minHeight:780,
        display:"flex",
        flexDirection:"column",
        position:"relative",
      }}>
        {/* Notch */}
        <div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          width:120, height:34, background:"#1A1A1A",
          borderRadius:"0 0 20px 20px", zIndex:200,
        }} />
        <div style={{ paddingTop:34, flex:1, display:"flex", flexDirection:"column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ role, onSwitch }) {
  return (
    <div style={{
      padding:"12px 20px 0",
      display:"flex", justifyContent:"space-between", alignItems:"center",
    }}>
      <span style={{ fontSize:12, fontWeight:700, color:T.sub }}>9:41</span>
      <button onClick={onSwitch} className="tap-scale" style={{
        display:"flex", alignItems:"center", gap:6,
        background:T.accent, color:"white",
        border:"none", borderRadius:20,
        padding:"5px 12px", fontSize:11, fontWeight:700,
        cursor:"pointer", fontFamily:"inherit",
      }}>
        {ROLES.find(r=>r.id===role)?.emoji}
        {ROLES.find(r=>r.id===role)?.label}
        <span style={{ opacity:.6 }}>切替</span>
      </button>
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div style={{
      padding:"14px 20px 10px",
      display:"flex", alignItems:"center", gap:12,
      borderBottom:`1px solid ${T.border}`,
      background:T.surface,
    }}>
      {onBack && (
        <button onClick={onBack} className="tap-scale" style={{
          width:32, height:32, borderRadius:"50%",
          background:T.bg, border:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, cursor:"pointer",
        }}>‹</button>
      )}
      <span style={{ fontSize:17, fontWeight:800, color:T.text, letterSpacing:"-.4px" }}>
        {title}
      </span>
    </div>
  );
}

// Mini flow strip at top
function FlowStrip({ currentId }) {
  const idx = STEPS.findIndex(s => s.id === currentId);
  return (
    <div style={{
      background:T.surface,
      borderBottom:`1px solid ${T.border}`,
      padding:"10px 16px",
      overflowX:"auto",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:0, minWidth:"max-content" }}>
        {STEPS.map((s, i) => {
          const done   = i < idx;
          const active = i === idx;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                padding:"0 6px",
              }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  background: done   ? T.green
                            : active ? T.accent
                            :          T.border,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12,
                  boxShadow: active ? `0 0 0 3px ${T.accent}22` : "none",
                  transition:"all .3s",
                }}>
                  {done
                    ? <span style={{ color:"white", fontSize:13, fontWeight:900 }}>✓</span>
                    : <span style={{ filter: active?"none":"grayscale(1)", opacity: active?1:.5 }}>{s.emoji}</span>
                  }
                </div>
                <span style={{
                  fontSize:8, fontWeight:700,
                  color: done ? T.green : active ? T.accent : T.sub,
                  whiteSpace:"nowrap",
                }}>{s.title}</span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{
                  width:12, height:2, borderRadius:1,
                  background: i < idx ? T.green : T.border,
                  flexShrink:0, marginBottom:14,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div style={{
      position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)",
      background:T.accent, color:"white",
      padding:"10px 20px", borderRadius:24,
      fontSize:13, fontWeight:700,
      zIndex:9999, whiteSpace:"nowrap",
      boxShadow:"0 4px 20px rgba(0,0,0,0.25)",
      animation:"fadeIn .25s ease",
    }}>✓ {msg}</div>
  );
}

// Large tap button
function TapBtn({ children, color=T.accent, textColor="white", onClick, disabled, outline }) {
  const bg = outline ? "transparent" : disabled ? "#E8E6E0" : color;
  const fg = outline ? color : disabled ? T.sub : textColor;
  return (
    <button onClick={onClick} disabled={disabled} className={disabled?"":"tap-scale"} style={{
      width:"100%", padding:"17px 20px",
      borderRadius:16, border: outline ? `2px solid ${color}` : "none",
      background:bg, color:fg,
      fontSize:16, fontWeight:800, cursor: disabled?"default":"pointer",
      fontFamily:"inherit", transition:"all .15s",
    }}>
      {children}
    </button>
  );
}

// Card container
function Tile({ children, style={} }) {
  return (
    <div style={{
      background:T.surface, borderRadius:20,
      padding:"20px 18px", ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p style={{ fontSize:12, fontWeight:700, color:T.sub, margin:"0 0 6px", letterSpacing:".5px" }}>{children}</p>;
}

function Inp({ placeholder, value, onChange, multiline, type }) {
  const s = {
    width:"100%", padding:"13px 14px",
    borderRadius:12, border:`1.5px solid ${T.border}`,
    background:T.bg, color:T.text,
    fontSize:15, fontFamily:"inherit", outline:"none",
  };
  return multiline
    ? <textarea style={{...s,height:88}} placeholder={placeholder} value={value} onChange={onChange} />
    : <input style={s} type={type||"text"} placeholder={placeholder} value={value} onChange={onChange} />;
}

function Divider() {
  return <div style={{ height:1, background:T.border, margin:"6px 0" }} />;
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// 1 · INTAKE
function Intake({ onNext }) {
  const [title,    setTitle]    = useState("");
  const [detail,   setDetail]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [urgent,   setUrgent]   = useState(false);
  const ok = title && detail && deadline;

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px", color:T.text }}>📥 案件を受け取る</p>
        <p style={{ fontSize:13, color:T.sub, margin:0 }}>上司から届いた指示をここに入力</p>
      </Tile>

      <Tile style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <Label>案件タイトル</Label>
          <Inp placeholder="例：新規クライアント提案書の作成" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <Label>上司からの指示内容</Label>
          <Inp multiline placeholder="「〇〇をやっておいて」のような指示をそのまま…" value={detail} onChange={e=>setDetail(e.target.value)} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <Label>希望期限</Label>
            <Inp type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} />
          </div>
          <div>
            <Label>緊急度</Label>
            <button onClick={()=>setUrgent(u=>!u)} className="tap-scale" style={{
              width:"100%", padding:"13px 14px", borderRadius:12,
              border:`1.5px solid ${urgent?T.red:T.border}`,
              background: urgent ? "#FFF0F0" : T.bg,
              color: urgent ? T.red : T.sub,
              fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>
              {urgent ? "🚨 緊急" : "⚡ 通常"}
            </button>
          </div>
        </div>
      </Tile>

      <TapBtn color={T.accent} disabled={!ok} onClick={()=>onNext({title,detail,deadline,urgent})}>
        {ok ? "受け取って分析する →" : "全項目を入力してください"}
      </TapBtn>
    </div>
  );
}

// 2 · ANALYZE
function Analyze({ task, onNext }) {
  const diff = task.urgent ? "high" : task.detail.length > 60 ? "medium" : "low";
  const D = {
    low:    { label:"軽め",   color:T.green,  bg:"#F0FFF5", hours:"2〜4時間", msg:"手順が明確でシンプルです。" },
    medium: { label:"普通",   color:T.orange, bg:"#FFF6EE", hours:"1〜2日",  msg:"複数工程と関係者の連携が必要です。" },
    high:   { label:"重め",   color:T.red,    bg:"#FFF0F0", hours:"3〜5日",  msg:"専門判断と複数部署の協力が必要です。" },
  }[diff];

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px" }}>🤖 内容を分析しました</p>
        <p style={{ fontSize:13, color:T.sub, margin:0 }}>難易度・工数・上司への返信案を自動生成</p>
      </Tile>

      {/* Difficulty card */}
      <Tile style={{ background:D.bg, display:"flex", alignItems:"center", gap:18 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:36, fontWeight:900, color:D.color, lineHeight:1 }}>{D.label}</div>
          <div style={{ fontSize:11, color:T.sub, marginTop:2 }}>難易度</div>
        </div>
        <div style={{ flex:1, borderLeft:`1.5px solid ${D.color}33`, paddingLeft:18 }}>
          <div style={{ fontSize:13, color:T.text, marginBottom:10, lineHeight:1.6 }}>{D.msg}</div>
          <div style={{ display:"flex", gap:20 }}>
            <div>
              <div style={{ fontSize:10, color:T.sub }}>推定工数</div>
              <div style={{ fontSize:17, fontWeight:800, color:D.color }}>{D.hours}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:T.sub }}>期限</div>
              <div style={{ fontSize:17, fontWeight:800, color:T.text }}>{task.deadline || "未設定"}</div>
            </div>
          </div>
        </div>
      </Tile>

      {/* Subtasks */}
      <Tile>
        <Label>提案サブタスク</Label>
        {["要件ヒアリング","調査・情報収集","資料作成","最終確認・提出"].map((t,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i<3?`1px solid ${T.border}`:"none" }}>
            <div style={{
              width:22, height:22, borderRadius:"50%",
              background:T.accent, color:"white",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:900, flexShrink:0,
            }}>{i+1}</div>
            <span style={{ fontSize:14, color:T.text }}>{t}</span>
          </div>
        ))}
      </Tile>

      {/* Reply preview */}
      <Tile style={{ background:"#F0FFF5", borderLeft:`4px solid ${T.green}` }}>
        <Label>💬 上司への返信案（自動生成）</Label>
        <p style={{ fontSize:13, color:"#1A5A2A", lineHeight:1.8, margin:0 }}>
          「{task.title}」を受け取りました。推定{D.hours}の工数が必要です。{D.msg}
          期限（{task.deadline}）に向けて進めます。よろしいでしょうか？
        </p>
      </Tile>

      <TapBtn onClick={()=>onNext(diff)}>この内容で上司に送る →</TapBtn>
    </div>
  );
}

// 3 · BOSS CHECK
function BossCheck({ task, diff, onNext }) {
  const hours = {low:"2〜4時間",medium:"1〜2日",high:"3〜5日"}[diff];
  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px" }}>📨 上司へ送付済み</p>
        <p style={{ fontSize:13, color:T.sub, margin:0 }}>返答待ちの状態です</p>
      </Tile>

      <Tile style={{ background:"#FFFBF0", borderLeft:`4px solid ${T.orange}` }}>
        <Label>送付した内容</Label>
        <p style={{ fontSize:14, color:T.text, lineHeight:1.8, margin:0 }}>
          「{task.title}」を受け取りました。<br/>
          推定工数：<strong>{hours}</strong>　期限：<strong>{task.deadline}</strong><br/>
          このまま進めてよいかご確認をお願いします。
        </p>
      </Tile>

      {/* Status pills */}
      <div style={{ display:"flex", gap:10 }}>
        {[
          { label:"✉️ 送付済み", active:true,  color:T.green  },
          { label:"⏳ 返答待ち", active:true,  color:T.orange },
          { label:"✅ 承認完了", active:false, color:T.sub    },
        ].map(s=>(
          <div key={s.label} style={{
            flex:1, padding:"12px 8px", borderRadius:14, textAlign:"center",
            background: s.active ? `${s.color}15` : T.bg,
            border:`1.5px solid ${s.active ? s.color+"55" : T.border}`,
          }}>
            <div style={{ fontSize:11, fontWeight:700, color: s.active ? s.color : T.sub, lineHeight:1.5 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <TapBtn onClick={onNext}>上司から返答が来た →</TapBtn>
    </div>
  );
}

// 4 · APPROVAL (boss view)
function Approval({ task, onNext }) {
  const [screen, setScreen] = useState("main");
  const [reason, setReason] = useState(null);

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <div style={{ display:"flex", items:"center", gap:8, marginBottom:4 }}>
          <span style={{
            fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
            background:"#FFF0DC", color:T.orange,
          }}>👔 上司ビュー</span>
        </div>
        <p style={{ fontSize:21, fontWeight:900, margin:"6px 0 3px" }}>どうしますか？</p>
        <p style={{ fontSize:13, color:T.sub, margin:0, lineHeight:1.6 }}>
          {task.title}
        </p>
      </Tile>

      {screen === "main" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"slideUp .25s ease" }}>
          {[
            { emoji:"✅", label:"承認する",       sub:"このまま進めてOK",          color:T.green,  cb:()=>onNext("approved") },
            { emoji:"❌", label:"却下する",        sub:"この案件はなしにする",       color:T.red,    cb:()=>onNext("rejected") },
            { emoji:"🤔", label:"まだ思案中…",    sub:"理由を伝えて担当者に返す",   color:T.orange, cb:()=>setScreen("reason") },
          ].map(b=>(
            <button key={b.label} onClick={b.cb} className="tap-scale" style={{
              display:"flex", alignItems:"center", gap:16,
              padding:"18px 18px", borderRadius:18,
              border:`1.5px solid ${b.color}33`,
              background:`${b.color}0D`,
              cursor:"pointer", fontFamily:"inherit", textAlign:"left", width:"100%",
            }}>
              <span style={{ fontSize:32 }}>{b.emoji}</span>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:b.color }}>{b.label}</div>
                <div style={{ fontSize:12, color:T.sub, marginTop:2 }}>{b.sub}</div>
              </div>
              <span style={{ marginLeft:"auto", fontSize:18, color:T.border }}>›</span>
            </button>
          ))}
        </div>
      )}

      {screen === "reason" && (
        <div style={{ animation:"slideUp .25s ease" }}>
          <Tile>
            <Label>何が引っかかっていますか？</Label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:4 }}>
              {REASONS.map(r=>(
                <button key={r.id} onClick={()=>setReason(r)} className="tap-scale" style={{
                  padding:"14px 12px", borderRadius:14, textAlign:"left",
                  border:`1.5px solid ${reason?.id===r.id ? T.orange : T.border}`,
                  background: reason?.id===r.id ? "#FFF6EE" : T.bg,
                  cursor:"pointer", fontFamily:"inherit",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                }}>
                  <span style={{ fontSize:24 }}>{r.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: reason?.id===r.id ? T.orange : T.text, textAlign:"center", lineHeight:1.3 }}>
                    {r.text}
                  </span>
                </button>
              ))}
            </div>
          </Tile>

          {reason && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8, animation:"slideUp .2s ease" }}>
              <Tile style={{ background:"#FFF6EE" }}>
                <p style={{ fontSize:13, color:T.orange, margin:0, fontWeight:700 }}>
                  選択中：{reason.emoji} {reason.text}
                </p>
              </Tile>
              <TapBtn color={T.orange} onClick={()=>setScreen("schedule")}>
                💬 担当者と話したい
              </TapBtn>
              <TapBtn color={T.sub} outline onClick={()=>setReason(null)}>
                選び直す
              </TapBtn>
            </div>
          )}
          {!reason && (
            <p style={{ textAlign:"center", fontSize:12, color:T.sub, marginTop:12 }}>理由を選ぶと次に進めます</p>
          )}
        </div>
      )}

      {screen === "schedule" && (
        <div style={{ animation:"slideUp .25s ease", display:"flex", flexDirection:"column", gap:12 }}>
          <Tile style={{ background:"#F5F0FF" }}>
            <Label>📩 担当者への通知内容</Label>
            {[`理由：${reason?.text}`, `案件：${task.title}`, "カレンダーから候補日を自動提案"].map((t,i)=>(
              <p key={i} style={{ fontSize:13, color:T.text, margin:"4px 0" }}>• {t}</p>
            ))}
          </Tile>
          <Tile>
            <Label>📅 候補日程（自動生成）</Label>
            {SLOTS.map(s=>(
              <div key={s.id} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"11px 0", borderBottom:`1px solid ${T.border}`,
              }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:T.green,flexShrink:0 }} />
                <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{s.date}</span>
                <span style={{ fontSize:13, color:T.sub, marginLeft:"auto" }}>{s.time}</span>
              </div>
            ))}
          </Tile>
          <TapBtn color={T.purple} onClick={()=>onNext("talk")}>
            通知を送って日程調整を開始 →
          </TapBtn>
        </div>
      )}
    </div>
  );
}

// 5 · STAFF VIEW
function StaffView({ task, approval, onNext }) {
  const AP = {
    approved: { emoji:"✅", label:"承認されました",     color:T.green,  bg:"#F0FFF5" },
    rejected: { emoji:"❌", label:"却下されました",      color:T.red,    bg:"#FFF0F0" },
    talk:     { emoji:"💬", label:"話し合いが必要です",  color:T.purple, bg:"#F5F0FF" },
  }[approval] ?? { emoji:"📢", label:"通知", color:T.sub, bg:T.bg };

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:AP.bg }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <span style={{ fontSize:30 }}>{AP.emoji}</span>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:AP.color }}>{AP.label}</div>
            <div style={{ fontSize:13, color:T.sub }}>{task.title}</div>
          </div>
        </div>
      </Tile>

      {/* Flow list */}
      <Tile>
        <Label>案件フロー（現在地）</Label>
        {STEPS.map((s, i) => {
          const idx    = STEPS.findIndex(x => x.id === "staff_view");
          const done   = i < idx;
          const active = i === idx;
          return (
            <div key={s.id} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 0",
              borderBottom: i < STEPS.length-1 ? `1px solid ${T.border}` : "none",
            }}>
              <div style={{
                width:30, height:30, borderRadius:"50%", flexShrink:0,
                background: done   ? T.green
                          : active ? T.accent
                          :          T.bg,
                border:`1.5px solid ${done?T.green:active?T.accent:T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13,
              }}>
                {done
                  ? <span style={{ color:"white", fontWeight:900 }}>✓</span>
                  : <span style={{ filter: active?"none":"grayscale(1)", opacity: active?1:.4 }}>{s.emoji}</span>
                }
              </div>
              <div style={{ flex:1 }}>
                <span style={{
                  fontSize:14, fontWeight: active?800:500,
                  color: done ? T.sub : active ? T.text : T.border,
                  textDecoration: done ? "line-through" : "none",
                }}>
                  {s.title}
                </span>
              </div>
              {active && (
                <span style={{
                  fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                  background:T.accent, color:"white",
                }}>いまここ</span>
              )}
            </div>
          );
        })}
      </Tile>

      <TapBtn onClick={onNext}>タスク実行フェーズへ →</TapBtn>
    </div>
  );
}

// 6 · MEETING
function Meeting({ onNext }) {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px" }}>📅 日程を決める</p>
        <p style={{ fontSize:13, color:T.sub, margin:0 }}>全員のカレンダーから候補日を自動生成しました</p>
      </Tile>

      <Tile>
        <Label>参加者：田中・山田・鈴木・上司</Label>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
          {SLOTS.map(s=>(
            <button key={s.id} onClick={()=>setSel(s.id)} className="tap-scale" style={{
              display:"flex", alignItems:"center",
              padding:"16px 16px", borderRadius:16,
              border:`1.5px solid ${sel===s.id ? T.accent : T.border}`,
              background: sel===s.id ? "#F0F0FF" : T.bg,
              cursor:"pointer", fontFamily:"inherit", textAlign:"left",
            }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color: sel===s.id ? T.accent : T.text }}>
                  {s.date}
                </div>
                <div style={{ fontSize:13, color:T.sub }}>{s.time}</div>
              </div>
              <div style={{
                width:22, height:22, borderRadius:"50%",
                border:`2px solid ${sel===s.id ? T.accent : T.border}`,
                background: sel===s.id ? T.accent : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, color:"white", flexShrink:0,
              }}>
                {sel===s.id && "✓"}
              </div>
            </button>
          ))}
        </div>
      </Tile>

      <TapBtn disabled={sel===null} onClick={onNext}>
        {sel !== null
          ? `${SLOTS.find(s=>s.id===sel)?.date} で確定して通知 →`
          : "日程を選んでください"}
      </TapBtn>
    </div>
  );
}

// 7 · EXEC
function Exec({ onNext }) {
  const [tasks, setTasks] = useState(SUBTASKS);
  const doneCount = tasks.filter(t=>t.done).length;
  const pct = Math.round(doneCount / tasks.length * 100);
  const current = tasks.find(t=>t.active && !t.done);

  const complete = id => {
    setTasks(prev => {
      const next = prev.map(t => t.id===id ? {...t, done:true, active:false} : t);
      const nxt  = next.find(t=>!t.done);
      return next.map(t => t.id===nxt?.id ? {...t, active:true} : t);
    });
  };

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      {/* Current focus — BIG */}
      {current ? (
        <Tile style={{ background:"#FFFBF0", borderLeft:`4px solid ${T.orange}` }}>
          <p style={{ fontSize:11, fontWeight:700, color:T.orange, margin:"0 0 6px" }}>🎯 今すぐやること</p>
          <p style={{ fontSize:19, fontWeight:900, color:T.text, margin:"0 0 4px", lineHeight:1.4 }}>{current.text}</p>
          <p style={{ fontSize:12, color:T.sub, margin:"0 0 16px" }}>担当：{current.owner}　推定：{current.est}</p>
          <button onClick={()=>complete(current.id)} className="tap-scale" style={{
            width:"100%", padding:"16px",
            borderRadius:14, border:"none",
            background:T.green, color:"white",
            fontSize:16, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
          }}>
            完了にする ✓
          </button>
        </Tile>
      ) : (
        <Tile style={{ background:"#F0FFF5", textAlign:"center", padding:"28px" }}>
          <div style={{ fontSize:48 }}>🎉</div>
          <div style={{ fontSize:20, fontWeight:900, color:T.green, marginTop:8 }}>全タスク完了！</div>
        </Tile>
      )}

      {/* Progress */}
      <Tile>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <Label>進捗</Label>
          <span style={{ fontSize:13, fontWeight:800, color: pct===100?T.green:T.text }}>{pct}%</span>
        </div>
        <div style={{ height:8, background:T.bg, borderRadius:4, overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:4,
            background: pct===100 ? T.green : `linear-gradient(90deg,${T.accent},${T.orange})`,
            width:`${pct}%`, transition:"width .4s ease",
          }} />
        </div>
        <div style={{ fontSize:12, color:T.sub, marginTop:6, textAlign:"right" }}>
          {doneCount} / {tasks.length} 完了
        </div>
      </Tile>

      {/* Task list */}
      <Tile>
        <Label>タスク一覧</Label>
        {tasks.map((t,i)=>(
          <div key={t.id} style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"11px 0",
            borderBottom: i<tasks.length-1 ? `1px solid ${T.border}` : "none",
            opacity: !t.done && !t.active ? 0.45 : 1,
          }}>
            <div style={{
              width:26, height:26, borderRadius:"50%", flexShrink:0,
              background: t.done ? T.green : t.active ? T.orange : T.bg,
              border:`1.5px solid ${t.done?T.green:t.active?T.orange:T.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"white", fontSize:12, fontWeight:900,
            }}>
              {t.done ? "✓" : t.active ? "" : i+1}
            </div>
            <div style={{ flex:1 }}>
              <div style={{
                fontSize:14, fontWeight: t.active?700:500,
                color: t.done ? T.sub : T.text,
                textDecoration: t.done ? "line-through" : "none",
              }}>{t.text}</div>
              <div style={{ fontSize:11, color:T.sub }}>{t.owner} · {t.est}</div>
            </div>
            {t.active && !t.done && (
              <span style={{
                fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                background:"#FFF0DC", color:T.orange,
              }}>進行中</span>
            )}
          </div>
        ))}
      </Tile>

      {pct===100 && (
        <TapBtn color={T.green} onClick={onNext}>成果報告へ →</TapBtn>
      )}
    </div>
  );
}

// 8 · REPORT
function Report({ task }) {
  return (
    <div style={{ padding:"16px 16px 40px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ textAlign:"center", padding:"32px 20px", background:"#F0FFF5" }}>
        <div style={{ fontSize:56 }}>🎉</div>
        <div style={{ fontSize:24, fontWeight:900, color:T.green, marginTop:8 }}>案件完了！</div>
        <div style={{ fontSize:13, color:T.sub, marginTop:4 }}>{task?.title}</div>
      </Tile>

      <Tile>
        <Label>成果サマリー</Label>
        {[
          { label:"完了日",         value:"2026年3月25日" },
          { label:"実際の工数",     value:"4日間（推定内）" },
          { label:"参加メンバー",   value:"田中・山田・鈴木" },
          { label:"承認者",         value:"上司（確認済み）" },
          { label:"次回への教訓",   value:"リサーチは1日多めに見積もる" },
        ].map((r,i,arr)=>(
          <div key={r.label} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"12px 0",
            borderBottom: i<arr.length-1 ? `1px solid ${T.border}` : "none",
          }}>
            <span style={{ fontSize:13, color:T.sub }}>{r.label}</span>
            <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{r.value}</span>
          </div>
        ))}
      </Tile>

      <Tile style={{ background:T.bg }}>
        <p style={{ fontSize:13, color:T.sub, margin:0, lineHeight:1.8 }}>
          📁 今回のフロー・工数データはシステムに保存されました。次の類似案件で自動的に参考値として使用されます。
        </p>
      </Tile>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [role,     setRole]     = useState("staff");
  const [step,     setStep]     = useState("intake");
  const [taskData, setTaskData] = useState({ title:"", detail:"", deadline:"", urgent:false });
  const [diff,     setDiff]     = useState("medium");
  const [approval, setApproval] = useState("approved");
  const [toast,    setToast]    = useState(null);

  const go = (next, payload) => {
    const msgs = {
      analyze:    "案件を受け取りました",
      boss_check: "上司に確認を送りました",
      approval:   "上司が確認しました",
      staff_view: payload==="approved" ? "承認されました！" : payload==="talk" ? "日程調整を開始します" : "却下されました",
      meeting:    "スタッフへ通知しました",
      exec:       "日程が確定しました。開始します",
      report:     "全タスク完了！報告書を送付します",
    };
    if (msgs[next]) { setToast(msgs[next]); setTimeout(()=>setToast(null), 2500); }
    if (next==="staff_view" && payload) { setApproval(payload); }
    setStep(next);
  };

  const switchRole = () => setRole(r => r==="staff" ? "boss" : "staff");

  return (
    <PhoneFrame>
      {toast && <Toast msg={toast} />}

      <StatusBar role={role} onSwitch={switchRole} />

      {/* App header */}
      <div style={{
        padding:"8px 20px 0",
        background:T.surface,
        borderBottom:`1px solid ${T.border}`,
      }}>
        <div style={{
          fontSize:15, fontWeight:900, color:T.text, letterSpacing:"-.3px",
          paddingBottom:8,
        }}>
          WorkFlow OS
        </div>
      </div>

      <FlowStrip currentId={step} />

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto", background:T.bg }}>
        {step==="intake"     && <Intake     onNext={d=>{setTaskData(d);go("analyze")}} />}
        {step==="analyze"    && <Analyze    task={taskData} onNext={d=>{setDiff(d);go("boss_check")}} />}
        {step==="boss_check" && <BossCheck  task={taskData} diff={diff} onNext={()=>go("approval")} />}
        {step==="approval"   && <Approval   task={taskData} onNext={r=>go("staff_view",r)} />}
        {step==="staff_view" && <StaffView  task={taskData} approval={approval} onNext={()=>go("meeting")} />}
        {step==="meeting"    && <Meeting    onNext={()=>go("exec")} />}
        {step==="exec"       && <Exec       onNext={()=>go("report")} />}
        {step==="report"     && <Report     task={taskData} />}
      </div>

      {/* Bottom nav bar */}
      <div style={{
        background:T.surface, borderTop:`1px solid ${T.border}`,
        padding:"10px 0 20px",
        display:"flex", justifyContent:"space-around",
      }}>
        {[
          { emoji:"🏠", label:"ホーム" },
          { emoji:"📋", label:"案件一覧" },
          { emoji:"🔔", label:"通知" },
          { emoji:"👤", label:"マイページ" },
        ].map(n=>(
          <button key={n.label} className="tap-scale" style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
            color: n.label==="ホーム" ? T.accent : T.sub,
          }}>
            <span style={{ fontSize:20 }}>{n.emoji}</span>
            <span style={{ fontSize:9, fontWeight:700 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </PhoneFrame>
  );
}