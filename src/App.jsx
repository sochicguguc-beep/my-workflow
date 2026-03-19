import { useState } from "react";

const T = {
  bg:      "#F5F4F0",
  surface: "#FFFFFF",
  border:  "#E8E6E0",
  text:    "#1A1A1A",
  sub:     "#888880",
  accent:  "#1A1A1A",
  green:   "#1DB954",
  orange:  "#FF6B00",
  red:     "#E63946",
  blue:    "#0066FF",
  purple:  "#7C3AED",
};

const STEPS = [
  { id:"intake",     title:"案件受付",     emoji:"📥" },
  { id:"approval",   title:"上司が承認",   emoji:"✅" },
  { id:"staff_view", title:"スタッフ通知", emoji:"📢" },
  { id:"report",     title:"成果報告",     emoji:"📊" },
];

const REASONS = [
  { id:"info",    emoji:"📋", text:"情報が足りない"     },
  { id:"budget",  emoji:"💰", text:"予算確認が必要"     },
  { id:"people",  emoji:"👥", text:"関係者と相談したい" },
  { id:"timing",  emoji:"⏰", text:"時期が合わない"     },
  { id:"risk",    emoji:"⚠️", text:"リスクを確認したい" },
  { id:"other",   emoji:"💬", text:"その他"             },
];

const SLOTS = [
  { id:0, date:"3月21日（金）", time:"14:00〜15:00" },
  { id:1, date:"3月24日（月）", time:"10:00〜11:00" },
  { id:2, date:"3月25日（火）", time:"16:00〜17:00" },
];

const SAMPLE_CASES = [
  { id:1, title:"新規クライアント提案書",   status:"completed", date:"3月15日", priority:"高", members:["田中","山田","鈴木"] },
  { id:2, title:"Q1マーケティング予算承認", status:"completed", date:"3月10日", priority:"中", members:["佐藤","田中"] },
  { id:3, title:"採用面接スケジュール調整", status:"completed", date:"3月5日",  priority:"低", members:["山田"] },
];

const SAMPLE_NOTIFS = [
  { id:1, emoji:"✅", text:"「新規クライアント提案書」が承認されました", time:"5分前",   unread:true  },
  { id:2, emoji:"💬", text:"田中さんからコメントがあります",              time:"1時間前", unread:true  },
  { id:3, emoji:"📅", text:"日程調整の候補日程が確定しました",            time:"昨日",    unread:false },
  { id:4, emoji:"📊", text:"先週の成果報告が提出されました",              time:"3日前",   unread:false },
];

// ─── BASE ────────────────────────────────────────────────────────────────────

function Tile({ children, style={} }) {
  return <div style={{ background:T.surface, borderRadius:20, padding:"20px 18px", ...style }}>{children}</div>;
}

function Label({ children }) {
  return <p style={{ fontSize:12, fontWeight:700, color:T.sub, margin:"0 0 6px", letterSpacing:".5px" }}>{children}</p>;
}

function Inp({ placeholder, value, onChange, multiline, type }) {
  const s = { width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${T.border}`, background:T.bg, color:T.text, fontSize:15, fontFamily:"inherit", outline:"none" };
  return multiline
    ? <textarea style={{...s, height:88}} placeholder={placeholder} value={value} onChange={onChange} />
    : <input style={s} type={type||"text"} placeholder={placeholder} value={value} onChange={onChange} />;
}

function TapBtn({ children, color=T.accent, textColor="white", onClick, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} className={disabled?"":"tap-scale"} style={{
      width:"100%", padding:"17px 20px", borderRadius:16,
      border: outline ? `2px solid ${color}` : "none",
      background: outline ? "transparent" : disabled ? "#E8E6E0" : color,
      color: outline ? color : disabled ? T.sub : textColor,
      fontSize:16, fontWeight:800, cursor:disabled?"default":"pointer",
      fontFamily:"inherit", transition:"all .15s",
    }}>
      {children}
    </button>
  );
}

function Toast({ msg }) {
  return (
    <div style={{
      position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)",
      background:T.accent, color:"white", padding:"10px 20px", borderRadius:24,
      fontSize:13, fontWeight:700, zIndex:9999, whiteSpace:"nowrap",
      boxShadow:"0 4px 20px rgba(0,0,0,0.25)", animation:"fadeIn .25s ease",
    }}>✓ {msg}</div>
  );
}

// ─── FLOW STRIP ──────────────────────────────────────────────────────────────

function FlowStrip({ currentId }) {
  const idx = STEPS.findIndex(s => s.id === currentId);
  return (
    <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"12px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        {STEPS.map((s, i) => {
          const done=i<idx, active=i===idx;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"0 8px" }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background: done ? T.green : active ? T.accent : T.border,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                  boxShadow: active ? `0 0 0 4px ${T.accent}18` : "none",
                  transition:"all .3s",
                }}>
                  {done
                    ? <span style={{ color:"white", fontSize:16, fontWeight:900 }}>✓</span>
                    : <span style={{ filter:active?"none":"grayscale(1)", opacity:active?1:.4 }}>{s.emoji}</span>
                  }
                </div>
                <span style={{
                  fontSize:9, fontWeight:700,
                  color: done ? T.green : active ? T.accent : T.sub,
                  whiteSpace:"nowrap",
                }}>{s.title}</span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ width:24, height:2, borderRadius:1, background:i<idx?T.green:T.border, flexShrink:0, marginBottom:16 }} />
              )}
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div style={{ height:3, background:T.border, borderRadius:2, marginTop:10 }}>
        <div style={{
          height:"100%", borderRadius:2,
          background:`linear-gradient(90deg,${T.green},${T.accent})`,
          width:`${(idx/(STEPS.length-1))*100}%`,
          transition:"width .4s ease",
        }} />
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────

function BottomNav({ active, onChange, unreadCount }) {
  const items = [
    { id:"home",    emoji:"🏠", label:"ホーム"    },
    { id:"cases",   emoji:"📋", label:"案件一覧"  },
    { id:"notifs",  emoji:"🔔", label:"通知",      badge:unreadCount },
    { id:"profile", emoji:"👤", label:"マイページ" },
  ];
  return (
    <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, padding:"10px 0 20px", display:"flex", justifyContent:"space-around", flexShrink:0 }}>
      {items.map(n => (
        <button key={n.id} onClick={()=>onChange(n.id)} className="tap-scale" style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
          color:active===n.id?T.accent:T.sub, position:"relative",
        }}>
          <span style={{ fontSize:22 }}>{n.emoji}</span>
          <span style={{ fontSize:9, fontWeight:700 }}>{n.label}</span>
          {n.badge>0 && (
            <div style={{ position:"absolute", top:-2, right:4, width:16, height:16, borderRadius:"50%", background:T.red, color:"white", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{n.badge}</div>
          )}
          {active===n.id && <div style={{ position:"absolute", bottom:-10, width:4, height:4, borderRadius:"50%", background:T.accent }} />}
        </button>
      ))}
    </div>
  );
}

// ─── STEP 1: INTAKE ──────────────────────────────────────────────────────────

function Intake({ onNext }) {
  const [title,    setTitle]    = useState("");
  const [detail,   setDetail]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [urgent,   setUrgent]   = useState(false);
  const ok = title && detail && deadline;

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px" }}>📥 案件を受け取る</p>
        <p style={{ fontSize:13, color:T.sub, margin:0 }}>上司から届いた指示をここに入力</p>
      </Tile>

      <Tile style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <Label>案件タイトル</Label>
          <Inp placeholder="例：新規クライアント提案書の作成" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <Label>作業内容・上司の指示</Label>
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
              background:urgent?"#FFF0F0":T.bg, color:urgent?T.red:T.sub,
              fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>{urgent?"🚨 緊急":"⚡ 通常"}</button>
          </div>
        </div>
      </Tile>

      <TapBtn disabled={!ok} onClick={()=>onNext({title,detail,deadline,urgent})}>
        {ok ? "上司の承認へ →" : "全項目を入力してください"}
      </TapBtn>
    </div>
  );
}

// ─── STEP 2: APPROVAL ────────────────────────────────────────────────────────

function Approval({ task, onNext }) {
  const [screen, setScreen] = useState("main");
  const [reason, setReason] = useState(null);

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:"#FFF0DC", color:T.orange }}>👔 上司ビュー</span>
        <p style={{ fontSize:21, fontWeight:900, margin:"8px 0 4px" }}>どうしますか？</p>
        <p style={{ fontSize:13, color:T.sub, margin:"0 0 4px" }}>{task.title}</p>
        <p style={{ fontSize:12, color:T.sub, margin:0 }}>期限：{task.deadline}　{task.urgent && <span style={{ color:T.red, fontWeight:700 }}>🚨 緊急</span>}</p>
      </Tile>

      {screen === "main" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"slideUp .25s ease" }}>
          {[
            { emoji:"✅", label:"承認する",     sub:"このまま進めてOK",        color:T.green,  cb:()=>onNext("approved") },
            { emoji:"❌", label:"却下する",     sub:"この案件はなしにする",     color:T.red,    cb:()=>onNext("rejected") },
            { emoji:"🤔", label:"まだ思案中…", sub:"理由を伝えて担当者に返す", color:T.orange, cb:()=>setScreen("reason") },
          ].map(b => (
            <button key={b.label} onClick={b.cb} className="tap-scale" style={{
              display:"flex", alignItems:"center", gap:16, padding:"18px 18px", borderRadius:18,
              border:`1.5px solid ${b.color}33`, background:`${b.color}0D`,
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
              {REASONS.map(r => (
                <button key={r.id} onClick={()=>setReason(r)} className="tap-scale" style={{
                  padding:"14px 12px", borderRadius:14,
                  border:`1.5px solid ${reason?.id===r.id?T.orange:T.border}`,
                  background:reason?.id===r.id?"#FFF6EE":T.bg,
                  cursor:"pointer", fontFamily:"inherit",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                }}>
                  <span style={{ fontSize:24 }}>{r.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:reason?.id===r.id?T.orange:T.text, textAlign:"center", lineHeight:1.3 }}>{r.text}</span>
                </button>
              ))}
            </div>
          </Tile>
          {reason && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8, animation:"slideUp .2s ease" }}>
              <Tile style={{ background:"#FFF6EE" }}>
                <p style={{ fontSize:13, color:T.orange, margin:0, fontWeight:700 }}>選択中：{reason.emoji} {reason.text}</p>
              </Tile>
              <TapBtn color={T.orange} onClick={()=>setScreen("schedule")}>💬 担当者と話したい</TapBtn>
              <TapBtn color={T.sub} outline onClick={()=>setReason(null)}>選び直す</TapBtn>
            </div>
          )}
          {!reason && <p style={{ textAlign:"center", fontSize:12, color:T.sub, marginTop:12 }}>理由を一つ選ぶと次に進めます</p>}
        </div>
      )}

      {screen === "schedule" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .25s ease" }}>
          <Tile style={{ background:"#F5F0FF" }}>
            <Label>📩 担当者への通知内容</Label>
            {[`理由：${reason?.text}`, `案件：${task.title}`, "カレンダーから候補日を自動提案"].map((t,i) => (
              <p key={i} style={{ fontSize:13, color:T.text, margin:"4px 0" }}>• {t}</p>
            ))}
          </Tile>
          <Tile>
            <Label>📅 候補日程（自動生成）</Label>
            {SLOTS.map(s => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:T.green, flexShrink:0 }} />
                <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{s.date}</span>
                <span style={{ fontSize:13, color:T.sub, marginLeft:"auto" }}>{s.time}</span>
              </div>
            ))}
          </Tile>
          <TapBtn color={T.purple} onClick={()=>onNext("talk")}>通知を送って日程調整を開始 →</TapBtn>
        </div>
      )}
    </div>
  );
}

// ─── STEP 3: STAFF VIEW ──────────────────────────────────────────────────────

function StaffView({ task, approval, onNext }) {
  const AP = {
    approved: { emoji:"✅", label:"承認されました",    color:T.green,  bg:"#F0FFF5" },
    rejected: { emoji:"❌", label:"却下されました",     color:T.red,    bg:"#FFF0F0" },
    talk:     { emoji:"💬", label:"話し合いが必要です", color:T.purple, bg:"#F5F0FF" },
  }[approval] ?? { emoji:"📢", label:"通知", color:T.sub, bg:T.bg };

  return (
    <div style={{ padding:"16px 16px 32px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:AP.bg }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:36 }}>{AP.emoji}</span>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:AP.color }}>{AP.label}</div>
            <div style={{ fontSize:13, color:T.sub, marginTop:2 }}>{task.title}</div>
            <div style={{ fontSize:12, color:T.sub, marginTop:1 }}>期限：{task.deadline}</div>
          </div>
        </div>
      </Tile>

      {/* Flow recap */}
      <Tile>
        <Label>案件の流れ</Label>
        {STEPS.map((s, i) => {
          const idx  = STEPS.findIndex(x => x.id === "staff_view");
          const done = i < idx, active = i === idx;
          return (
            <div key={s.id} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 0",
              borderBottom: i < STEPS.length-1 ? `1px solid ${T.border}` : "none",
            }}>
              <div style={{
                width:30, height:30, borderRadius:"50%", flexShrink:0,
                background:done?T.green:active?T.accent:T.bg,
                border:`1.5px solid ${done?T.green:active?T.accent:T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:13,
              }}>
                {done
                  ? <span style={{ color:"white", fontWeight:900 }}>✓</span>
                  : <span style={{ filter:active?"none":"grayscale(1)", opacity:active?1:.4 }}>{s.emoji}</span>
                }
              </div>
              <span style={{
                fontSize:14, fontWeight:active?800:500, flex:1,
                color:done?T.sub:active?T.text:T.border,
                textDecoration:done?"line-through":"none",
              }}>{s.title}</span>
              {active && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:T.accent, color:"white" }}>いまここ</span>}
            </div>
          );
        })}
      </Tile>

      <TapBtn onClick={onNext}>成果報告へ →</TapBtn>
    </div>
  );
}

// ─── STEP 4: REPORT ──────────────────────────────────────────────────────────

function Report({ task, onReset }) {
  return (
    <div style={{ padding:"16px 16px 40px", display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ textAlign:"center", padding:"36px 20px", background:"#F0FFF5" }}>
        <div style={{ fontSize:64 }}>🎉</div>
        <div style={{ fontSize:26, fontWeight:900, color:T.green, marginTop:10 }}>案件完了！</div>
        <div style={{ fontSize:14, color:T.sub, marginTop:6 }}>{task?.title}</div>
      </Tile>

      <Tile>
        <Label>成果サマリー</Label>
        {[
          { label:"完了日",       value:"2026年3月25日" },
          { label:"期限",         value:task?.deadline ?? "—" },
          { label:"緊急案件",     value:task?.urgent ? "🚨 はい" : "なし" },
          { label:"承認者",       value:"上司（確認済み）" },
        ].map((r,i,arr) => (
          <div key={r.label} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"12px 0", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",
          }}>
            <span style={{ fontSize:13, color:T.sub }}>{r.label}</span>
            <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{r.value}</span>
          </div>
        ))}
      </Tile>

      <Tile style={{ background:"#F8F7F3" }}>
        <p style={{ fontSize:13, color:T.sub, margin:0, lineHeight:1.8 }}>
          📁 今回の案件データはシステムに保存されました。
        </p>
      </Tile>

      <TapBtn color={T.green} onClick={onReset}>新しい案件を受け取る +</TapBtn>
    </div>
  );
}

// ─── TAB SCREENS ─────────────────────────────────────────────────────────────

function HomeScreen({ role, onSwitch }) {
  const [step,     setStep]     = useState("intake");
  const [taskData, setTaskData] = useState({ title:"", detail:"", deadline:"", urgent:false });
  const [approval, setApproval] = useState("approved");
  const [toast,    setToast]    = useState(null);

  const go = (next, payload) => {
    const msgs = {
      approval:   "案件を受け付けました",
      staff_view: payload==="approved" ? "承認されました！" : payload==="talk" ? "日程調整を開始します" : "却下されました",
      report:     "スタッフへ通知しました",
    };
    if (msgs[next]) { setToast(msgs[next]); setTimeout(()=>setToast(null), 2500); }
    if (next==="staff_view" && payload) setApproval(payload);
    setStep(next);
  };

  const reset = () => {
    setStep("intake");
    setTaskData({ title:"", detail:"", deadline:"", urgent:false });
  };

  return (
    <>
      {toast && <Toast msg={toast} />}
      <div style={{ padding:"8px 20px 0", background:T.surface, borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:15, fontWeight:900, color:T.text, paddingBottom:8 }}>WorkFlow OS</div>
        <button onClick={onSwitch} className="tap-scale" style={{
          display:"flex", alignItems:"center", gap:6,
          background:T.accent, color:"white", border:"none", borderRadius:20,
          padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginBottom:8,
        }}>
          {role==="staff" ? "👤" : "👔"} {role==="staff" ? "スタッフ" : "上司"} <span style={{opacity:.6}}>切替</span>
        </button>
      </div>
      <FlowStrip currentId={step} />
      <div style={{ flex:1, overflowY:"auto", background:T.bg }}>
        {step==="intake"     && <Intake     onNext={d=>{setTaskData(d); go("approval")}} />}
        {step==="approval"   && <Approval   task={taskData} onNext={r=>go("staff_view", r)} />}
        {step==="staff_view" && <StaffView  task={taskData} approval={approval} onNext={()=>go("report")} />}
        {step==="report"     && <Report     task={taskData} onReset={reset} />}
      </div>
    </>
  );
}

function CasesScreen() {
  const statusMap  = { completed:{label:"完了",color:T.green}, active:{label:"進行中",color:T.orange} };
  const priorityMap = { 高:{bg:"#FFF0F0",color:T.red}, 中:{bg:"#FFF6EE",color:T.orange}, 低:{bg:"#F0FFF5",color:T.green} };
  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg }}>
      <div style={{ padding:"16px 16px 8px", background:T.surface, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:20, fontWeight:900 }}>案件一覧</div>
        <div style={{ fontSize:12, color:T.sub, marginTop:2 }}>過去の案件履歴</div>
      </div>
      <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
        {SAMPLE_CASES.map(c => {
          const s=statusMap[c.status], p=priorityMap[c.priority];
          return (
            <Tile key={c.id} style={{ padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ fontSize:15, fontWeight:800, color:T.text, flex:1, marginRight:8 }}>{c.title}</div>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, background:s.color+"15", color:s.color, flexShrink:0 }}>{s.label}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:T.sub }}>{c.date}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:p.bg, color:p.color }}>優先度：{c.priority}</span>
                <span style={{ fontSize:11, color:T.sub }}>👥 {c.members.join("・")}</span>
              </div>
            </Tile>
          );
        })}
        <Tile style={{ background:"#F8F7F3", textAlign:"center", padding:"28px" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
          <div style={{ fontSize:14, fontWeight:700, color:T.sub }}>新しい案件はホームから作成</div>
        </Tile>
      </div>
    </div>
  );
}

function NotifsScreen({ onRead }) {
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);
  const readAll = () => { setNotifs(prev=>prev.map(n=>({...n,unread:false}))); onRead(); };
  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg }}>
      <div style={{ padding:"16px 16px 8px", background:T.surface, borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><div style={{ fontSize:20, fontWeight:900 }}>通知</div><div style={{ fontSize:12, color:T.sub, marginTop:2 }}>未読 {notifs.filter(n=>n.unread).length}件</div></div>
        <button onClick={readAll} className="tap-scale" style={{ fontSize:12, fontWeight:700, color:T.blue, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>すべて既読</button>
      </div>
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
        {notifs.map(n => (
          <div key={n.id} style={{ background:n.unread?T.surface:"#F8F7F3", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:12, borderLeft:n.unread?`3px solid ${T.accent}`:"3px solid transparent" }}>
            <span style={{ fontSize:22, flexShrink:0 }}>{n.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:n.unread?700:500, color:T.text, lineHeight:1.5 }}>{n.text}</div>
              <div style={{ fontSize:11, color:T.sub, marginTop:4 }}>{n.time}</div>
            </div>
            {n.unread && <div style={{ width:8, height:8, borderRadius:"50%", background:T.accent, flexShrink:0, marginTop:4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ role, onSwitch }) {
  const isStaff = role === "staff";
  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg }}>
      <div style={{ padding:"16px 16px 8px", background:T.surface, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:20, fontWeight:900 }}>マイページ</div>
      </div>
      <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
        <Tile style={{ textAlign:"center", padding:"28px 20px" }}>
          <div style={{ width:72,height:72,borderRadius:"50%",background:isStaff?"#E8F4FF":"#FFF6EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px" }}>{isStaff?"👤":"👔"}</div>
          <div style={{ fontSize:18, fontWeight:900 }}>{isStaff?"田中 スタッフ":"山本 上司"}</div>
          <div style={{ fontSize:13, color:T.sub, marginTop:4 }}>{isStaff?"マーケティング部":"マーケティング部　部長"}</div>
        </Tile>
        <Tile>
          <Label>実績サマリー</Label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:8 }}>
            {[{label:"完了案件",value:"12",color:T.green},{label:"進行中",value:"2",color:T.orange},{label:"承認数",value:"8",color:T.blue}].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}><div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div><div style={{ fontSize:11, color:T.sub, marginTop:2 }}>{s.label}</div></div>
            ))}
          </div>
        </Tile>
        <Tile>
          <Label>ロール切り替え</Label>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            {[{id:"staff",label:"👤 スタッフ"},{id:"boss",label:"👔 上司"}].map(r=>(
              <button key={r.id} onClick={()=>onSwitch(r.id)} className="tap-scale" style={{ flex:1, padding:"14px", borderRadius:14, border:`1.5px solid ${role===r.id?T.accent:T.border}`, background:role===r.id?T.accent:T.bg, color:role===r.id?"white":T.sub, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{r.label}</button>
            ))}
          </div>
        </Tile>
        <Tile style={{ padding:"8px 18px" }}>
          {[{emoji:"🔔",label:"通知設定"},{emoji:"🔒",label:"プライバシー"},{emoji:"❓",label:"ヘルプ"},{emoji:"📝",label:"利用規約"}].map((item,i,arr)=>(
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none", cursor:"pointer" }}>
              <span style={{ fontSize:20 }}>{item.emoji}</span>
              <span style={{ fontSize:14, fontWeight:600, color:T.text, flex:1 }}>{item.label}</span>
              <span style={{ color:T.border, fontSize:18 }}>›</span>
            </div>
          ))}
        </Tile>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,    setTab]    = useState("home");
  const [role,   setRole]   = useState("staff");
  const [unread, setUnread] = useState(2);

  const switchRole = (r) => { if (typeof r==="string") setRole(r); else setRole(prev=>prev==="staff"?"boss":"staff"); };
  const handleTab  = (t) => { setTab(t); if (t==="notifs") setUnread(0); };

  return (
    <div style={{ minHeight:"100vh", background:"#1A1A1A", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input,textarea{color-scheme:light;-webkit-appearance:none;}
        textarea{resize:none;}
        @keyframes slideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .tap-scale:active{transform:scale(0.97);}
        ::-webkit-scrollbar{display:none;}
        html,body{background:#1A1A1A;}
      `}</style>

      <div style={{
        position:"fixed", top:0, left:0, right:0, zIndex:9999,
        height:"env(safe-area-inset-top)",
        background:"#1A1A1A",
      }} />

      <div style={{
        paddingTop:"env(safe-area-inset-top)",
        paddingBottom:"env(safe-area-inset-bottom)",
        minHeight:"100vh",
        background:T.bg,
        display:"flex", flexDirection:"column",
      }}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {tab==="home"    && <HomeScreen    role={role} onSwitch={switchRole} />}
          {tab==="cases"   && <CasesScreen />}
          {tab==="notifs"  && <NotifsScreen  onRead={()=>setUnread(0)} />}
          {tab==="profile" && <ProfileScreen role={role} onSwitch={switchRole} />}
          <BottomNav active={tab} onChange={handleTab} unreadCount={unread} />
        </div>
      </div>
    </div>
  );
}
