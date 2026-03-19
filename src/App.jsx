import { useState } from "react";

// ─── ROLE THEMES ─────────────────────────────────────────────────────────────
// スタッフ = ライトブルー系、上司 = ウォームアンバー系
const THEME = {
  staff: {
    accent:     "#0066FF",
    accentSoft: "#E8F0FF",
    accentText: "#0044CC",
    headerBg:   "#0066FF",
    headerText: "#FFFFFF",
    badge:      "#0066FF",
    label:      "スタッフ",
    emoji:      "👤",
  },
  boss: {
    accent:     "#B45309",
    accentSoft: "#FFF7ED",
    accentText: "#92400E",
    headerBg:   "#1C1917",
    headerText: "#FFFFFF",
    badge:      "#B45309",
    label:      "上司",
    emoji:      "👔",
  },
};

const BASE = {
  bg:      "#F5F4F0",
  surface: "#FFFFFF",
  border:  "#E8E6E0",
  text:    "#1A1A1A",
  sub:     "#888880",
  green:   "#1DB954",
  orange:  "#FF6B00",
  red:     "#E63946",
  purple:  "#7C3AED",
};

const STEPS = [
  { id:"intake",     title:"案件受付",     emoji:"📥", role:"staff" },
  { id:"approval",   title:"上司が承認",   emoji:"✅", role:"boss"  },
  { id:"staff_view", title:"スタッフ通知", emoji:"📢", role:"staff" },
  { id:"report",     title:"成果報告",     emoji:"📊", role:"all"   },
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

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────

function Tile({ children, style={} }) {
  return <div style={{ background:BASE.surface, borderRadius:20, padding:"20px 18px", ...style }}>{children}</div>;
}

function Label({ children }) {
  return <p style={{ fontSize:12, fontWeight:700, color:BASE.sub, margin:"0 0 6px", letterSpacing:".5px" }}>{children}</p>;
}

function Inp({ placeholder, value, onChange, multiline, type }) {
  const s = { width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${BASE.border}`, background:BASE.bg, color:BASE.text, fontSize:15, fontFamily:"inherit", outline:"none" };
  return multiline
    ? <textarea style={{...s, height:88}} placeholder={placeholder} value={value} onChange={onChange} />
    : <input style={s} type={type||"text"} placeholder={placeholder} value={value} onChange={onChange} />;
}

function TapBtn({ children, color, textColor="white", onClick, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} className={disabled?"":"tap-scale"} style={{
      width:"100%", padding:"17px 20px", borderRadius:16,
      border: outline ? `2px solid ${color}` : "none",
      background: outline ? "transparent" : disabled ? "#E8E6E0" : color,
      color: outline ? color : disabled ? BASE.sub : textColor,
      fontSize:16, fontWeight:800, cursor:disabled?"default":"pointer",
      fontFamily:"inherit", transition:"all .15s",
    }}>
      {children}
    </button>
  );
}

function Toast({ msg, accent }) {
  return (
    <div style={{
      position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
      background:accent, color:"white", padding:"10px 20px", borderRadius:24,
      fontSize:13, fontWeight:700, zIndex:9999, whiteSpace:"nowrap",
      boxShadow:"0 4px 20px rgba(0,0,0,0.25)", animation:"fadeIn .25s ease",
    }}>✓ {msg}</div>
  );
}

// ─── FIXED HEADER ────────────────────────────────────────────────────────────

function AppHeader({ role, onSwitch, tab }) {
  const th = THEME[role];
  const tabLabels = { home:"ホーム", cases:"案件一覧", notifs:"通知", profile:"マイページ" };
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:500,
      background: th.headerBg,
      paddingTop:"env(safe-area-inset-top)",
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 18px",
      }}>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"white", letterSpacing:"-.3px" }}>
            WorkFlow OS
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:1 }}>
            {tabLabels[tab]}
          </div>
        </div>

        {/* ロール切り替えボタン */}
        <button onClick={onSwitch} className="tap-scale" style={{
          display:"flex", alignItems:"center", gap:8,
          background:"rgba(255,255,255,0.15)",
          border:"1.5px solid rgba(255,255,255,0.3)",
          borderRadius:24, padding:"7px 14px",
          cursor:"pointer", fontFamily:"inherit",
          transition:"all .2s",
        }}>
          <span style={{ fontSize:16 }}>{th.emoji}</span>
          <span style={{ fontSize:13, fontWeight:800, color:"white" }}>{th.label}</span>
          <span style={{
            fontSize:10, fontWeight:700,
            background:"rgba(255,255,255,0.25)",
            color:"white", padding:"1px 6px", borderRadius:10,
          }}>切替</span>
        </button>
      </div>
    </div>
  );
}

// ─── FLOW STRIP ──────────────────────────────────────────────────────────────

function FlowStrip({ currentId, role }) {
  const th = THEME[role];
  const idx = STEPS.findIndex(s => s.id === currentId);
  return (
    <div style={{ background:BASE.surface, borderBottom:`1px solid ${BASE.border}`, padding:"10px 12px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        {STEPS.map((s, i) => {
          const done=i<idx, active=i===idx;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"0 6px" }}>
                <div style={{
                  width:32, height:32, borderRadius:"50%",
                  background: done ? BASE.green : active ? th.accent : BASE.border,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                  boxShadow: active ? `0 0 0 3px ${th.accent}33` : "none",
                  transition:"all .3s",
                }}>
                  {done
                    ? <span style={{ color:"white", fontWeight:900 }}>✓</span>
                    : <span style={{ filter:active?"none":"grayscale(1)", opacity:active?1:.4 }}>{s.emoji}</span>
                  }
                </div>
                <span style={{
                  fontSize:8, fontWeight:700,
                  color: done ? BASE.green : active ? th.accent : BASE.sub,
                  whiteSpace:"nowrap",
                }}>{s.title}</span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ width:20, height:2, borderRadius:1, background:i<idx?BASE.green:BASE.border, flexShrink:0, marginBottom:14 }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ height:3, background:BASE.border, borderRadius:2, marginTop:8 }}>
        <div style={{
          height:"100%", borderRadius:2,
          background: th.accent,
          width:`${(idx/(STEPS.length-1))*100}%`,
          transition:"width .4s ease",
        }} />
      </div>
    </div>
  );
}

// ─── FIXED BOTTOM NAV ────────────────────────────────────────────────────────

function BottomNav({ active, onChange, unreadCount, role }) {
  const th = THEME[role];
  const items = [
    { id:"home",    emoji:"🏠", label:"ホーム"    },
    { id:"cases",   emoji:"📋", label:"案件一覧"  },
    { id:"notifs",  emoji:"🔔", label:"通知",      badge:unreadCount },
    { id:"profile", emoji:"👤", label:"マイページ" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:500,
      background:BASE.surface,
      borderTop:`1px solid ${BASE.border}`,
      paddingBottom:"env(safe-area-inset-bottom)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-around", padding:"8px 0 4px" }}>
        {items.map(n => (
          <button key={n.id} onClick={()=>onChange(n.id)} className="tap-scale" style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
            color: active===n.id ? th.accent : BASE.sub,
            padding:"4px 12px", position:"relative",
          }}>
            <span style={{ fontSize:22 }}>{n.emoji}</span>
            <span style={{ fontSize:9, fontWeight:700 }}>{n.label}</span>
            {n.badge>0 && (
              <div style={{ position:"absolute", top:0, right:8, width:16, height:16, borderRadius:"50%", background:BASE.red, color:"white", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{n.badge}</div>
            )}
            {active===n.id && (
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:24, height:2, borderRadius:1, background:th.accent }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── WORKFLOW VIEWS ───────────────────────────────────────────────────────────

function Intake({ onNext, role }) {
  const th = THEME[role];
  const [title,setTitle]=useState(""); const [detail,setDetail]=useState(""); const [deadline,setDeadline]=useState(""); const [urgent,setUrgent]=useState(false);
  const ok = title&&detail&&deadline;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:th.accentSoft }}>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px", color:th.accentText }}>📥 案件を受け取る</p>
        <p style={{ fontSize:13, color:BASE.sub, margin:0 }}>上司から届いた指示をここに入力</p>
      </Tile>
      <Tile style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><Label>案件タイトル</Label><Inp placeholder="例：新規クライアント提案書の作成" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><Label>上司からの指示内容</Label><Inp multiline placeholder="「〇〇をやっておいて」のような指示をそのまま…" value={detail} onChange={e=>setDetail(e.target.value)} /></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div><Label>希望期限</Label><Inp type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} /></div>
          <div><Label>緊急度</Label>
            <button onClick={()=>setUrgent(u=>!u)} className="tap-scale" style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${urgent?BASE.red:BASE.border}`, background:urgent?"#FFF0F0":BASE.bg, color:urgent?BASE.red:BASE.sub, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{urgent?"🚨 緊急":"⚡ 通常"}</button>
          </div>
        </div>
      </Tile>
      <TapBtn color={th.accent} disabled={!ok} onClick={()=>onNext({title,detail,deadline,urgent})}>{ok?"上司の承認へ →":"全項目を入力してください"}</TapBtn>
    </div>
  );
}

function Approval({ task, onNext, role }) {
  const th = THEME[role];
  const [screen,setScreen]=useState("main"); const [reason,setReason]=useState(null);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:th.accentSoft }}>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:th.accent, color:"white" }}>{th.emoji} {th.label}ビュー</span>
        <p style={{ fontSize:21, fontWeight:900, margin:"8px 0 4px", color:th.accentText }}>どうしますか？</p>
        <p style={{ fontSize:13, color:BASE.sub, margin:"0 0 2px" }}>{task.title}</p>
        <p style={{ fontSize:12, color:BASE.sub, margin:0 }}>期限：{task.deadline}　{task.urgent&&<span style={{color:BASE.red,fontWeight:700}}>🚨 緊急</span>}</p>
      </Tile>

      {screen==="main" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            {emoji:"✅",label:"承認する",    sub:"このまま進めてOK",        color:BASE.green,  cb:()=>onNext("approved")},
            {emoji:"❌",label:"却下する",    sub:"この案件はなしにする",     color:BASE.red,    cb:()=>onNext("rejected")},
            {emoji:"🤔",label:"まだ思案中…", sub:"理由を伝えて担当者に返す", color:BASE.orange, cb:()=>setScreen("reason")},
          ].map(b=>(
            <button key={b.label} onClick={b.cb} className="tap-scale" style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 18px", borderRadius:18, border:`1.5px solid ${b.color}33`, background:`${b.color}0D`, cursor:"pointer", fontFamily:"inherit", textAlign:"left", width:"100%" }}>
              <span style={{ fontSize:32 }}>{b.emoji}</span>
              <div><div style={{ fontSize:17, fontWeight:800, color:b.color }}>{b.label}</div><div style={{ fontSize:12, color:BASE.sub, marginTop:2 }}>{b.sub}</div></div>
              <span style={{ marginLeft:"auto", fontSize:18, color:BASE.border }}>›</span>
            </button>
          ))}
        </div>
      )}

      {screen==="reason" && (
        <div>
          <Tile>
            <Label>何が引っかかっていますか？</Label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:4 }}>
              {REASONS.map(r=>(
                <button key={r.id} onClick={()=>setReason(r)} className="tap-scale" style={{ padding:"14px 12px", borderRadius:14, border:`1.5px solid ${reason?.id===r.id?BASE.orange:BASE.border}`, background:reason?.id===r.id?"#FFF6EE":BASE.bg, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:24 }}>{r.emoji}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:reason?.id===r.id?BASE.orange:BASE.text, textAlign:"center", lineHeight:1.3 }}>{r.text}</span>
                </button>
              ))}
            </div>
          </Tile>
          {reason && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
              <Tile style={{ background:"#FFF6EE" }}><p style={{ fontSize:13, color:BASE.orange, margin:0, fontWeight:700 }}>選択中：{reason.emoji} {reason.text}</p></Tile>
              <TapBtn color={BASE.orange} onClick={()=>setScreen("schedule")}>💬 担当者と話したい</TapBtn>
              <TapBtn color={BASE.sub} outline onClick={()=>setReason(null)}>選び直す</TapBtn>
            </div>
          )}
          {!reason && <p style={{ textAlign:"center", fontSize:12, color:BASE.sub, marginTop:12 }}>理由を一つ選ぶと次に進めます</p>}
        </div>
      )}

      {screen==="schedule" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Tile style={{ background:"#F5F0FF" }}>
            <Label>📩 担当者への通知内容</Label>
            {[`理由：${reason?.text}`,`案件：${task.title}`,"カレンダーから候補日を自動提案"].map((t,i)=>(
              <p key={i} style={{ fontSize:13, color:BASE.text, margin:"4px 0" }}>• {t}</p>
            ))}
          </Tile>
          <Tile>
            <Label>📅 候補日程（自動生成）</Label>
            {SLOTS.map(s=>(
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:`1px solid ${BASE.border}` }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:BASE.green,flexShrink:0 }} />
                <span style={{ fontSize:14, fontWeight:600 }}>{s.date}</span>
                <span style={{ fontSize:13, color:BASE.sub, marginLeft:"auto" }}>{s.time}</span>
              </div>
            ))}
          </Tile>
          <TapBtn color={BASE.purple} onClick={()=>onNext("talk")}>通知を送って日程調整を開始 →</TapBtn>
        </div>
      )}
    </div>
  );
}

function StaffView({ task, approval, onNext, role }) {
  const th = THEME[role];
  const AP = {
    approved:{emoji:"✅",label:"承認されました",   color:BASE.green, bg:"#F0FFF5"},
    rejected:{emoji:"❌",label:"却下されました",    color:BASE.red,   bg:"#FFF0F0"},
    talk:    {emoji:"💬",label:"話し合いが必要です",color:BASE.purple,bg:"#F5F0FF"},
  }[approval]??{emoji:"📢",label:"通知",color:BASE.sub,bg:BASE.bg};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:AP.bg }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:36 }}>{AP.emoji}</span>
          <div><div style={{ fontSize:20, fontWeight:900, color:AP.color }}>{AP.label}</div><div style={{ fontSize:13, color:BASE.sub, marginTop:2 }}>{task.title}</div><div style={{ fontSize:12, color:BASE.sub }}>期限：{task.deadline}</div></div>
        </div>
      </Tile>
      <Tile>
        <Label>案件の流れ</Label>
        {STEPS.map((s,i)=>{
          const idx=STEPS.findIndex(x=>x.id==="staff_view"),done=i<idx,active=i===idx;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<STEPS.length-1?`1px solid ${BASE.border}`:"none" }}>
              <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,background:done?BASE.green:active?th.accent:BASE.bg,border:`1.5px solid ${done?BASE.green:active?th.accent:BASE.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                {done?<span style={{color:"white",fontWeight:900}}>✓</span>:<span style={{filter:active?"none":"grayscale(1)",opacity:active?1:.4}}>{s.emoji}</span>}
              </div>
              <span style={{ fontSize:14, fontWeight:active?800:500, flex:1, color:done?BASE.sub:active?BASE.text:BASE.border, textDecoration:done?"line-through":"none" }}>{s.title}</span>
              {active&&<span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:th.accent, color:"white" }}>いまここ</span>}
            </div>
          );
        })}
      </Tile>
      <TapBtn color={th.accent} onClick={onNext}>成果報告へ →</TapBtn>
    </div>
  );
}

function Report({ task, onReset, role }) {
  const th = THEME[role];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ textAlign:"center", padding:"36px 20px", background:"#F0FFF5" }}>
        <div style={{ fontSize:64 }}>🎉</div>
        <div style={{ fontSize:26, fontWeight:900, color:BASE.green, marginTop:10 }}>案件完了！</div>
        <div style={{ fontSize:14, color:BASE.sub, marginTop:6 }}>{task?.title}</div>
      </Tile>
      <Tile>
        <Label>成果サマリー</Label>
        {[{label:"完了日",value:"2026年3月25日"},{label:"期限",value:task?.deadline??"—"},{label:"緊急案件",value:task?.urgent?"🚨 はい":"なし"},{label:"承認者",value:"上司（確認済み）"}].map((r,i,arr)=>(
          <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<arr.length-1?`1px solid ${BASE.border}`:"none" }}>
            <span style={{ fontSize:13, color:BASE.sub }}>{r.label}</span>
            <span style={{ fontSize:14, fontWeight:700 }}>{r.value}</span>
          </div>
        ))}
      </Tile>
      <TapBtn color={th.accent} onClick={onReset}>新しい案件を受け取る +</TapBtn>
    </div>
  );
}

// ─── TAB SCREENS ─────────────────────────────────────────────────────────────

function HomeScreen({ role }) {
  const th = THEME[role];
  const [step,setStep]=useState("intake");
  const [taskData,setTaskData]=useState({title:"",detail:"",deadline:"",urgent:false});
  const [approval,setApproval]=useState("approved");
  const [toast,setToast]=useState(null);

  const go=(next,payload)=>{
    const msgs={approval:"案件を受け付けました",staff_view:payload==="approved"?"承認されました！":payload==="talk"?"日程調整を開始します":"却下されました",report:"スタッフへ通知しました"};
    if(msgs[next]){setToast(msgs[next]);setTimeout(()=>setToast(null),2500);}
    if(next==="staff_view"&&payload)setApproval(payload);
    setStep(next);
  };

  const reset=()=>{ setStep("intake"); setTaskData({title:"",detail:"",deadline:"",urgent:false}); };

  return (
    <>
      {toast&&<Toast msg={toast} accent={th.accent}/>}
      <FlowStrip currentId={step} role={role}/>
      <div style={{ padding:"16px 16px 16px" }}>
        {step==="intake"     && <Intake     onNext={d=>{setTaskData(d);go("approval")}} role={role}/>}
        {step==="approval"   && <Approval   task={taskData} onNext={r=>go("staff_view",r)} role={role}/>}
        {step==="staff_view" && <StaffView  task={taskData} approval={approval} onNext={()=>go("report")} role={role}/>}
        {step==="report"     && <Report     task={taskData} onReset={reset} role={role}/>}
      </div>
    </>
  );
}

function CasesScreen({ role }) {
  const th = THEME[role];
  const statusMap={completed:{label:"完了",color:BASE.green},active:{label:"進行中",color:BASE.orange}};
  const priorityMap={高:{bg:"#FFF0F0",color:BASE.red},中:{bg:"#FFF6EE",color:BASE.orange},低:{bg:"#F0FFF5",color:BASE.green}};
  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
      {SAMPLE_CASES.map(c=>{
        const s=statusMap[c.status],p=priorityMap[c.priority];
        return (
          <Tile key={c.id} style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ fontSize:15, fontWeight:800, flex:1, marginRight:8 }}>{c.title}</div>
              <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, background:s.color+"15", color:s.color, flexShrink:0 }}>{s.label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:BASE.sub }}>{c.date}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:p.bg, color:p.color }}>優先度：{c.priority}</span>
              <span style={{ fontSize:11, color:BASE.sub }}>👥 {c.members.join("・")}</span>
            </div>
          </Tile>
        );
      })}
      <Tile style={{ background:"#F8F7F3", textAlign:"center", padding:"28px" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
        <div style={{ fontSize:14, fontWeight:700, color:BASE.sub }}>新しい案件はホームから作成</div>
      </Tile>
    </div>
  );
}

function NotifsScreen({ onRead, role }) {
  const th = THEME[role];
  const [notifs,setNotifs]=useState(SAMPLE_NOTIFS);
  const readAll=()=>{ setNotifs(prev=>prev.map(n=>({...n,unread:false}))); onRead(); };
  return (
    <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:4 }}>
        <button onClick={readAll} className="tap-scale" style={{ fontSize:12, fontWeight:700, color:th.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>すべて既読</button>
      </div>
      {notifs.map(n=>(
        <div key={n.id} style={{ background:n.unread?BASE.surface:"#F8F7F3", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:12, borderLeft:n.unread?`3px solid ${th.accent}`:"3px solid transparent" }}>
          <span style={{ fontSize:22, flexShrink:0 }}>{n.emoji}</span>
          <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:n.unread?700:500, lineHeight:1.5 }}>{n.text}</div><div style={{ fontSize:11, color:BASE.sub, marginTop:4 }}>{n.time}</div></div>
          {n.unread&&<div style={{ width:8,height:8,borderRadius:"50%",background:th.accent,flexShrink:0,marginTop:4 }}/>}
        </div>
      ))}
    </div>
  );
}

function ProfileScreen({ role, onSwitch }) {
  const th = THEME[role];
  const isStaff = role==="staff";
  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
      {/* プロフィールカード - ロール別カラー */}
      <Tile style={{ background:th.accentSoft, textAlign:"center", padding:"28px 20px" }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:th.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px" }}>{th.emoji}</div>
        <div style={{ fontSize:18, fontWeight:900 }}>{isStaff?"田中 一郎":"山本 部長"}</div>
        <div style={{ fontSize:13, color:BASE.sub, marginTop:4 }}>{isStaff?"マーケティング部":"マーケティング部　部長"}</div>
        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, background:th.accent, color:"white", fontSize:12, fontWeight:700 }}>
          {th.emoji} {th.label}
        </div>
      </Tile>

      <Tile>
        <Label>実績サマリー</Label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:8 }}>
          {[{label:"完了案件",value:"12",color:BASE.green},{label:"進行中",value:"2",color:BASE.orange},{label:isStaff?"担当数":"承認数",value:"8",color:th.accent}].map(s=>(
            <div key={s.label} style={{ textAlign:"center" }}><div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div><div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>{s.label}</div></div>
          ))}
        </div>
      </Tile>

      {/* ロール切り替え */}
      <Tile>
        <Label>ロール切り替え</Label>
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          {[
            { id:"staff", label:"👤 スタッフ", th:THEME.staff },
            { id:"boss",  label:"👔 上司",     th:THEME.boss  },
          ].map(r=>(
            <button key={r.id} onClick={()=>onSwitch(r.id)} className="tap-scale" style={{
              flex:1, padding:"14px", borderRadius:14,
              border:`1.5px solid ${role===r.id?r.th.accent:BASE.border}`,
              background: role===r.id ? r.th.accent : BASE.bg,
              color: role===r.id ? "white" : BASE.sub,
              fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>{r.label}</button>
          ))}
        </div>
      </Tile>

      <Tile style={{ padding:"8px 18px" }}>
        {[{emoji:"🔔",label:"通知設定"},{emoji:"🔒",label:"プライバシー"},{emoji:"❓",label:"ヘルプ"},{emoji:"📝",label:"利用規約"}].map((item,i,arr)=>(
          <div key={item.label} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:i<arr.length-1?`1px solid ${BASE.border}`:"none", cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>{item.emoji}</span>
            <span style={{ fontSize:14, fontWeight:600, flex:1 }}>{item.label}</span>
            <span style={{ color:BASE.border, fontSize:18 }}>›</span>
          </div>
        ))}
      </Tile>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,    setTab]    = useState("home");
  const [role,   setRole]   = useState("staff");
  const [unread, setUnread] = useState(2);

  const th = THEME[role];

  // ヘッダー高さ = safe-area + 54px
  const HEADER_H = "calc(env(safe-area-inset-top) + 54px)";
  // フッター高さ = safe-area + 56px
  const FOOTER_H = "calc(env(safe-area-inset-bottom) + 56px)";

  const switchRole = (r) => {
    if (typeof r==="string") setRole(r);
    else setRole(prev=>prev==="staff"?"boss":"staff");
  };
  const handleTab = (t) => { setTab(t); if(t==="notifs")setUnread(0); };

  const tabTitles = { home:"ホーム", cases:"案件一覧", notifs:"通知", profile:"マイページ" };

  return (
    <div style={{ height:"100vh", background:BASE.bg, overflow:"hidden", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif", transition:"background .3s" }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input,textarea{color-scheme:light;-webkit-appearance:none;}
        textarea{resize:none;}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .tap-scale:active{transform:scale(0.97);}
        ::-webkit-scrollbar{display:none;}
        html,body{background:#F5F4F0;height:100%;}
      `}</style>

      {/* 固定ヘッダー */}
      <AppHeader role={role} onSwitch={switchRole} tab={tab} />

      {/* スクロールエリア */}
      <div style={{
        position:"absolute",
        top: HEADER_H,
        bottom: FOOTER_H,
        left:0, right:0,
        overflowY:"auto",
        background: BASE.bg,
        transition:"background .3s",
      }}>
        <div key={`${tab}-${role}`} style={{ animation:"slideUp .25s ease", minHeight:"100%" }}>
          {tab==="home"    && <HomeScreen    role={role} />}
          {tab==="cases"   && <CasesScreen   role={role} />}
          {tab==="notifs"  && <NotifsScreen  onRead={()=>setUnread(0)} role={role} />}
          {tab==="profile" && <ProfileScreen role={role} onSwitch={switchRole} />}
        </div>
      </div>

      {/* 固定フッター */}
      <BottomNav active={tab} onChange={handleTab} unreadCount={unread} role={role} />
    </div>
  );
}
