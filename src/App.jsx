import { useState, useEffect } from "react";

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEME = {
  staff:     { accent:"#0066FF", accentSoft:"#E8F0FF", accentText:"#0044CC", headerBg:"#003FA3", label:"スタッフ", emoji:"👤" },
  boss:      { accent:"#B45309", accentSoft:"#FFF7ED", accentText:"#92400E", headerBg:"#1C1917", label:"上司",     emoji:"👔" },
  president: { accent:"#7C3AED", accentSoft:"#F5F0FF", accentText:"#5B21B6", headerBg:"#1E1035", label:"経営者",  emoji:"👑" },
};

const BASE = {
  bg:"#F5F4F0", surface:"#FFFFFF", border:"#E8E6E0",
  text:"#1A1A1A", sub:"#888880",
  green:"#1DB954", orange:"#FF6B00", red:"#E63946", purple:"#7C3AED",
};

// パスコード（一元管理）
const PASSCODES = {
  staff:     "1111",
  boss:      "2222",
  president: "3333",
};

const STEPS = [
  { id:"intake",     title:"案件受付",     emoji:"📥" },
  { id:"approval",   title:"上司が承認",   emoji:"✅" },
  { id:"staff_view", title:"スタッフ通知", emoji:"📢" },
  { id:"report",     title:"成果報告",     emoji:"📊" },
];

const REASONS = [
  { id:"info",   emoji:"📋", text:"情報が足りない"     },
  { id:"budget", emoji:"💰", text:"予算確認が必要"     },
  { id:"people", emoji:"👥", text:"関係者と相談したい" },
  { id:"timing", emoji:"⏰", text:"時期が合わない"     },
  { id:"risk",   emoji:"⚠️", text:"リスクを確認したい" },
  { id:"other",  emoji:"💬", text:"その他"             },
];

const SLOTS = [
  { id:0, date:"4月7日（月）",  time:"14:00〜15:00" },
  { id:1, date:"4月8日（火）",  time:"10:00〜11:00" },
  { id:2, date:"4月10日（木）", time:"16:00〜17:00" },
];

const SAMPLE_CASES = [
  { id:1, title:"新規クライアント提案書",   status:"completed", date:"3月15日", priority:"高", members:["田中","山田","鈴木"] },
  { id:2, title:"Q1マーケティング予算承認", status:"completed", date:"3月10日", priority:"中", members:["佐藤","田中"] },
  { id:3, title:"採用面接スケジュール調整", status:"completed", date:"3月5日",  priority:"低", members:["山田"] },
];

const SAMPLE_NOTIFS = [
  {
    id:1, type:"approved", emoji:"✅", unread:true, time:"5分前",
    title:"承認されました",
    case:"新規クライアント提案書",
    from:"山本 部長",
    detail:"内容を確認しました。このまま進めてください。",
  },
  {
    id:2, type:"comment", emoji:"💬", unread:true, time:"1時間前",
    title:"コメントがあります",
    case:"Q1マーケティング予算承認",
    from:"山本 部長",
    detail:"予算の内訳をもう少し詳しく教えてもらえますか？",
  },
  {
    id:3, type:"schedule", emoji:"📅", unread:false, time:"昨日",
    title:"日程が確定しました",
    case:"採用面接スケジュール調整",
    from:"システム",
    detail:"4月8日（火）10:00〜11:00 で確定しました。参加者全員に通知済みです。",
  },
  {
    id:4, type:"done", emoji:"📊", unread:false, time:"3日前",
    title:"成果報告が提出されました",
    case:"新規クライアント提案書",
    from:"田中 一郎",
    detail:"無事に提案が完了しました。クライアントから前向きな返答をもらっています。",
  },
  {
    id:5, type:"pending", emoji:"⏰", unread:false, time:"4日前",
    title:"思案中のままです",
    case:"Q1マーケティング予算承認",
    from:"山本 部長",
    detail:"理由：予算確認が必要。返答まで少しお待ちください。",
  },
];

// 社長ビュー用：上司の判断データ（サンプル）
const BOSS_METRICS = [
  {
    id:1, name:"山本 部長",   dept:"マーケティング部",
    approved:18, rejected:6, pending:2, total:26,
    avgDays:1.2, pendingDays:[1,3],
    score:92,
  },
  {
    id:2, name:"佐藤 課長",   dept:"営業部",
    approved:10, rejected:2, pending:8, total:20,
    avgDays:4.8, pendingDays:[7,12,5,9,3,8,6,4],
    score:41,
  },
  {
    id:3, name:"田中 マネージャー", dept:"開発部",
    approved:14, rejected:8, pending:1, total:23,
    avgDays:2.1, pendingDays:[2],
    score:78,
  },
  {
    id:4, name:"鈴木 リーダー", dept:"人事部",
    approved:5,  rejected:1, pending:11, total:17,
    avgDays:6.3, pendingDays:[14,9,8,11,6,12,7,10,5,8,9],
    score:22,
  },
];

// スコア → 評価ランク
function getGrade(score) {
  if (score >= 85) return { label:"S", color:"#7C3AED", bg:"#F5F0FF" };
  if (score >= 70) return { label:"A", color:"#1DB954", bg:"#F0FFF5" };
  if (score >= 50) return { label:"B", color:"#0066FF", bg:"#E8F0FF" };
  if (score >= 30) return { label:"C", color:"#FF6B00", bg:"#FFF6EE" };
  return               { label:"D", color:"#E63946", bg:"#FFF0F0" };
}

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────

function Tile({ children, style={} }) {
  return <div style={{ background:BASE.surface, borderRadius:20, padding:"20px 18px", ...style }}>{children}</div>;
}
function Lbl({ children }) {
  return <p style={{ fontSize:12, fontWeight:700, color:BASE.sub, margin:"0 0 6px", letterSpacing:".5px" }}>{children}</p>;
}
function Inp({ placeholder, value, onChange, multiline, type, secure }) {
  const s = { width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${BASE.border}`, background:BASE.bg, color:BASE.text, fontSize:15, fontFamily:"inherit", outline:"none" };
  return multiline
    ? <textarea style={{...s,height:88}} placeholder={placeholder} value={value} onChange={onChange}/>
    : <input style={s} type={secure?"password":type||"text"} placeholder={placeholder} value={value} onChange={onChange}/>;
}
function TapBtn({ children, color, textColor="white", onClick, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled} className={disabled?"":"tap-scale"} style={{
      width:"100%", padding:"17px 20px", borderRadius:16,
      border:outline?`2px solid ${color}`:"none",
      background:outline?"transparent":disabled?"#E8E6E0":color,
      color:outline?color:disabled?BASE.sub:textColor,
      fontSize:16, fontWeight:800, cursor:disabled?"default":"pointer",
      fontFamily:"inherit", transition:"all .15s",
    }}>{children}</button>
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

function PipeLogo({ size=36 }) {
  const ic = size;
  const r  = ic * 0.225;       // rx
  const bw = ic * 0.125;       // 棒の幅
  const br = ic * 0.0625;      // 棒rx
  const py = ic * 0.175;       // 棒のy開始（上余白）
  const ph = ic * 0.65;        // 棒の高さ
  const cr = ic * 0.10;        // 丸の半径
  const cx1 = ic * 0.2625, cx2 = ic * 0.5, cx3 = ic * 0.7375;
  const cy1 = py + cr;                   // 左：上端
  const cy2 = py + ph / 2;              // 中：中央
  const cy3 = py + ph - cr;             // 右：下端
  const fs  = size * 0.72;
  const tw  = fs * 0.62;                // p の幅の概算

  return (
    <div style={{ display:"flex", alignItems:"center", gap: size * 0.22 }}>
      {/* アイコン */}
      <svg width={ic} height={ic} viewBox={`0 0 ${ic} ${ic}`}>
        <rect x="0" y="0" width={ic} height={ic} rx={r} fill="#1A6FE8"/>
        {/* 左 */}
        <rect x={cx1-bw/2} y={py} width={bw} height={ph} rx={br} fill="white" opacity="1"/>
        <circle cx={cx1} cy={cy1} r={cr} fill="white" opacity="1"/>
        {/* 中 */}
        <rect x={cx2-bw/2} y={py} width={bw} height={ph} rx={br} fill="white" opacity="0.6"/>
        <circle cx={cx2} cy={cy2} r={cr} fill="white" opacity="0.6"/>
        {/* 右 */}
        <rect x={cx3-bw/2} y={py} width={bw} height={ph} rx={br} fill="white" opacity="0.3"/>
        <circle cx={cx3} cy={cy3} r={cr} fill="white" opacity="0.3"/>
      </svg>

      {/* ワードマーク */}
      <svg width={tw*4.2} height={ic} viewBox={`0 0 ${tw*4.2} ${ic}`}>
        {/* p */}
        <text x="0" y={ic*0.78} style={{ fontFamily:"sans-serif", fontSize:fs, fontWeight:500, fill:"white" }}>p</text>
        {/* i: 青ドット＋白縦棒 */}
        <circle cx={tw+fs*0.13} cy={ic*0.22} r={fs*0.095} fill="#1A6FE8"/>
        <rect x={tw+fs*0.085} y={ic*0.33} width={fs*0.09} height={ic*0.46} rx={fs*0.045} fill="white"/>
        {/* pe */}
        <text x={tw+fs*0.19} y={ic*0.78} style={{ fontFamily:"sans-serif", fontSize:fs, fontWeight:500, fill:"white" }}>pe</text>
      </svg>
    </div>
  );
}

function AppHeader({ role }) {
  const th = THEME[role];
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:500, background:th.headerBg, paddingTop:"env(safe-area-inset-top)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", height:60 }}>
        <PipeLogo size={38}/>
        <div style={{
          display:"flex", alignItems:"center", gap:6,
          background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.3)",
          borderRadius:24, padding:"6px 14px",
        }}>
          <span style={{ fontSize:14 }}>{th.emoji}</span>
          <span style={{ fontSize:13, fontWeight:800, color:"white" }}>{th.label}</span>
        </div>
      </div>
    </div>
  );
}

// ─── FLOW STRIP ──────────────────────────────────────────────────────────────

function FlowStrip({ currentId, role }) {
  const th = THEME[role];
  const idx = STEPS.findIndex(s => s.id === currentId);
  return (
    <div style={{ background:BASE.surface, borderBottom:`1px solid ${BASE.border}`, padding:"12px 12px 10px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        {STEPS.map((s,i) => {
          const done=i<idx, active=i===idx;
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"0 6px" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:done?BASE.green:active?th.accent:BASE.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, boxShadow:active?`0 0 0 3px ${th.accent}33`:"none", transition:"all .3s" }}>
                  {done ? <span style={{ color:"white", fontWeight:900 }}>✓</span> : <span style={{ filter:active?"none":"grayscale(1)", opacity:active?1:.4 }}>{s.emoji}</span>}
                </div>
                <span style={{ fontSize:8, fontWeight:700, color:done?BASE.green:active?th.accent:BASE.sub, whiteSpace:"nowrap" }}>{s.title}</span>
              </div>
              {i<STEPS.length-1 && <div style={{ width:20, height:2, borderRadius:1, background:i<idx?BASE.green:BASE.border, flexShrink:0, marginBottom:14 }}/>}
            </div>
          );
        })}
      </div>
      <div style={{ height:3, background:BASE.border, borderRadius:2, marginTop:8 }}>
        <div style={{ height:"100%", borderRadius:2, background:th.accent, width:`${(idx/(STEPS.length-1))*100}%`, transition:"width .4s ease" }}/>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────

function BottomNav({ active, onChange, unreadCount, role }) {
  const th = THEME[role];
  const items = [
    { id:"home",    emoji:"🏠", label:"ホーム"    },
    { id:"notifs",  emoji:"🔔", label:"通知",      badge:unreadCount },
    { id:"cases",   emoji:"🗂️", label:"過去案件"  },
    { id:"memo",    emoji:"📝", label:"共有メモ"  },
    { id:"profile", emoji:"👤", label:"マイページ" },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:500, background:BASE.surface, borderTop:`1px solid ${BASE.border}`, paddingBottom:"env(safe-area-inset-bottom)" }}>
      <div style={{ display:"flex", justifyContent:"space-around", height:60, alignItems:"center" }}>
        {items.map(n => (
          <button key={n.id} onClick={()=>onChange(n.id)} className="tap-scale" style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:1,
            background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
            color:active===n.id?th.accent:BASE.sub, padding:"4px 8px", position:"relative",
          }}>
            {active===n.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:24, height:2.5, borderRadius:2, background:th.accent }}/>}
            <span style={{ fontSize:20 }}>{n.emoji}</span>
            <span style={{ fontSize:8, fontWeight:700 }}>{n.label}</span>
            {n.badge>0 && <div style={{ position:"absolute", top:2, right:4, width:15, height:15, borderRadius:"50%", background:BASE.red, color:"white", fontSize:8, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{n.badge}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PRESIDENT PASSCODE ───────────────────────────────────────────────────────

function PresidentLock({ onUnlock }) {
  const [code, setCode] = useState("");
  const [err,  setErr]  = useState(false);

  const tryUnlock = () => {
    if (code === PASSCODES.president) { onUnlock(); }
    else { setErr(true); setCode(""); setTimeout(()=>setErr(false), 1500); }
  };

  return (
    <div style={{ padding:"32px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
      <div style={{ fontSize:56 }}>👑</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:22, fontWeight:900, color:BASE.text }}>経営者専用ビュー</div>
        <div style={{ fontSize:13, color:BASE.sub, marginTop:4 }}>パスコードを入力してください</div>
      </div>

      <div style={{ width:"100%", maxWidth:280 }}>
        <input
          type="password"
          value={code}
          onChange={e=>setCode(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&tryUnlock()}
          placeholder="パスコード"
          maxLength={8}
          style={{
            width:"100%", padding:"16px", borderRadius:14, textAlign:"center",
            border:`2px solid ${err?BASE.red:BASE.purple}`,
            background: err?"#FFF0F0":BASE.bg,
            fontSize:24, letterSpacing:8, fontFamily:"inherit", outline:"none",
            color: err?BASE.red:BASE.text,
            transition:"all .2s",
          }}
        />
        {err && <p style={{ textAlign:"center", fontSize:12, color:BASE.red, marginTop:8, fontWeight:700 }}>パスコードが違います</p>}
      </div>

      <TapBtn color={BASE.purple} onClick={tryUnlock}>
        入室する →
      </TapBtn>

      <p style={{ fontSize:11, color:BASE.sub, textAlign:"center" }}>
        ※ デモ用パスコード：3333
      </p>
    </div>
  );
}

// ─── PRESIDENT DASHBOARD ─────────────────────────────────────────────────────

function PresidentDashboard({ onExit }) {
  const [selected, setSelected] = useState(null);

  const totalPending = BOSS_METRICS.reduce((a,b)=>a+b.pending, 0);
  const avgScore     = Math.round(BOSS_METRICS.reduce((a,b)=>a+b.score,0) / BOSS_METRICS.length);
  const sorted       = [...BOSS_METRICS].sort((a,b)=>b.score-a.score);

  // 放置案件一覧（思案中が3日以上のもの）
  const pendingList = BOSS_METRICS.flatMap(b =>
    b.pendingDays
      .filter(d => d >= 3)
      .map((d, i) => ({ boss:b.name, dept:b.dept, days:d, id:`${b.id}-${i}` }))
  ).sort((a,b) => b.days - a.days);

  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* ヘッダー */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:20, fontWeight:900, color:BASE.text }}>👑 経営者ダッシュボード</div>
          <div style={{ fontSize:12, color:BASE.sub, marginTop:2 }}>上司の判断力を分析しています</div>
        </div>
        <button onClick={onExit} style={{ fontSize:12, color:BASE.sub, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>← 戻る</button>
      </div>

      {/* 組織スコアバナー */}
      <Tile style={{ background:"linear-gradient(135deg,#1E1035,#3B0764)", padding:"22px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:700 }}>組織の判断力スコア</div>
            <div style={{ fontSize:42, fontWeight:900, color:"white", lineHeight:1 }}>{avgScore}<span style={{ fontSize:16, color:"rgba(255,255,255,0.5)" }}>/100</span></div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>放置案件</div>
            <div style={{ fontSize:30, fontWeight:900, color:totalPending>5?BASE.red:"#81C784" }}>{totalPending}件</div>
          </div>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.15)", borderRadius:3 }}>
          <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#A78BFA,#7C3AED)", width:`${avgScore}%`, transition:"width .6s ease" }}/>
        </div>
      </Tile>

      {/* ─── 承認・却下・思案中の比率グラフ ─── */}
      <Tile>
        <Lbl>承認 / 却下 / 思案中 の比率（上司別）</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:8 }}>
          {sorted.map(b => {
            const total = b.total;
            const aR = Math.round(b.approved/total*100);
            const rR = Math.round(b.rejected/total*100);
            const pR = Math.round(b.pending/total*100);
            const grade = getGrade(b.score);
            return (
              <div key={b.id}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:800 }}>{b.name}</span>
                    <span style={{ fontSize:11, color:BASE.sub, marginLeft:6 }}>{b.dept}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:900, color:grade.color, background:grade.bg, padding:"2px 10px", borderRadius:10 }}>{grade.label}</span>
                </div>
                {/* 横積みバー */}
                <div style={{ display:"flex", height:14, borderRadius:7, overflow:"hidden", gap:2 }}>
                  <div style={{ width:`${aR}%`, background:BASE.green, display:"flex", alignItems:"center", justifyContent:"center", transition:"width .5s" }}>
                    {aR>10&&<span style={{ fontSize:9, color:"white", fontWeight:700 }}>{aR}%</span>}
                  </div>
                  <div style={{ width:`${rR}%`, background:BASE.red, display:"flex", alignItems:"center", justifyContent:"center", transition:"width .5s" }}>
                    {rR>10&&<span style={{ fontSize:9, color:"white", fontWeight:700 }}>{rR}%</span>}
                  </div>
                  <div style={{ width:`${pR}%`, background:BASE.orange, display:"flex", alignItems:"center", justifyContent:"center", transition:"width .5s" }}>
                    {pR>10&&<span style={{ fontSize:9, color:"white", fontWeight:700 }}>{pR}%</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  {[
                    {label:"承認",value:b.approved,color:BASE.green},
                    {label:"却下",value:b.rejected,color:BASE.red},
                    {label:"思案中",value:b.pending,color:BASE.orange},
                  ].map(s=>(
                    <div key={s.label} style={{ display:"flex", alignItems:"center", gap:3 }}>
                      <div style={{ width:7,height:7,borderRadius:"50%",background:s.color }}/>
                      <span style={{ fontSize:10, color:BASE.sub }}>{s.label} <strong style={{ color:s.color }}>{s.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {/* 凡例 */}
        <div style={{ display:"flex", gap:12, marginTop:14, paddingTop:12, borderTop:`1px solid ${BASE.border}`, flexWrap:"wrap" }}>
          {[{label:"承認",color:BASE.green},{label:"却下",color:BASE.red},{label:"思案中（保留）",color:BASE.orange}].map(l=>(
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:l.color }}/>
              <span style={{ fontSize:11, color:BASE.sub }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Tile>

      {/* ─── 放置案件一覧 ─── */}
      <Tile style={{ borderLeft:`4px solid ${BASE.orange}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <span style={{ fontSize:18 }}>⏰</span>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:BASE.text }}>思案中のまま放置している案件</div>
            <div style={{ fontSize:11, color:BASE.sub }}>3日以上保留中 · {pendingList.length}件</div>
          </div>
        </div>
        {pendingList.length === 0 ? (
          <div style={{ textAlign:"center", padding:"16px", color:BASE.green, fontSize:13, fontWeight:700 }}>✅ 放置案件なし</div>
        ) : (
          pendingList.map((p,i) => {
            const urgency = p.days >= 10 ? { color:BASE.red, label:"緊急" } : p.days >= 7 ? { color:BASE.orange, label:"注意" } : { color:BASE.sub, label:"確認" };
            return (
              <div key={p.id} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 0",
                borderBottom: i<pendingList.length-1 ? `1px solid ${BASE.border}` : "none",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background:`${urgency.color}15`,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                }}>
                  <div style={{ fontSize:16, fontWeight:900, color:urgency.color, lineHeight:1 }}>{p.days}</div>
                  <div style={{ fontSize:8, color:urgency.color, fontWeight:700 }}>日</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:BASE.text }}>{p.boss}</div>
                  <div style={{ fontSize:11, color:BASE.sub }}>{p.dept}</div>
                </div>
                <span style={{
                  fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20,
                  background:`${urgency.color}15`, color:urgency.color,
                }}>{urgency.label}</span>
              </div>
            );
          })
        )}
      </Tile>

      {/* 上司ランキング（詳細） */}
      <div>
        <Lbl>上司の総合ランキング</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sorted.map((b,i)=>{
            const grade=getGrade(b.score);
            const isOpen=selected===b.id;
            return (
              <div key={b.id}>
                <button onClick={()=>setSelected(isOpen?null:b.id)} className="tap-scale" style={{ width:"100%", background:BASE.surface, borderRadius:16, padding:"16px 18px", border:`1.5px solid ${isOpen?grade.color:BASE.border}`, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all .2s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ fontSize:20, fontWeight:900, color:i===0?"#F59E0B":i===1?"#9CA3AF":i===2?"#B45309":BASE.sub, minWidth:24, textAlign:"center" }}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:800 }}>{b.name}</div>
                      <div style={{ fontSize:11, color:BASE.sub, marginTop:1 }}>{b.dept}</div>
                    </div>
                    <div style={{ fontSize:26, fontWeight:900, color:grade.color, background:grade.bg, width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>{grade.label}</div>
                    <span style={{ fontSize:16, color:BASE.border }}>{isOpen?"▲":"▼"}</span>
                  </div>
                </button>
                {isOpen && (
                  <div style={{ background:grade.bg, borderRadius:"0 0 16px 16px", padding:"16px 18px", border:`1.5px solid ${grade.color}`, borderTop:"none", marginTop:-4 }}>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:BASE.sub, marginBottom:6 }}>
                        <span>判断力スコア</span>
                        <span style={{ fontWeight:800, color:grade.color }}>{b.score} / 100</span>
                      </div>
                      <div style={{ height:8, background:"rgba(0,0,0,0.08)", borderRadius:4 }}>
                        <div style={{ height:"100%", borderRadius:4, background:grade.color, width:`${b.score}%`, transition:"width .5s" }}/>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                      <div style={{ background:BASE.surface, borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:900, color:b.avgDays<=2?BASE.green:b.avgDays<=4?BASE.orange:BASE.red }}>{b.avgDays}日</div>
                        <div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>平均決断スピード</div>
                      </div>
                      <div style={{ background:BASE.surface, borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:900, color:b.pending===0?BASE.green:b.pending<=2?BASE.orange:BASE.red }}>{b.pending}件</div>
                        <div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>現在の保留中</div>
                      </div>
                    </div>
                    <div style={{ padding:"12px 14px", background:BASE.surface, borderRadius:12, fontSize:13, color:BASE.text, lineHeight:1.7 }}>
                      {b.score>=85 && "✅ 優秀な判断力。承認・却下ともに迅速で明確。組織の模範です。"}
                      {b.score>=70 && b.score<85 && "👍 安定した判断力。保留案件も少なく影響は最小限です。"}
                      {b.score>=50 && b.score<70 && "⚠️ 概ね良好ですが、保留案件の処理を速めると更に向上します。"}
                      {b.score>=30 && b.score<50 && "🔴 保留案件が多く、スタッフの業務が滞るリスクがあります。"}
                      {b.score<30  && "🚨 判断の遅延・放置が常態化。役職の機能を果たしていない状態です。即時改善が必要です。"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── PRESIDENT SCREEN ────────────────────────────────────────────────────────

function PresidentScreen({ onExit }) {
  return <PresidentDashboard onExit={onExit}/>;
}

// ─── AI COACHING ─────────────────────────────────────────────────────────────

function AICoach({ task, onDone, onSkip }) {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [phase,    setPhase]    = useState("chat");
  const [refined,  setRefined]  = useState(null);

  const SYSTEM = `あなたは職場のコミュニケーションコーチです。部下が上司に報告・相談する文章を、シンプルで伝わりやすくする手助けをします。

案件：「${task.title}」
内容：${task.detail}

会話の進め方：
- 「上司が何を知りたいか」に絞った質問を1つだけする
- 3回やり取りしたら改善案を出す

改善案のルール：
- 3行以内に収める
- 結論から書く（何をしたい／何が必要か）
- 箇条書き・記号（**など）は使わない
- 敬語は使わず、話し言葉に近いシンプルな文体
- 最後は「いかがでしょうか」で締めない

出力形式：必ず「提案改善案：」で始める1〜3文の短い文章のみ。説明や前置き不要。`;


  // マウント時に1回だけAI最初のメッセージを送る
  useEffect(() => {
    setLoading(true);
    fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "anthropic-beta":"messages-2023-06-01" },
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM,
        messages:[{ role:"user", content:`案件「${task.title}」について上司への提案を改善したいです。` }]
      })
    })
    .then(r=>r.json())
    .then(data=>{
      const text = data.content?.[0]?.text ?? "この提案で、上司が最も重視するのは何だと思いますか？";
      setMessages([{ role:"assistant", content:text }]);
      setLoading(false);
    })
    .catch(()=>{
      setMessages([{ role:"assistant", content:"上司が最も重視するのは何だと思いますか？コスト・スピード・リスクで考えてみてください。" }]);
      setLoading(false);
    });
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(""); // 即クリア
    const userMsg = { role:"user", content:text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "anthropic-beta":"messages-2023-06-01" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM,
          messages:newMsgs
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "なるほど。それを踏まえて、上司にどう伝えますか？";
      setMessages(prev=>[...prev, { role:"assistant", content:reply }]);
      if (reply.includes("提案改善案：") || reply.includes("提案改善案:")) {
        const r = reply.split(/提案改善案[：:]/)[1]?.trim();
        if (r) { setRefined(r); setPhase("done"); }
      }
    } catch {
      setMessages(prev=>[...prev, { role:"assistant", content:"もう少し具体的に教えてください。" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>

      {/* ヘッダー：シンプルに */}
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"12px 14px", borderRadius:14,
        background:"linear-gradient(135deg,#E8F0FF,#F0F4FF)",
        border:"1px solid #0066FF22",
      }}>
        <div style={{ width:34, height:34, borderRadius:10, background:"#0066FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:900, color:"#003FA3" }}>AIコーチ</div>
          <div style={{ fontSize:11, color:BASE.sub }}>上司が重視することを一緒に考えます</div>
        </div>
        <button onClick={onSkip} className="tap-scale" style={{
          padding:"6px 12px", borderRadius:20,
          border:`1.5px solid ${BASE.border}`,
          background:BASE.surface, color:BASE.sub,
          fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0,
        }}>スキップ →</button>
      </div>

      {/* 入力した内容を表示 */}
      <Tile style={{ background:BASE.bg, padding:"12px 14px" }}>
        <Lbl>あなたが書いた内容</Lbl>
        <div style={{ fontSize:13, color:BASE.text, lineHeight:1.7 }}>
          {task.detail || task.title}
        </div>
        {task.deadline && (
          <div style={{ fontSize:11, color:BASE.sub, marginTop:6 }}>
            期限：{task.deadline}　{task.urgent && <span style={{ color:BASE.red, fontWeight:700 }}>🚨 緊急</span>}
          </div>
        )}
      </Tile>
      {phase==="chat" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Tile style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {messages.length === 0 && loading && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"10px 16px", borderRadius:"16px 16px 16px 4px", background:"#F0F4FF", fontSize:13, color:BASE.sub }}>
                  考えています…
                </div>
              </div>
            )}
            {messages.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{
                  maxWidth:"82%", padding:"10px 14px",
                  borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role==="user" ? "#0066FF" : "#F0F4FF",
                  color: m.role==="user" ? "white" : BASE.text,
                  fontSize:13, lineHeight:1.7,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {messages.length > 0 && loading && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"10px 16px", borderRadius:"16px 16px 16px 4px", background:"#F0F4FF", fontSize:13, color:BASE.sub }}>
                  考えています…
                </div>
              </div>
            )}
          </Tile>

          {/* 入力エリア */}
          <div style={{ display:"flex", gap:8 }}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{
                if(e.key==="Enter" && !e.nativeEvent.isComposing){
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="返答を入力…"
              style={{ flex:1, padding:"12px 14px", borderRadius:12, border:`1.5px solid ${BASE.border}`, background:BASE.bg, fontSize:14, fontFamily:"inherit", outline:"none" }}
            />
            <button
              onMouseDown={e=>{ e.preventDefault(); sendMessage(); }}
              disabled={!input.trim()||loading}
              className="tap-scale"
              style={{
                width:46, height:46, borderRadius:12, border:"none",
                background: input.trim()&&!loading ? "#0066FF" : "#E8E6E0",
                color:"white", fontSize:18, cursor: input.trim()&&!loading?"pointer":"default",
              }}>→</button>
          </div>
        </div>
      )}

      {/* 完了 */}
      {phase==="done" && refined && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Tile style={{ background:"#F0FFF5", borderLeft:`4px solid ${BASE.green}` }}>
            <div style={{ fontSize:13, fontWeight:800, color:BASE.green, marginBottom:8 }}>✅ 改善された提案文</div>
            <div style={{ fontSize:13, color:BASE.text, lineHeight:1.8 }}>{refined}</div>
          </Tile>
          <TapBtn color={BASE.green} onClick={()=>onDone(refined)}>この提案で上司へ送る →</TapBtn>
          <button onClick={onSkip} className="tap-scale" style={{
            padding:"14px", borderRadius:12,
            border:`1.5px solid ${BASE.border}`,
            background:"transparent", color:BASE.sub,
            fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", width:"100%",
          }}>元の内容のまま送る</button>
        </div>
      )}
    </div>
  );
}

function BossReplyBanner() {
  const [bossNotifs, setBossNotifs] = useState([]);
  const [actionDone, setActionDone] = useState({});

  useEffect(()=>{
    const load = () => setBossNotifs(STORE.getBossNotifs());
    load();
    const timer = setInterval(load, 2000);
    return ()=>clearInterval(timer);
  }, []);

  // スタッフの返答内容に応じた上司アクション定義
  const bossActions = {
    "✅ 対応します":          ["✅ 了解しました","📋 進捗を報告してください"],
    "📋 内容を確認しました":   ["✅ 了解しました","📅 完了したら報告を"],
    "🔄 内容を見直します":     ["✅ よろしくお願いします","📅 期限を延ばします"],
    "💬 理由を確認したい":     ["📞 改めて説明します","💬 チャットで説明します"],
    "⏳ 返答をお待ちします":   ["✅ 引き続きお願いします"],
    "💬 いつ頃いただけますか？":["📅 来週中に返答します","📞 電話で相談しましょう"],
    "🔄 修正して再提出します": ["✅ お待ちしています","📋 修正ポイントを共有します"],
    "💬 どこを直せばよいですか？":["📞 打ち合わせしましょう","💬 コメントを送ります"],
  };

  const handleBossAction = (notifId, taskId, actionLabel) => {
    // スレッドに記録
    if (taskId) STORE.addThread(taskId, { from:"上司", message:actionLabel });
    // スタッフへ通知
    const task = STORE.getTasks().find(t=>t.id===taskId);
    STORE.addNotif({
      type:"boss_action", emoji:"👔",
      title:"上司から返答がありました",
      case: task?.detail?.slice(0,30)??"案件",
      from:"上司", detail:`「${actionLabel}」`,
    });
    // この通知を既読に
    const all = STORE.getBossNotifs().map(n=>n.id===notifId?{...n,unread:false,bossAction:actionLabel}:n);
    try { localStorage.setItem("pipe_boss_notifs", JSON.stringify(all)); } catch {}
    setBossNotifs(all);
    setActionDone(prev=>({...prev,[notifId]:actionLabel}));
  };

  const active = bossNotifs.filter(n=>n.unread);
  if (active.length===0) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
      {active.map(n=>{
        const actions = bossActions[n.staffAction] ?? ["✅ 了解しました","💬 後で確認します"];
        const done = actionDone[n.id];
        return (
          <div key={n.id} style={{
            background:"#F0FFF5", borderRadius:14,
            border:`1.5px solid ${BASE.green}44`,
            padding:"14px",
            animation:"slideUp .3s ease",
          }}>
            {/* 通知ヘッダー */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:20 }}>📨</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color:BASE.green }}>スタッフから返答がありました</div>
                <div style={{ fontSize:11, color:BASE.sub }}>案件：{n.case} · {n.time}</div>
              </div>
            </div>

            {/* スタッフの返答内容 */}
            <div style={{ padding:"10px 12px", background:"#E8F0FF", borderRadius:10, marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#0044CC", fontWeight:700, marginBottom:2 }}>👤 スタッフの返答</div>
              <div style={{ fontSize:13, color:BASE.text, fontWeight:700 }}>{n.staffAction ?? n.detail}</div>
            </div>

            {/* 上司のアクションボタン */}
            {!done ? (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:BASE.sub, marginBottom:6 }}>あなたの返答</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {actions.map(a=>(
                    <button key={a} onClick={()=>handleBossAction(n.id, n.taskId, a)} className="tap-scale" style={{
                      padding:"9px 14px", borderRadius:10,
                      border:`1.5px solid ${BASE.green}55`,
                      background:"white", color:BASE.green,
                      fontSize:12, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit",
                    }}>{a}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize:12, color:BASE.green, fontWeight:700 }}>
                ✅ 返答済み：{done}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Intake({ onNext, role }) {
  const th = THEME[role];
  const [detail,   setDetail]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [urgent,   setUrgent]   = useState(false);
  const [boss,     setBoss]     = useState("");
  const [showAI,   setShowAI]   = useState(false);

  // 上司ロールの場合はスタッフを選ぶ、スタッフの場合は上司を選ぶ
  const CONNECTED = role==="boss"
    ? [
        { id:"tanaka",  name:"田中 一郎",  dept:"マーケティング部" },
        { id:"yamada",  name:"山田 花子",  dept:"マーケティング部" },
        { id:"suzuki",  name:"鈴木 健太",  dept:"営業部"          },
        { id:"sato",    name:"佐藤 由香",  dept:"人事部"          },
      ]
    : [
        { id:"yamamoto", name:"山本 部長",   dept:"マーケティング部 部長" },
        { id:"nakamura", name:"中村 課長",   dept:"営業部 課長"          },
        { id:"kobayashi",name:"小林 マネージャー", dept:"開発部"         },
      ];

  const ok = detail && deadline;

  if (showAI) return (
    <AICoach
      task={{ title: detail.split("\n")[0].slice(0, 30), detail }}
      onDone={(refined) => onNext({ title: refined.split("\n")[0].slice(0, 40), detail: refined, deadline, urgent, boss })}
      onSkip={() => onNext({ title: detail.split("\n")[0].slice(0, 40), detail, deadline, urgent, boss })}
    />
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:th.accentSoft }}>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px", color:th.accentText }}>
          {role==="boss" ? "📤 仕事を振る" : "📝 受け取った内容を書く"}
        </p>
        <p style={{ fontSize:13, color:BASE.sub, margin:0 }}>
          {role==="boss" ? "スタッフへの指示内容を入力してください" : "上司から言われた内容をそのまま書いてください"}
        </p>
      </Tile>

      {/* AIバナー：スタッフのみ */}
      {role!=="boss" && (
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"10px 14px", borderRadius:12,
          background:"#E8F0FF", border:"1px solid #0066FF22",
        }}>
          <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:"linear-gradient(135deg,#0066FF,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
          <div style={{ fontSize:12, color:"#003FA3", fontWeight:700, flex:1 }}>AIと共に解決へ向かう</div>
          <div style={{ width:7, height:7, borderRadius:"50%", background:BASE.green, flexShrink:0 }}/>
        </div>
      )}

      <Tile style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* 送り先プルダウン（小さめ） */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:BASE.sub, fontWeight:700, whiteSpace:"nowrap" }}>
            {role==="boss" ? "振り先" : "上司"}
          </span>
          <div style={{ position:"relative", flex:1 }}>
            <select
              value={boss}
              onChange={e=>setBoss(e.target.value)}
              style={{
                width:"100%", padding:"7px 28px 7px 10px",
                borderRadius:8, border:`1.5px solid ${boss?BASE.text+"44":BASE.border}`,
                background:BASE.bg, color: boss ? BASE.text : BASE.sub,
                fontSize:12, fontFamily:"inherit", outline:"none",
                appearance:"none", cursor:"pointer",
              }}
            >
              <option value="">— 選択してください —</option>
              {CONNECTED.map(c=>(
                <option key={c.id} value={c.id}>{c.name}（{c.dept}）</option>
              ))}
            </select>
            {/* 矢印アイコン */}
            <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:10, color:BASE.sub, pointerEvents:"none" }}>▼</span>
          </div>
        </div>

        {/* 指示内容 */}
        <div>
          <Lbl>{role==="boss"?"指示内容":"上司からの指示内容"}</Lbl>
          <textarea
            value={detail}
            onChange={e=>setDetail(e.target.value)}
            placeholder={role==="boss"
              ? "例：来週までに新規クライアント向けの提案書を作成しておいて"
              : "例：来週までに新規クライアント向けの提案書を作っておいて"}
            style={{
              width:"100%", padding:"13px 14px", borderRadius:12,
              border:`1.5px solid ${BASE.border}`,
              background:BASE.bg, color:BASE.text,
              fontSize:15, fontFamily:"inherit", outline:"none",
              height:72, resize:"none", lineHeight:1.7,
            }}
          />
          <p style={{ fontSize:11, color:BASE.sub, margin:"4px 0 0 2px" }}>
            指示の内容をそのまま書けばOKです
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div><Lbl>希望期限</Lbl><Inp type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
          <div><Lbl>緊急度</Lbl>
            <button onClick={()=>setUrgent(u=>!u)} className="tap-scale" style={{
              width:"100%", padding:"13px 14px", borderRadius:12,
              border:`1.5px solid ${urgent?BASE.red:BASE.border}`,
              background:urgent?"#FFF0F0":BASE.bg,
              color:urgent?BASE.red:BASE.sub,
              fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>{urgent?"🚨 緊急":"⚡ 通常"}</button>
          </div>
        </div>
      </Tile>

      {/* 入力完了後：AIコーチボタン */}
      {role!=="boss" && ok && (
        <button onClick={()=>setShowAI(true)} className="tap-scale" style={{
          display:"flex", alignItems:"center", gap:12,
          padding:"14px 18px", borderRadius:14,
          border:"1.5px solid #0066FF55",
          background:"linear-gradient(135deg,#0055DD,#5B21B6)",
          cursor:"pointer", fontFamily:"inherit", textAlign:"left", width:"100%",
        }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"white" }}>AIと一緒に提案を深める</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:1 }}>上司が即決できる提案に仕上げましょう</div>
          </div>
          <span style={{ fontSize:16, color:"rgba(255,255,255,0.6)" }}>›</span>
        </button>
      )}

      <TapBtn color={th.accent} disabled={!ok} onClick={()=>onNext({ title: detail.split("\n")[0].slice(0,40), detail, deadline, urgent, boss })}>
        {ok ? (role==="boss" ? "スタッフに振る →" : "そのまま上司へ送る →") : "内容と期限を入力してください"}
      </TapBtn>
    </div>
  );
}

function Approval({ task, onNext, role }) {
  const th = THEME[role];
  const [screen,setScreen]=useState("main"); const [reason,setReason]=useState(null);

  // スタッフは操作できない・待機画面のみ表示
  if (role==="staff") return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:"#FFFBF0", borderLeft:`4px solid ${BASE.orange}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:36 }}>⏳</div>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:BASE.orange }}>上司の承認待ち</div>
            <div style={{ fontSize:12, color:BASE.sub, marginTop:2 }}>
              承認・却下の操作は<strong style={{ color:BASE.text }}>上司のみ</strong>が行えます
            </div>
          </div>
        </div>
      </Tile>

      {/* 送った内容の確認 */}
      <Tile>
        <Lbl>送付した内容</Lbl>
        <div style={{ fontSize:14, fontWeight:700, color:BASE.text, marginBottom:6 }}>{task.title}</div>
        <div style={{ fontSize:13, color:BASE.sub, lineHeight:1.7, marginBottom:10 }}>{task.detail}</div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1, background:BASE.bg, borderRadius:10, padding:"10px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:BASE.sub }}>期限</div>
            <div style={{ fontSize:13, fontWeight:700 }}>{task.deadline}</div>
          </div>
          <div style={{ flex:1, background:BASE.bg, borderRadius:10, padding:"10px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:BASE.sub }}>緊急度</div>
            <div style={{ fontSize:13, fontWeight:700, color: task.urgent?BASE.red:BASE.sub }}>{task.urgent?"🚨 緊急":"通常"}</div>
          </div>
        </div>
      </Tile>

      {/* ステータス */}
      <Tile>
        <Lbl>承認ステータス</Lbl>
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          {[
            { label:"✉️ 送付済み", active:true,  color:BASE.green  },
            { label:"⏳ 承認待ち", active:true,  color:BASE.orange },
            { label:"✅ 承認完了", active:false, color:BASE.sub    },
          ].map(s=>(
            <div key={s.label} style={{
              flex:1, padding:"10px 6px", borderRadius:12, textAlign:"center",
              background:s.active?`${s.color}15`:BASE.bg,
              border:`1.5px solid ${s.active?s.color+"55":BASE.border}`,
            }}>
              <div style={{ fontSize:11, fontWeight:700, color:s.active?s.color:BASE.sub, lineHeight:1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Tile>

      <div style={{ padding:"12px 16px", background:"#F0F4FF", borderRadius:14, fontSize:13, color:"#0044CC", lineHeight:1.7, textAlign:"center" }}>
        💡 上司が承認すると自動で次のステップに進みます
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:th.accentSoft }}>
        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:th.accent, color:"white" }}>{th.emoji} {th.label}ビュー</span>
        <p style={{ fontSize:18, fontWeight:900, margin:"8px 0 6px", color:th.accentText }}>
          この案件をどう判断しますか？
        </p>
        {/* 案件の詳細 */}
        <div style={{ background:"white", borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:14, fontWeight:800, color:BASE.text, marginBottom:6, lineHeight:1.5 }}>
            {task.detail || task.title}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <span style={{ fontSize:11, color:BASE.sub }}>期限：{task.deadline}</span>
            {task.urgent && <span style={{ fontSize:11, fontWeight:700, color:BASE.red }}>🚨 緊急</span>}
            {task.boss && <span style={{ fontSize:11, color:BASE.sub }}>送信者：{task.boss}</span>}
          </div>
        </div>
      </Tile>
      {screen==="main" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {(role==="boss"?[
            {emoji:"✅",label:"承認する",       sub:"このまま進めてよい",               color:BASE.green,  cb:()=>onNext("approved")},
            {emoji:"❌",label:"否認する",       sub:"この案件は進めない",               color:BASE.red,    cb:()=>onNext("rejected")},
            {emoji:"⏸️",label:"保留にする",     sub:"今は判断しない・一時停止",         color:BASE.orange, cb:()=>setScreen("reason")},
            {emoji:"💬",label:"相談し直したい", sub:"内容を変えてもう一度持ってきて",   color:BASE.purple, cb:()=>setScreen("reason")},
          ]:[
            {emoji:"✅",label:"承認する",    sub:"このまま進めてOK",         color:BASE.green,  cb:()=>onNext("approved")},
            {emoji:"❌",label:"却下する",    sub:"この案件はなしにする",      color:BASE.red,    cb:()=>onNext("rejected")},
            {emoji:"🤔",label:"まだ思案中…", sub:"理由を伝えて担当者に返す",  color:BASE.orange, cb:()=>setScreen("reason")},
          ]).map(b=>(
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
            <Lbl>何が引っかかっていますか？</Lbl>
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
            <Lbl>📩 担当者への通知内容</Lbl>
            {[`理由：${reason?.text}`,`案件：${task.title}`,"カレンダーから候補日を自動提案"].map((t,i)=>(
              <p key={i} style={{ fontSize:13, color:BASE.text, margin:"4px 0" }}>• {t}</p>
            ))}
          </Tile>
          <Tile>
            <Lbl>📅 候補日程（自動生成）</Lbl>
            {SLOTS.map(s=>(
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:`1px solid ${BASE.border}` }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:BASE.green,flexShrink:0 }}/>
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
  const AP={approved:{emoji:"✅",label:"承認されました",color:BASE.green,bg:"#F0FFF5"},rejected:{emoji:"❌",label:"却下されました",color:BASE.red,bg:"#FFF0F0"},talk:{emoji:"💬",label:"話し合いが必要です",color:BASE.purple,bg:"#F5F0FF"}}[approval]??{emoji:"📢",label:"通知",color:BASE.sub,bg:BASE.bg};
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:AP.bg }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:36 }}>{AP.emoji}</span>
          <div><div style={{ fontSize:20, fontWeight:900, color:AP.color }}>{AP.label}</div><div style={{ fontSize:13, color:BASE.sub, marginTop:2 }}>{task.title}</div><div style={{ fontSize:12, color:BASE.sub }}>期限：{task.deadline}</div></div>
        </div>
      </Tile>
      <Tile>
        <Lbl>案件の流れ</Lbl>
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
        <Lbl>成果サマリー</Lbl>
        {[{label:"完了日",value:"2026年3月25日"},{label:"期限",value:task?.deadline??"—"},{label:"緊急案件",value:task?.urgent?"🚨 はい":"なし"},{label:"承認者",value:"上司（確認済み）"}].map((r,i,arr)=>(
          <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<arr.length-1?`1px solid ${BASE.border}`:"none" }}>
            <span style={{ fontSize:13, color:BASE.sub }}>{r.label}</span>
            <span style={{ fontSize:14, fontWeight:700 }}>{r.value}</span>
          </div>
        ))}
      </Tile>
      <TapBtn color={th.accent} onClick={onReset}>{role==="boss"?"新しい仕事を振る +":"新しい案件を受け取る +"}</TapBtn>
    </div>
  );
}

// ─── DATA STORE（localStorage永続化） ────────────────────────────────────────

const STORE = {
  getTasks: () => {
    try { return JSON.parse(localStorage.getItem("pipe_tasks") || "[]"); } catch { return []; }
  },
  saveTasks: (tasks) => {
    try { localStorage.setItem("pipe_tasks", JSON.stringify(tasks)); } catch {}
  },
  getNotifs: () => {
    try { return JSON.parse(localStorage.getItem("pipe_notifs") || "[]"); } catch { return []; }
  },
  saveNotifs: (notifs) => {
    try { localStorage.setItem("pipe_notifs", JSON.stringify(notifs)); } catch {}
  },
  addTask: (task) => {
    const tasks = STORE.getTasks();
    const newTask = {
      ...task, id: Date.now(), status:"pending",
      createdAt: new Date().toLocaleString("ja-JP"),
      judgedAt:null, judgment:null, judgeComment:null,
      thread: [], // やり取り履歴
    };
    tasks.unshift(newTask);
    STORE.saveTasks(tasks);
    return newTask;
  },
  updateTask: (id, updates) => {
    const tasks = STORE.getTasks().map(t => t.id===id ? {...t,...updates} : t);
    STORE.saveTasks(tasks);
  },
  // タスクのスレッドにメッセージを追加
  addThread: (taskId, { from, message }) => {
    const tasks = STORE.getTasks();
    const task = tasks.find(t=>t.id===taskId);
    if (!task) return;
    const thread = task.thread ?? [];
    thread.push({ from, message, at: new Date().toLocaleString("ja-JP") });
    STORE.updateTask(taskId, { thread });
  },
  addNotif: (notif) => {
    const notifs = STORE.getNotifs();
    notifs.unshift({ ...notif, id: Date.now(), time: new Date().toLocaleString("ja-JP"), unread:true });
    STORE.saveNotifs(notifs);
  },
  // 上司向け通知（別キー）
  getBossNotifs: () => {
    try { return JSON.parse(localStorage.getItem("pipe_boss_notifs") || "[]"); } catch { return []; }
  },
  addBossNotif: (notif) => {
    const notifs = STORE.getBossNotifs();
    notifs.unshift({ ...notif, id: Date.now(), time: new Date().toLocaleString("ja-JP"), unread:true });
    try { localStorage.setItem("pipe_boss_notifs", JSON.stringify(notifs)); } catch {}
  },
  clearBossNotifs: () => {
    try { localStorage.setItem("pipe_boss_notifs", "[]"); } catch {}
  },
};

// ─── TASK STATUS BANNER（スタッフ向け：上司の判断を表示） ─────────────────────

function TaskStatusBanner({ onReset }) {
  const [tasks,    setTasks]    = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(()=>{
    const load = () => setTasks(STORE.getTasks().slice(0, 5));
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, []);

  if (tasks.length === 0) return null;

  const statusInfo = {
    pending:      { label:"⏳ 承認待ち",      color:BASE.orange, bg:"#FFFBF0" },
    approved:     { label:"✅ 承認されました", color:BASE.green,  bg:"#F0FFF5" },
    rejected:     { label:"❌ 否認されました", color:BASE.red,    bg:"#FFF0F0" },
    pending_hold: { label:"⏸️ 保留中",         color:BASE.orange, bg:"#FFF6EE" },
    consult:      { label:"💬 相談し直して",   color:BASE.purple, bg:"#F5F0FF" },
    staff_replied:{ label:"📨 返答済み",       color:"#0066FF",   bg:"#E8F0FF" },
    completed:    { label:"✅ 完了",           color:BASE.green,  bg:"#F0FFF5" },
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:4 }}>
      <Lbl>📋 送った案件の状況</Lbl>
      {tasks.map(task => {
        const si = statusInfo[task.status] ?? statusInfo.pending;
        const isOpen = expanded === task.id;

        return (
          <div key={task.id} style={{ background:si.bg, borderRadius:14, border:`1.5px solid ${si.color}44`, overflow:"hidden" }}>

            {/* タップで展開するヘッダー行 */}
            <button
              onClick={()=>setExpanded(isOpen ? null : task.id)}
              style={{ width:"100%", padding:"12px 14px", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}
              className="tap-scale"
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:BASE.text, lineHeight:1.5,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace: isOpen?"normal":"nowrap",
                  }}>
                    {task.detail}
                  </div>
                  <div style={{ fontSize:10, color:BASE.sub, marginTop:2 }}>送信：{task.createdAt}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:si.color, background:si.color+"18", padding:"2px 8px", borderRadius:10 }}>
                    {si.label}
                  </span>
                  <span style={{ fontSize:11, color:BASE.sub }}>{isOpen?"▲ 閉じる":"▼ 詳細"}</span>
                </div>
              </div>
            </button>

            {/* 展開エリア：全文・上司のコメント・スレッド */}
            {isOpen && (
              <div style={{ padding:"0 14px 14px", animation:"slideUp .2s ease" }}>

                {/* 指示内容（全文） */}
                <div style={{ padding:"10px 12px", background:"white", borderRadius:10, marginBottom:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:BASE.sub, marginBottom:4 }}>📝 送った内容（全文）</div>
                  <div style={{ fontSize:13, color:BASE.text, lineHeight:1.8 }}>{task.detail}</div>
                  <div style={{ marginTop:8, display:"flex", gap:10 }}>
                    {task.deadline && <span style={{ fontSize:11, color:BASE.sub }}>期限：{task.deadline}</span>}
                    {task.urgent   && <span style={{ fontSize:11, color:BASE.red, fontWeight:700 }}>🚨 緊急</span>}
                    {task.boss     && <span style={{ fontSize:11, color:BASE.sub }}>送り先：{task.boss}</span>}
                  </div>
                </div>

                {/* 上司のコメント */}
                {task.judgeComment && (
                  <div style={{ padding:"10px 12px", background:"white", borderRadius:10, marginBottom:8, borderLeft:`3px solid ${si.color}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:BASE.sub, marginBottom:4 }}>👔 上司のコメント</div>
                    <div style={{ fontSize:13, color:BASE.text, lineHeight:1.7 }}>{task.judgeComment}</div>
                    {task.judgedAt && <div style={{ fontSize:10, color:BASE.sub, marginTop:4 }}>判断日時：{task.judgedAt}</div>}
                  </div>
                )}

                {/* やり取り履歴 */}
                {task.thread?.length > 0 && (
                  <div style={{ padding:"10px 12px", background:"white", borderRadius:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:BASE.sub, marginBottom:6 }}>💬 やり取り履歴</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {task.thread.map((t,i)=>(
                        <div key={i} style={{
                          display:"flex", gap:8, alignItems:"flex-start",
                          padding:"6px 10px", borderRadius:8,
                          background: t.from==="上司" ? "#FFF7ED" : "#E8F0FF",
                        }}>
                          <span style={{ fontSize:11, fontWeight:700, color:t.from==="上司"?BASE.orange:"#0066FF", flexShrink:0 }}>
                            {t.from==="上司"?"👔":"👤"} {t.from}
                          </span>
                          <span style={{ fontSize:12, color:BASE.text, flex:1, lineHeight:1.5 }}>{t.message}</span>
                          <span style={{ fontSize:10, color:BASE.sub, flexShrink:0 }}>{t.at?.slice(5,10)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HomeScreen({ role, onSwitch, sharedTask, onShareTask }) {
  const th = THEME[role];

  if (role==="president") return <PresidentScreen onExit={()=>onSwitch&&onSwitch("staff")}/>;

  const [step,     setStep]     = useState("intake");
  const [taskData, setTaskData] = useState({title:"",detail:"",deadline:"",urgent:false});
  const [approval, setApproval] = useState("approved");
  const [toast,    setToast]    = useState(null);

  useEffect(()=>{
    if (role==="boss" && sharedTask && step==="intake") {
      setTaskData(sharedTask);
      setStep("approval");
    }
  }, [role, sharedTask]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2500); };

  const go = (next, payload) => {
    if (next==="approval")    showToast("上司へ送りました！");
    if (next==="staff_view") {
      const m={approved:"✅ 承認されました",rejected:"❌ 否認されました",pending_hold:"⏸️ 保留になりました",consult:"💬 相談し直しの依頼がきました",talk:"💬 日程調整を開始します"};
      showToast(m[payload]??"通知が届きました");
      setApproval(payload);
    }
    if (next==="report") showToast("通知しました");
    setStep(next);
  };

  const reset = () => {
    setStep("intake");
    setTaskData({title:"",detail:"",deadline:"",urgent:false});
    onShareTask&&onShareTask(null);
  };

  // スタッフが送信 → STOREに保存
  const handleStaffSubmit = (d) => {
    STORE.addTask(d);
    setTaskData(d);
    onShareTask&&onShareTask(d);
    go("approval");
  };

  // 上司が判断 → STORE更新 → スタッフへ通知
  const handleBossJudge = (result) => {
    const statusMap = { approved:"approved", rejected:"rejected", talk:"consult", pending_hold:"pending_hold", consult:"consult" };
    const labelMap  = { approved:"承認", rejected:"否認", pending_hold:"保留", consult:"相談し直し", talk:"相談" };
    const commentMap = {
      approved:     "このまま進めてください。",
      rejected:     "この案件は見送りにします。",
      pending_hold: "今は判断できません。少し待ってください。",
      consult:      "内容を見直して、もう一度持ってきてください。",
      talk:         "内容を一緒に確認したいので相談しましょう。",
    };
    const tasks = STORE.getTasks();
    if (tasks.length > 0) {
      STORE.updateTask(tasks[0].id, {
        status:       statusMap[result] ?? "pending",
        judgment:     labelMap[result]  ?? result,
        judgeComment: commentMap[result]?? "",
        judgedAt:     new Date().toLocaleString("ja-JP"),
      });
      // スレッドに上司の判断を記録
      STORE.addThread(tasks[0].id, { from:"上司", message:`【${labelMap[result]??result}】${commentMap[result]??""}` });
      // スタッフへ通知
      STORE.addNotif({
        type:   result,
        emoji:  result==="approved"?"✅":result==="rejected"?"❌":result==="pending_hold"?"⏸️":"💬",
        title:  `案件が「${labelMap[result]??result}」されました`,
        case:   tasks[0].detail?.slice(0,30)??"案件",
        from:   "上司",
        detail: commentMap[result]??"",
      });
    }
    go("staff_view", result);
  };

  return (
    <>
      {toast&&<Toast msg={toast} accent={th.accent}/>}
      <FlowStrip currentId={step} role={role}/>
      <div style={{ padding:"16px" }}>

        {/* 上司：スタッフから届いた案件バナー */}
        {role==="boss" && sharedTask && step==="approval" && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, marginBottom:12, background:"#FFF7ED", border:`1.5px solid ${BASE.orange}44` }}>
            <span style={{ fontSize:18 }}>📨</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:BASE.orange }}>スタッフから届いた案件</div>
              <div style={{ fontSize:12, color:BASE.sub, marginTop:1 }}>{sharedTask.boss?`送信者：${sharedTask.boss}`:"スタッフより"}</div>
            </div>
            <div style={{ fontSize:10, color:BASE.orange, fontWeight:700, background:"#FFEDD5", padding:"2px 8px", borderRadius:10 }}>承認待ち</div>
          </div>
        )}

        {step==="intake"     && <Intake     onNext={role==="staff" ? handleStaffSubmit : d=>{setTaskData(d);go("approval")}} role={role}/>}
        {step==="approval"   && <>
          <Approval task={taskData} onNext={role==="boss" ? handleBossJudge : r=>go("staff_view",r)} role={role}/>
          {role==="staff" && (
            <div style={{ marginTop:12, padding:"14px 16px", background:"#1C191715", borderRadius:14, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>👔</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:BASE.text }}>上司として承認する場合</div>
                <div style={{ fontSize:11, color:BASE.sub, marginTop:1 }}>マイページからロールを「上司」に切り替えてください</div>
              </div>
            </div>
          )}
        </>}
        {step==="staff_view" && <StaffView  task={taskData} approval={approval} onNext={()=>go("report")} role={role}/>}
        {step==="report"     && <Report     task={taskData} onReset={reset} role={role}/>}
      </div>
    </>
  );
}

// 案件の質スコアデータ（サンプル）
const MY_STATS = {
  total:        12,
  approved:     9,
  rejected:     1,
  pending:      2,
  avgDecideDays:1.4,   // 上司の平均決定日数（自分の案件のみ）
  orgAvgDays:   3.8,   // 組織全体の平均
  clearRate:    83,    // 即決率（承認+却下） / 全体
  orgClearRate: 61,
};

function ProposalScoreCard() {
  const score = Math.round(
    (MY_STATS.approved / MY_STATS.total) * 40 +
    Math.max(0, (MY_STATS.orgAvgDays - MY_STATS.avgDecideDays) / MY_STATS.orgAvgDays * 40) +
    (MY_STATS.clearRate / 100) * 20
  );

  const grade = score >= 80 ? { label:"S", color:"#7C3AED", bg:"#F5F0FF", msg:"提案の質が非常に高いです。上司が迷わず決定できています。" }
              : score >= 65 ? { label:"A", color:BASE.green,  bg:"#F0FFF5", msg:"わかりやすい提案ができています。上司の決定も速いです。" }
              : score >= 50 ? { label:"B", color:"#0066FF",   bg:"#E8F0FF", msg:"概ね良好ですが、もう少し情報を整理すると上司が決めやすくなります。" }
              : score >= 35 ? { label:"C", color:BASE.orange,  bg:"#FFF6EE", msg:"提案内容が不明瞭な可能性があります。背景・目的・期待値を明確に。" }
              :               { label:"D", color:BASE.red,     bg:"#FFF0F0", msg:"上司を迷わせる提案が多い状態です。伝え方の見直しが必要です。" };

  const faster = MY_STATS.avgDecideDays < MY_STATS.orgAvgDays;

  return (
    <Tile style={{ background:grade.bg, borderLeft:`4px solid ${grade.color}` }}>
      {/* スコアヘッダー */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
        <div style={{
          width:56, height:56, borderRadius:14,
          background:grade.color, color:"white",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:28, fontWeight:900, flexShrink:0,
        }}>{grade.label}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:900, color:BASE.text }}>提案品質スコア</div>
          <div style={{ fontSize:12, color:BASE.sub, marginTop:2, lineHeight:1.6 }}>{grade.msg}</div>
        </div>
      </div>

      {/* 3指標 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
        {/* 承認率 */}
        <div style={{ background:"white", borderRadius:12, padding:"10px", textAlign:"center" }}>
          <div style={{ fontSize:11, color:BASE.sub, marginBottom:4 }}>承認率</div>
          <div style={{ fontSize:22, fontWeight:900, color:BASE.green, lineHeight:1 }}>
            {Math.round(MY_STATS.approved/MY_STATS.total*100)}%
          </div>
          <div style={{ fontSize:9, color:BASE.sub, marginTop:3 }}>
            {MY_STATS.approved}/{MY_STATS.total}件
          </div>
        </div>
        {/* 上司決定スピード */}
        <div style={{ background:"white", borderRadius:12, padding:"10px", textAlign:"center" }}>
          <div style={{ fontSize:11, color:BASE.sub, marginBottom:4 }}>上司の決定</div>
          <div style={{ fontSize:22, fontWeight:900, color: faster?BASE.green:BASE.orange, lineHeight:1 }}>
            {MY_STATS.avgDecideDays}日
          </div>
          <div style={{ fontSize:9, color:BASE.sub, marginTop:3 }}>
            平均{MY_STATS.orgAvgDays}日
          </div>
        </div>
        {/* 即決率 */}
        <div style={{ background:"white", borderRadius:12, padding:"10px", textAlign:"center" }}>
          <div style={{ fontSize:11, color:BASE.sub, marginBottom:4 }}>即決率</div>
          <div style={{ fontSize:22, fontWeight:900, color:"#0066FF", lineHeight:1 }}>
            {MY_STATS.clearRate}%
          </div>
          <div style={{ fontSize:9, color:BASE.sub, marginTop:3 }}>
            組織{MY_STATS.orgClearRate}%
          </div>
        </div>
      </div>

      {/* インサイト */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontSize:11, fontWeight:700, color:BASE.sub, marginBottom:2 }}>📊 あなたの提案が示すもの</div>
        {[
          faster
            ? { icon:"✅", text:`上司の決定が組織平均より${(MY_STATS.orgAvgDays - MY_STATS.avgDecideDays).toFixed(1)}日速い → 伝え方が明確です`, color:BASE.green }
            : { icon:"⚠️", text:`上司の決定が組織平均より${(MY_STATS.avgDecideDays - MY_STATS.orgAvgDays).toFixed(1)}日遅い → 情報整理を見直しましょう`, color:BASE.orange },
          MY_STATS.pending <= 1
            ? { icon:"✅", text:`思案中にさせた案件が${MY_STATS.pending}件 → 判断しやすい提案ができています`, color:BASE.green }
            : { icon:"⚠️", text:`思案中のまま${MY_STATS.pending}件残っている → 情報が不十分な可能性があります`, color:BASE.orange },
          { icon:"💡", text:"上司が悩む＝提案側の伝え方に改善の余地あり", color:BASE.sub },
        ].map((ins,i)=>(
          <div key={i} style={{
            display:"flex", alignItems:"flex-start", gap:8,
            padding:"8px 10px", borderRadius:8,
            background:"rgba(255,255,255,0.7)",
          }}>
            <span style={{ fontSize:13, flexShrink:0 }}>{ins.icon}</span>
            <span style={{ fontSize:12, color:ins.color, lineHeight:1.6 }}>{ins.text}</span>
          </div>
        ))}
      </div>
    </Tile>
  );
}

function CasesScreen({ role }) {
  const [storedTasks, setStoredTasks] = useState([]);
  const [confirmId,   setConfirmId]   = useState(null); // 削除確認中のタスクID

  // STOREから案件を読み込み
  useEffect(()=>{
    const load = () => setStoredTasks(STORE.getTasks());
    load();
    const timer = setInterval(load, 2000);
    return ()=>clearInterval(timer);
  }, []);

  const today = new Date();
  today.setHours(0,0,0,0);

  // 削除可能条件：完了済み OR 期限切れ
  const canDelete = (task) => {
    if (task.status==="approved" || task.status==="rejected") return true;
    if (task.deadline) {
      const d = new Date(task.deadline);
      if (d < today) return true;
    }
    return false;
  };

  const [actionDone, setActionDone] = useState({}); // id→true で完了済み

  const handleAction = (id, actionLabel) => {
    // STOREのタスクを更新
    STORE.updateTask(id, {
      staffAction:   actionLabel,
      staffActionAt: new Date().toLocaleString("ja-JP"),
      status:        "staff_replied",
    });
    // スレッドにスタッフの返答を追記
    STORE.addThread(id, { from:"スタッフ", message: actionLabel });
    // 上司向け通知を追加
    const task = STORE.getTasks().find(t=>t.id===id);
    STORE.addBossNotif({
      type:       "staff_action",
      emoji:      "📨",
      title:      "スタッフから返答がありました",
      case:       task?.detail?.slice(0,30)??"案件",
      from:       "スタッフ",
      detail:     `返答内容：${actionLabel}`,
      staffAction: actionLabel,
      taskId:     id,
    });
    // スタッフ自身の通知にも記録
    STORE.addNotif({
      type:"staff_action", emoji:"✅",
      title:"返答を送りました",
      case: task?.detail?.slice(0,30)??"案件",
      from:"あなた", detail:`「${actionLabel}」と上司に送信しました`,
    });
    setActionDone(prev=>({...prev,[id]:actionLabel}));
    setStoredTasks(STORE.getTasks());
  };

  const handleDelete = (id) => {
    const tasks = STORE.getTasks().filter(t=>t.id!==id);
    STORE.saveTasks(tasks);
    setStoredTasks(tasks);
    setConfirmId(null);
  };

  const statusMap = {
    completed:    { label:"完了",     color:BASE.green  },
    active:       { label:"進行中",   color:BASE.orange },
    approved:     { label:"承認済",   color:BASE.green  },
    rejected:     { label:"否認",     color:BASE.red    },
    pending:      { label:"承認待ち", color:BASE.orange },
    pending_hold: { label:"保留中",   color:BASE.orange },
    consult:      { label:"相談中",   color:BASE.purple },
  };
  const priorityMap={高:{bg:"#FFF0F0",color:BASE.red},中:{bg:"#FFF6EE",color:BASE.orange},低:{bg:"#F0FFF5",color:BASE.green}};

  // 完了済み・やり取りが終わった案件のみ「過去案件」に表示
  // 完了条件：staffAction が設定済み（スタッフが返答した）、または approved/rejected かつ staffAction あり
  const isArchived = (t) =>
    (t.status==="approved"     && t.staffAction) ||
    (t.status==="rejected"     && t.staffAction) ||
    (t.status==="staff_replied"&& t.staffAction) ||
    t.status==="completed";

  const allCases = [
    ...storedTasks.filter(isArchived).map(t=>({ id:t.id, title:t.detail?.slice(0,30)??"案件", status:t.status??"pending", date:t.createdAt?.slice(0,10)??"", priority:"中", members:[], isReal:true, deadline:t.deadline, judgeComment:t.judgeComment, staffAction:t.staffAction, thread:t.thread })),
    ...SAMPLE_CASES.map(c=>({...c, isReal:false, thread:[]})),
  ];

  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
      {role==="staff" && <ProposalScoreCard/>}

      {/* スタッフ：案件の状況（展開で全文読める） */}
      {role==="staff" && <TaskStatusBanner/>}

      {/* 上司：スタッフからの返答アクション */}
      {role==="boss" && <BossReplyBanner/>}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
        <div style={{ fontSize:14, fontWeight:900, color:BASE.text }}>🗂️ 過去案件</div>
        {role==="staff" && (
          <div style={{ fontSize:11, color:BASE.sub }}>完了・期限切れのみ削除可</div>
        )}
      </div>

      {allCases.map(c=>{
        const s = statusMap[c.status] ?? { label:c.status, color:BASE.sub };
        const p = priorityMap[c.priority] ?? priorityMap["中"];
        const deletable = role==="staff" && c.isReal && canDelete(c);
        const isConfirming = confirmId === c.id;

        return (
          <Tile key={c.id} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div style={{ fontSize:14, fontWeight:800, flex:1, marginRight:8, lineHeight:1.5 }}>{c.title}</div>
              <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, background:s.color+"15", color:s.color, flexShrink:0 }}>{s.label}</span>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom: c.judgeComment?8:0 }}>
              {c.date && <span style={{ fontSize:11, color:BASE.sub }}>{c.date}</span>}
              {c.deadline && <span style={{ fontSize:11, color:BASE.sub }}>期限：{c.deadline}</span>}
              {c.priority && <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:p.bg, color:p.color }}>優先度：{c.priority}</span>}
              {c.members?.length>0 && <span style={{ fontSize:11, color:BASE.sub }}>👥 {c.members.join("・")}</span>}
            </div>

            {/* やり取り履歴（スレッド） */}
            {c.thread?.length > 0 && (
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:BASE.sub, marginBottom:4 }}>やり取り履歴</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {c.thread.map((t,i)=>(
                    <div key={i} style={{
                      display:"flex", gap:8, alignItems:"flex-start",
                      padding:"6px 10px", borderRadius:8,
                      background: t.from==="上司" ? "#FFF7ED" : "#E8F0FF",
                    }}>
                      <span style={{ fontSize:11, fontWeight:700, color: t.from==="上司"?BASE.orange:"#0066FF", flexShrink:0 }}>{t.from==="上司"?"👔":"👤"} {t.from}</span>
                      <span style={{ fontSize:12, color:BASE.text, flex:1, lineHeight:1.5 }}>{t.message}</span>
                      <span style={{ fontSize:10, color:BASE.sub, flexShrink:0 }}>{t.at?.slice(0,5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {c.judgeComment && (
              <div style={{ fontSize:12, color:BASE.sub, padding:"6px 10px", background:BASE.bg, borderRadius:8, lineHeight:1.6, marginBottom:8 }}>
                💬 上司より：{c.judgeComment}
              </div>
            )}

            {/* スタッフのアクションボタン（上司の判断がある実案件のみ） */}
            {role==="staff" && c.isReal && c.status!=="pending" && c.status!=="completed" && !actionDone[c.id] && (()=>{
              const actions = {
                approved:     ["✅ 対応します", "📋 内容を確認しました"],
                rejected:     ["🔄 内容を見直します", "💬 理由を確認したい"],
                pending_hold: ["⏳ 返答をお待ちします", "💬 いつ頃いただけますか？"],
                consult:      ["🔄 修正して再提出します", "💬 どこを直せばよいですか？"],
              };
              const btns = actions[c.status];
              if (!btns) return null;
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:BASE.sub }}>返答する</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {btns.map(btn=>(
                      <button key={btn} onClick={()=>handleAction(c.id, btn)} className="tap-scale" style={{
                        padding:"8px 14px", borderRadius:10,
                        border:`1.5px solid ${s.color}44`,
                        background:`${s.color}0D`,
                        color:s.color, fontSize:12, fontWeight:700,
                        cursor:"pointer", fontFamily:"inherit",
                      }}>{btn}</button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 返答済み表示 */}
            {role==="staff" && actionDone[c.id] && (
              <div style={{ fontSize:12, color:BASE.green, fontWeight:700, marginBottom:8 }}>
                ✅ 返答済み：{actionDone[c.id]}
              </div>
            )}

            {/* 完了済みのスタッフアクション表示 */}
            {role==="staff" && c.isReal && c.staffAction && !actionDone[c.id] && (
              <div style={{ fontSize:12, color:BASE.green, fontWeight:700, marginBottom:8 }}>
                ✅ 返答済み：{c.staffAction}
              </div>
            )}

            {/* 削除ボタン（スタッフ・削除可能な案件のみ） */}
            {deletable && !isConfirming && (
              <button onClick={()=>setConfirmId(c.id)} className="tap-scale" style={{
                marginTop:6, padding:"5px 12px", borderRadius:8,
                border:`1px solid ${BASE.border}`, background:"transparent",
                color:BASE.sub, fontSize:11, cursor:"pointer", fontFamily:"inherit",
              }}>
                🗑 削除する
              </button>
            )}

            {/* 削除確認 */}
            {isConfirming && (
              <div style={{ marginTop:8, padding:"10px 12px", background:"#FFF0F0", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, color:BASE.red, flex:1 }}>この案件を削除しますか？</span>
                <button onClick={()=>handleDelete(c.id)} className="tap-scale" style={{ padding:"6px 14px", borderRadius:8, border:"none", background:BASE.red, color:"white", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>削除</button>
                <button onClick={()=>setConfirmId(null)} className="tap-scale" style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${BASE.border}`, background:"transparent", color:BASE.sub, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>キャンセル</button>
              </div>
            )}
          </Tile>
        );
      })}

      {allCases.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:BASE.sub }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🗂️</div>
          <div style={{ fontSize:14, fontWeight:700, color:BASE.text, marginBottom:4 }}>過去案件はまだありません</div>
          <div style={{ fontSize:12, color:BASE.sub, lineHeight:1.7 }}>
            やり取りが完了した案件が<br/>ここに記録されます
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 経営者専用通知 ───────────────────────────────────────────────────────────

function PresidentNotifsScreen() {
  const [tasks, setTasks] = useState([]);

  useEffect(()=>{
    const load = () => setTasks(STORE.getTasks());
    load();
    const timer = setInterval(load, 3000);
    return ()=>clearInterval(timer);
  }, []);

  // 完了：スタッフが返答済み
  const done    = tasks.filter(t => t.staffAction);
  // 進行中：上司が判断済み・スタッフ未返答
  const inprog  = tasks.filter(t => t.judgment && !t.staffAction);
  // 停滞：上司がまだ判断していない
  const stalled = tasks.filter(t => !t.judgment && t.status==="pending");

  const Section = ({ label, color, bg, items, emptyMsg }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:color }}/>
        <span style={{ fontSize:13, fontWeight:800, color }}>{label}</span>
        <span style={{ fontSize:12, color:BASE.sub }}>（{items.length}件）</span>
      </div>
      {items.length===0 ? (
        <div style={{ fontSize:12, color:BASE.sub, padding:"10px 14px", background:BASE.bg, borderRadius:10 }}>{emptyMsg}</div>
      ) : items.map(t=>(
        <div key={t.id} style={{ background:bg, border:`1px solid ${color}33`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:13, fontWeight:700, color:BASE.text, marginBottom:4, lineHeight:1.5 }}>
            {t.detail?.slice(0,40)}{t.detail?.length>40?"…":""}
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {t.createdAt  && <span style={{ fontSize:11, color:BASE.sub }}>送信：{t.createdAt.slice(0,10)}</span>}
            {t.judgedAt   && <span style={{ fontSize:11, color:BASE.sub }}>判断：{t.judgedAt.slice(0,10)}</span>}
            {t.judgment   && <span style={{ fontSize:11, fontWeight:700, color, background:color+"15", padding:"1px 8px", borderRadius:8 }}>{t.judgment}</span>}
            {t.staffAction && <span style={{ fontSize:11, color:BASE.sub }}>返答：{t.staffAction}</span>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding:"16px" }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:900, color:BASE.text }}>経営者ダッシュボード通知</div>
        <div style={{ fontSize:12, color:BASE.sub, marginTop:2 }}>やり取りの結果のみ表示しています</div>
      </div>

      {/* サマリー */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
        {[
          { label:"完了",   value:done.length,    color:BASE.green  },
          { label:"進行中", value:inprog.length,  color:"#0066FF"   },
          { label:"停滞中", value:stalled.length, color:BASE.orange },
        ].map(s=>(
          <div key={s.label} style={{ background:BASE.surface, borderRadius:12, padding:"12px 8px", textAlign:"center", border:`1px solid ${s.color}33` }}>
            <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Section label="✅ やり取り完了" color={BASE.green} bg="#F0FFF5"
        items={done} emptyMsg="完了した案件はまだありません"/>
      <Section label="⏳ 進行中（上司判断済・スタッフ未返答）" color="#0066FF" bg="#E8F0FF"
        items={inprog} emptyMsg="進行中の案件はありません"/>
      <Section label="🚨 停滞中（上司未判断）" color={BASE.orange} bg="#FFFBF0"
        items={stalled} emptyMsg="停滞している案件はありません"/>

      {tasks.length===0 && (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📊</div>
          <div style={{ fontSize:14, fontWeight:700, color:BASE.text }}>まだ案件がありません</div>
        </div>
      )}
    </div>
  );
}

function NotifsScreen({ onRead, role }) {
  // 経営者は専用画面を表示
  if (role==="president") return <PresidentNotifsScreen/>;

  const th = THEME[role];
  const [notifs, setNotifs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(()=>{
    const load = () => {
      const stored = STORE.getNotifs();
      const now = Date.now();
      const TWENTY_FOUR_H = 24 * 60 * 60 * 1000;
      const recent = stored.filter(n =>
        n.unread || (n.id && now - n.id < TWENTY_FOUR_H)
      );
      setNotifs(recent);
    };
    load();
    const timer = setInterval(load, 2000);
    return ()=>clearInterval(timer);
  }, [role]);

  const readAll = () => {
    const all = STORE.getNotifs().map(n=>({...n,unread:false}));
    STORE.saveNotifs(all);
    setNotifs(prev=>prev.map(n=>({...n,unread:false})));
    onRead();
  };

  const typeColor = {
    approved:     BASE.green,
    comment:      "#0066FF",
    schedule:     BASE.purple,
    done:         BASE.green,
    pending:      BASE.orange,
    staff_action: BASE.green,
    boss_action:  BASE.orange,
  };

  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      {/* ヘッダー */}
      <div style={{
        padding:"14px 16px 10px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:BASE.text }}>通知</div>
          <div style={{ fontSize:11, color:BASE.sub, marginTop:1 }}>
            未読 {notifs.filter(n=>n.unread).length}件
          </div>
        </div>
        <button onClick={readAll} className="tap-scale" style={{
          fontSize:12, fontWeight:700, color:th.accent,
          background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
        }}>すべて既読</button>
      </div>

      {/* 通知リスト */}
      <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:8 }}>
        {notifs.map(n => {
          const color   = typeColor[n.type] ?? BASE.sub;
          const isOpen  = expanded === n.id;
          return (
            <div
              key={n.id}
              onClick={()=>setExpanded(isOpen ? null : n.id)}
              style={{
                background: n.unread ? BASE.surface : "#F8F7F3",
                borderRadius:16,
                border:`1px solid ${isOpen ? color+"44" : BASE.border}`,
                borderLeft:`3px solid ${n.unread ? color : "transparent"}`,
                overflow:"hidden",
                cursor:"pointer",
                transition:"all .2s",
              }}
            >
              {/* メイン行 */}
              <div style={{ padding:"13px 14px", display:"flex", alignItems:"flex-start", gap:12 }}>
                {/* アイコン */}
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:`${color}18`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18,
                }}>
                  {n.emoji}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  {/* タイトル */}
                  <div style={{
                    fontSize:13, fontWeight:n.unread?800:600,
                    color: n.unread ? BASE.text : BASE.sub,
                    marginBottom:2,
                  }}>
                    {n.title}
                  </div>
                  {/* 案件名 */}
                  <div style={{
                    fontSize:12, fontWeight:700, color,
                    marginBottom:2,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>
                    {n.case}
                  </div>
                  {/* 差出人・時刻 */}
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, color:BASE.sub }}>{n.from}</span>
                    <span style={{ fontSize:10, color:BASE.border }}>·</span>
                    <span style={{ fontSize:11, color:BASE.sub }}>{n.time}</span>
                  </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                  {n.unread && (
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
                  )}
                  <span style={{
                    fontSize:13, color:BASE.sub,
                    transform: isOpen ? "rotate(90deg)" : "none",
                    transition:"transform .2s",
                    lineHeight:1,
                  }}>›</span>
                </div>
              </div>

              {/* 展開エリア */}
              {isOpen && (
                <div style={{
                  padding:"0 14px 14px 62px",
                  animation:"slideUp .2s ease",
                }}>
                  <div style={{
                    padding:"10px 12px",
                    background:`${color}0D`,
                    borderRadius:10,
                    fontSize:13, color:BASE.text, lineHeight:1.8,
                    borderLeft:`3px solid ${color}`,
                  }}>
                    {n.detail}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 通知が0件のとき */}
        {notifs.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
            <div style={{ fontSize:14, fontWeight:700, color:BASE.text, marginBottom:4 }}>新しい通知はありません</div>
            {role==="staff" && (
              <div style={{ fontSize:12, color:BASE.sub, lineHeight:1.7 }}>
                過去の案件や履歴は<br/>「案件一覧」で確認できます
              </div>
            )}
          </div>
        )}

        {/* スタッフ向け注記 */}
        {role==="staff" && notifs.length > 0 && (
          <div style={{ textAlign:"center", fontSize:11, color:BASE.sub, padding:"8px 0 4px" }}>
            24時間以内・未読の通知のみ表示しています
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ role, onSwitch }) {
  const th = THEME[role];
  const nameMap     = { staff:"田中 一郎", boss:"山本 部長", president:"代表取締役社長" };
  const deptMap     = { staff:"マーケティング部", boss:"マーケティング部　部長", president:"経営本部" };

  const [showModal,  setShowModal]  = useState(false);
  const [targetRole, setTargetRole] = useState(null);
  const [code,       setCode]       = useState("");
  const [err,        setErr]        = useState(false);
  const [subPage,    setSubPage]    = useState(null); // "notif" | "privacy" | "help" | "terms"

  const openModal  = (r) => { setTargetRole(r); setCode(""); setErr(false); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setTargetRole(null); setCode(""); setErr(false); };

  const trySwitch = () => {
    if (code === PASSCODES[targetRole]) { onSwitch(targetRole); closeModal(); }
    else { setErr(true); setCode(""); setTimeout(()=>setErr(false), 1500); }
  };

  const roles = [
    { id:"staff",     label:"スタッフ", emoji:"👤", th:THEME.staff     },
    { id:"boss",      label:"上司",     emoji:"👔", th:THEME.boss      },
    { id:"president", label:"経営者",   emoji:"👑", th:THEME.president },
  ];

  // サブページ表示
  if (subPage==="notif")   return <NotifSettings   onBack={()=>setSubPage(null)}/>;
  if (subPage==="privacy") return <PrivacySettings onBack={()=>setSubPage(null)}/>;
  if (subPage==="help")    return <HelpPage        onBack={()=>setSubPage(null)}/>;
  if (subPage==="terms")   return <TermsPage       onBack={()=>setSubPage(null)}/>;

  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>

      {/* プロフィールカード */}
      <Tile style={{ background:th.accentSoft, textAlign:"center", padding:"28px 20px" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:th.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 12px" }}>
          {th.emoji}
        </div>
        <div style={{ fontSize:18, fontWeight:900 }}>{nameMap[role]}</div>
        <div style={{ fontSize:13, color:BASE.sub, marginTop:4 }}>{deptMap[role]}</div>
        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, background:th.accent, color:"white", fontSize:12, fontWeight:700 }}>
          {th.emoji} {th.label}
        </div>
      </Tile>

      {/* 繋がっているスタッフ */}
      <Tile>
        <Lbl>👥 繋がっているメンバー</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:2, marginTop:8 }}>
          {[
            { name:"田中 一郎",   dept:"マーケティング部",  role:"スタッフ",  color:"#0066FF", online:true  },
            { name:"山田 花子",   dept:"マーケティング部",  role:"スタッフ",  color:"#0066FF", online:true  },
            { name:"鈴木 健太",   dept:"営業部",           role:"スタッフ",  color:"#0066FF", online:false },
            { name:"佐藤 由香",   dept:"人事部",           role:"スタッフ",  color:"#0066FF", online:false },
            { name:"山本 部長",   dept:"マーケティング部",  role:"上司",      color:"#B45309", online:true  },
          ].map((m,i,arr)=>(
            <div key={m.name} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 0",
              borderBottom: i<arr.length-1 ? `1px solid ${BASE.border}` : "none",
            }}>
              <div style={{ position:"relative" }}>
                <div style={{
                  width:38, height:38, borderRadius:"50%",
                  background: m.color+"22",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:700, color:m.color,
                }}>
                  {m.name[0]}
                </div>
                <div style={{
                  position:"absolute", bottom:0, right:0,
                  width:10, height:10, borderRadius:"50%",
                  background: m.online ? BASE.green : "#CCC",
                  border:"2px solid white",
                }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:BASE.text }}>{m.name}</div>
                <div style={{ fontSize:11, color:BASE.sub, marginTop:1 }}>{m.dept}</div>
              </div>
              <span style={{
                fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20,
                background: m.color+"15", color:m.color,
              }}>{m.role}</span>
            </div>
          ))}
        </div>
      </Tile>

      {/* ロール切り替え（仮・薄暗く） */}
      <div style={{ opacity:0.4 }}>
        <Tile style={{ background:"#F8F8F8" }}>
          <Lbl>🔐 ロール切り替え（開発用・仮）</Lbl>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
            {roles.map(r => (
              <button key={r.id} onClick={()=>r.id!==role&&openModal(r.id)} className={r.id!==role?"tap-scale":""} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"11px 14px", borderRadius:12,
                border:`1.5px solid ${role===r.id?r.th.accent:BASE.border}`,
                background: role===r.id ? r.th.accentSoft : BASE.bg,
                cursor: role===r.id ? "default" : "pointer",
                fontFamily:"inherit", textAlign:"left", width:"100%",
              }}>
                <span style={{ fontSize:20 }}>{r.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: role===r.id ? r.th.accentText : BASE.text }}>{r.label}</div>
                </div>
                {role===r.id
                  ? <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:r.th.accent, color:"white" }}>使用中</span>
                  : <span style={{ fontSize:14, color:BASE.border }}>🔒</span>
                }
              </button>
            ))}
          </div>
        </Tile>
      </div>

      <Tile style={{ padding:"8px 18px" }}>
        {[
          { emoji:"🔔", label:"通知設定",   page:"notif"   },
          { emoji:"🔒", label:"プライバシー", page:"privacy" },
          { emoji:"❓", label:"ヘルプ",      page:"help"    },
          { emoji:"📝", label:"利用規約",   page:"terms"   },
        ].map((item,i,arr)=>(
          <div key={item.label} onClick={()=>setSubPage(item.page)} className="tap-scale" style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:i<arr.length-1?`1px solid ${BASE.border}`:"none", cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>{item.emoji}</span>
            <span style={{ fontSize:14, fontWeight:600, flex:1, color:BASE.text }}>{item.label}</span>
            <span style={{ color:BASE.border, fontSize:18 }}>›</span>
          </div>
        ))}
      </Tile>

      {/* パスコードモーダル */}
      {showModal && targetRole && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.5)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          animation:"fadeIn .2s ease",
        }} onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div style={{
            width:"100%", maxWidth:420,
            background:BASE.surface,
            borderRadius:"20px 20px 0 0",
            padding:"18px 18px 16px",
            marginBottom:"calc(env(safe-area-inset-bottom) + 60px)",
            animation:"slideUp .25s ease",
            boxShadow:"0 -4px 24px rgba(0,0,0,0.15)",
          }}>
            {/* ヘッダー */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <span style={{ fontSize:24 }}>{THEME[targetRole].emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:900 }}>{roles.find(r=>r.id===targetRole)?.label}として入室</div>
                <div style={{ fontSize:11, color:BASE.sub }}>パスコードを入力してください</div>
              </div>
              <button onClick={closeModal} style={{ background:"#F0F0F0", border:"none", borderRadius:"50%", width:28, height:28, fontSize:14, color:BASE.sub, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <input
              type="password"
              value={code}
              onChange={e=>setCode(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&trySwitch()}
              placeholder="••••"
              maxLength={8}
              autoFocus
              style={{
                width:"100%", padding:"10px 14px", borderRadius:12, textAlign:"center",
                border:`2px solid ${err?BASE.red:THEME[targetRole].accent}`,
                background:err?"#FFF0F0":BASE.bg,
                fontSize:22, letterSpacing:8, fontFamily:"inherit", outline:"none",
                color:err?BASE.red:BASE.text, marginBottom:6, transition:"all .2s",
              }}
            />
            <p style={{ textAlign:"center", fontSize:11, color:err?BASE.red:BASE.sub, fontWeight:err?700:400, margin:"0 0 12px" }}>
              {err?"パスコードが違います":"デモ：スタッフ 1111 / 上司 2222 / 経営者 3333"}
            </p>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={closeModal} className="tap-scale" style={{ flex:1, padding:"13px", borderRadius:12, border:`1.5px solid ${BASE.border}`, background:"transparent", color:BASE.sub, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>キャンセル</button>
              <button onClick={trySwitch} disabled={code.length===0} className={code.length>0?"tap-scale":""} style={{ flex:1, padding:"13px", borderRadius:12, border:"none", background:code.length>0?THEME[targetRole].accent:"#E8E6E0", color:code.length>0?"white":BASE.sub, fontSize:14, fontWeight:800, cursor:code.length>0?"pointer":"default", fontFamily:"inherit" }}>入室する →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS SUB PAGES ──────────────────────────────────────────────────────

function SettingsPage({ title, onBack, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", animation:"slideUp .25s ease" }}>
      {/* サブヘッダー */}
      <div style={{
        display:"flex", alignItems:"center", gap:12,
        padding:"14px 18px", background:BASE.surface,
        borderBottom:`1px solid ${BASE.border}`,
        position:"sticky", top:0, zIndex:10,
      }}>
        <button onClick={onBack} className="tap-scale" style={{
          width:34, height:34, borderRadius:"50%", background:BASE.bg,
          border:"none", fontSize:18, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", color:BASE.text,
        }}>‹</button>
        <span style={{ fontSize:16, fontWeight:800 }}>{title}</span>
      </div>
      <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"4px 0" }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:BASE.text }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>{sub}</div>}
      </div>
      <button onClick={()=>onChange(!value)} className="tap-scale" style={{
        width:46, height:26, borderRadius:13,
        background: value ? BASE.green : "#CCC",
        border:"none", cursor:"pointer", position:"relative", flexShrink:0,
        transition:"background .2s",
      }}>
        <div style={{
          width:20, height:20, borderRadius:"50%", background:"white",
          position:"absolute", top:3, left: value ? 23 : 3,
          transition:"left .2s",
          boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
        }}/>
      </button>
    </div>
  );
}

function NotifSettings({ onBack }) {
  const [s, setS] = useState({ push:true, approval:true, mention:true, daily:false, sound:true, badge:true });
  const set = (k, v) => setS(p => ({...p, [k]:v}));
  return (
    <SettingsPage title="🔔 通知設定" onBack={onBack}>
      <Tile>
        <Lbl>プッシュ通知</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Toggle label="プッシュ通知を受け取る" sub="全ての通知のオン・オフ" value={s.push} onChange={v=>set("push",v)}/>
          <div style={{ height:1, background:BASE.border }}/>
          <Toggle label="承認・却下の通知" sub="案件の承認結果を通知" value={s.approval} onChange={v=>set("approval",v)}/>
          <Toggle label="メンションの通知" sub="自分宛のコメントを通知" value={s.mention} onChange={v=>set("mention",v)}/>
          <Toggle label="日次サマリー" sub="毎朝9時に案件状況をお知らせ" value={s.daily} onChange={v=>set("daily",v)}/>
        </div>
      </Tile>
      <Tile>
        <Lbl>通知スタイル</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Toggle label="サウンド" sub="通知音を鳴らす" value={s.sound} onChange={v=>set("sound",v)}/>
          <Toggle label="バッジ" sub="アイコンに未読数を表示" value={s.badge} onChange={v=>set("badge",v)}/>
        </div>
      </Tile>
      <Tile style={{ background:"#F0FFF5" }}>
        <p style={{ fontSize:12, color:BASE.sub, margin:0, lineHeight:1.8 }}>
          ※ 通知を受け取るにはデバイスの通知許可が必要です。設定 → pipe → 通知 からオンにしてください。
        </p>
      </Tile>
    </SettingsPage>
  );
}

function PrivacySettings({ onBack }) {
  const [s, setS] = useState({ onlineStatus:true, readReceipt:true, dataCollection:false });
  const set = (k, v) => setS(p => ({...p, [k]:v}));
  return (
    <SettingsPage title="🔒 プライバシー" onBack={onBack}>
      <Tile>
        <Lbl>公開情報</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Toggle label="オンライン状態を表示" sub="他のメンバーにオンライン状況を見せる" value={s.onlineStatus} onChange={v=>set("onlineStatus",v)}/>
          <Toggle label="既読通知" sub="メッセージを読んだことを相手に伝える" value={s.readReceipt} onChange={v=>set("readReceipt",v)}/>
        </div>
      </Tile>
      <Tile>
        <Lbl>データ</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Toggle label="利用データの収集に同意" sub="サービス改善のための匿名データ" value={s.dataCollection} onChange={v=>set("dataCollection",v)}/>
        </div>
      </Tile>
      <Tile style={{ padding:"8px 18px" }}>
        {[
          { label:"アカウントデータをエクスポート", color:BASE.text },
          { label:"アカウントを削除する",           color:BASE.red  },
        ].map((item,i,arr)=>(
          <div key={item.label} style={{ display:"flex", alignItems:"center", padding:"14px 0", borderBottom:i<arr.length-1?`1px solid ${BASE.border}`:"none", cursor:"pointer" }}>
            <span style={{ fontSize:14, fontWeight:600, flex:1, color:item.color }}>{item.label}</span>
            <span style={{ color:BASE.border, fontSize:18 }}>›</span>
          </div>
        ))}
      </Tile>
    </SettingsPage>
  );
}

function HelpPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"パスコードを忘れました",          a:"管理者（経営者ロール）にパスコードのリセットを依頼してください。現在のデモ用パスコードはスタッフ:1111 / 上司:2222 / 経営者:3333です。" },
    { q:"案件の承認が反映されません",       a:"ページを再読み込みしてください。それでも反映されない場合は通知設定をご確認ください。" },
    { q:"通知が届きません",                 a:"デバイスの設定 → pipe → 通知 がオンになっているか確認してください。また通知設定画面からプッシュ通知がオンになっているかご確認ください。" },
    { q:"ロールを切り替えるには",           a:"マイページ下部の「ロール切り替え」からパスコードを入力して切り替えることができます。" },
    { q:"案件データはどこに保存されますか", a:"現在はデモ版のためデータはブラウザ内にのみ保存されます。本番版ではクラウドデータベースに安全に保存されます。" },
  ];
  return (
    <SettingsPage title="❓ ヘルプ" onBack={onBack}>
      <Tile style={{ background:"#E8F0FF" }}>
        <p style={{ fontSize:14, fontWeight:700, color:"#0044CC", margin:"0 0 4px" }}>お困りですか？</p>
        <p style={{ fontSize:13, color:"#0066FF", margin:0, lineHeight:1.7 }}>よくある質問をまとめました。解決しない場合はサポートまでお問い合わせください。</p>
      </Tile>
      <Tile style={{ padding:"8px 18px" }}>
        <Lbl>よくある質問</Lbl>
        {faqs.map((f,i)=>(
          <div key={i}>
            <div onClick={()=>setOpen(open===i?null:i)} style={{ display:"flex", alignItems:"center", padding:"14px 0", cursor:"pointer", borderBottom: open===i ? "none" : `1px solid ${BASE.border}` }}>
              <span style={{ fontSize:14, fontWeight:700, flex:1, color:BASE.text }}>{f.q}</span>
              <span style={{ color:BASE.sub, fontSize:14, transform: open===i?"rotate(90deg)":"none", transition:"transform .2s" }}>›</span>
            </div>
            {open===i && (
              <div style={{ padding:"0 0 14px", borderBottom:`1px solid ${BASE.border}`, fontSize:13, color:BASE.sub, lineHeight:1.8 }}>
                {f.a}
              </div>
            )}
          </div>
        ))}
      </Tile>
      <Tile style={{ textAlign:"center", padding:"22px" }}>
        <div style={{ fontSize:24, marginBottom:8 }}>📬</div>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>解決しませんでしたか？</div>
        <div style={{ fontSize:12, color:BASE.sub, marginBottom:14 }}>サポートチームがお手伝いします</div>
        <button className="tap-scale" style={{ padding:"11px 28px", borderRadius:12, border:"none", background:BASE.text, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          サポートに問い合わせる
        </button>
      </Tile>
    </SettingsPage>
  );
}

function TermsPage({ onBack }) {
  return (
    <SettingsPage title="📝 利用規約" onBack={onBack}>
      <Tile>
        <p style={{ fontSize:12, color:BASE.sub, margin:"0 0 12px" }}>最終更新日：2026年3月20日</p>
        {[
          { title:"第1条（目的）",           body:"本規約は、pipe（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意した上で本サービスを利用するものとします。" },
          { title:"第2条（利用資格）",       body:"本サービスは、所属組織から利用許可を受けた方のみご利用いただけます。不正アクセスや権限外の操作は禁止します。" },
          { title:"第3条（禁止事項）",       body:"①他者のアカウントへの不正アクセス ②虚偽情報の登録 ③サービスの逆アセンブルや改ざん ④その他法令に違反する行為" },
          { title:"第4条（データの取扱い）", body:"ユーザーが入力したデータは、サービス提供目的のみに使用します。第三者への提供は行いません。詳細はプライバシーポリシーをご確認ください。" },
          { title:"第5条（免責事項）",       body:"本サービスの利用により生じた損害について、当社は一切の責任を負いません。サービスの中断・終了については事前に通知するよう努めます。" },
          { title:"第6条（規約の変更）",     body:"本規約は予告なく変更される場合があります。変更後も継続して利用した場合、変更後の規約に同意したものとみなします。" },
        ].map((s,i,arr)=>(
          <div key={s.title} style={{ marginBottom: i<arr.length-1 ? 18 : 0 }}>
            <div style={{ fontSize:13, fontWeight:800, color:BASE.text, marginBottom:6 }}>{s.title}</div>
            <div style={{ fontSize:13, color:BASE.sub, lineHeight:1.8 }}>{s.body}</div>
            {i<arr.length-1 && <div style={{ height:1, background:BASE.border, marginTop:18 }}/>}
          </div>
        ))}
      </Tile>
      <Tile style={{ background:"#F8F7F3", textAlign:"center", padding:"18px" }}>
        <p style={{ fontSize:12, color:BASE.sub, margin:0, lineHeight:1.8 }}>
          ご不明な点はヘルプページまたはサポートまでお問い合わせください。
        </p>
      </Tile>
    </SettingsPage>
  );
}

// ─── SHARED MEMO ─────────────────────────────────────────────────────────────

const MEMO_STORE = {
  get: () => { try { return JSON.parse(localStorage.getItem("pipe_memos") || "[]"); } catch { return []; } },
  save: (memos) => { try { localStorage.setItem("pipe_memos", JSON.stringify(memos)); } catch {} },
  add: (memo) => {
    const memos = MEMO_STORE.get();
    const m = { ...memo, id:Date.now(), likes:0, likedBy:[], pinned:false, createdAt:new Date().toLocaleString("ja-JP") };
    memos.unshift(m);
    MEMO_STORE.save(memos);
    return m;
  },
  togglePin:  (id) => { MEMO_STORE.save(MEMO_STORE.get().map(m => m.id===id ? {...m,pinned:!m.pinned} : m)); },
  toggleLike: (id, role) => {
    MEMO_STORE.save(MEMO_STORE.get().map(m => {
      if (m.id!==id) return m;
      const liked = m.likedBy?.includes(role);
      return { ...m, likes:(m.likes??0)+(liked?-1:1), likedBy:liked?(m.likedBy.filter(r=>r!==role)):[...(m.likedBy??[]),role] };
    }));
  },
  delete: (id) => { MEMO_STORE.save(MEMO_STORE.get().filter(m=>m.id!==id)); },
};

function SharedMemoScreen({ role }) {
  const [memos,     setMemos]     = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [openId,    setOpenId]    = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const th = THEME[role];

  const load = () => {
    const all = MEMO_STORE.get();
    setMemos([...all.filter(m=>m.pinned), ...all.filter(m=>!m.pinned)]);
  };
  useEffect(()=>{ load(); const t=setInterval(load,3000); return()=>clearInterval(t); }, []);

  const handleAdd    = () => { if(!title.trim()&&!body.trim()) return; MEMO_STORE.add({title:title.trim(),body:body.trim(),author:role,authorLabel:THEME[role].label}); setTitle(""); setBody(""); setShowForm(false); load(); };
  const handleLike   = (id,e) => { e.stopPropagation(); MEMO_STORE.toggleLike(id,role); load(); };
  const handlePin    = (id,e) => { e.stopPropagation(); MEMO_STORE.togglePin(id); load(); };
  const handleDelete = (id,e) => { e.stopPropagation(); MEMO_STORE.delete(id); setConfirmId(null); load(); };

  const tagStyle = {
    staff:     { bg:"#D4F5EC", color:"#064E38" },
    boss:      { bg:"#D8EEFF", color:"#0A3F7A" },
    president: { bg:"#EAE4FF", color:"#3B2A88" },
  };

  const cloudStyle = `
    .sky-board {
      background: linear-gradient(180deg, #5BA8D4 0%, #87CEEB 45%, #B8E4F7 100%);
      border-radius: 20px;
      padding: 20px 12px 32px;
      min-height: 400px;
    }
    .cloud-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 12px;
    }
    .cloud-card {
      position: relative;
      background: white;
      border-radius: 36px;
      padding: 13px 12px 11px;
      filter: drop-shadow(0 4px 10px rgba(60,120,180,0.16));
      cursor: pointer;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .cloud-card::before {
      content:''; position:absolute; border-radius:50%; background:white;
      width:50%; height:65%; top:-26%; left:14%; z-index:-1;
    }
    .cloud-card::after {
      content:''; position:absolute; border-radius:50%; background:white;
      width:34%; height:52%; top:-17%; right:14%; z-index:-1;
    }
    .cloud-inner { position:relative; z-index:3; width:100%; }
    .col-l { animation: fA 4.2s ease-in-out infinite; }
    .col-r { animation: fB 3.9s ease-in-out infinite; margin-top:26px; }
    @keyframes fA { 0%,100%{transform:translateY(0) rotate(-0.6deg)} 50%{transform:translateY(-6px) rotate(0.5deg)} }
    @keyframes fB { 0%,100%{transform:translateY(0) rotate(0.5deg)}  50%{transform:translateY(-5px) rotate(-0.6deg)} }
    .cloud-detail { display:none; margin-top:8px; padding-top:8px; border-top:1px solid #EEF4FA; text-align:left; }
    .cloud-detail.open { display:block; }
  `;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <style>{cloudStyle}</style>

      {/* ヘッダー */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 16px 12px" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:BASE.text }}>📝 共有メモ</div>
          <div style={{ fontSize:11, color:BASE.sub, marginTop:1 }}>全員が見られます</div>
        </div>
        <button onClick={()=>setShowForm(v=>!v)} className="tap-scale" style={{
          padding:"8px 16px", borderRadius:20, border:"none",
          background: showForm ? BASE.sub : th.accent,
          color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
        }}>{showForm ? "キャンセル" : "+ 書く"}</button>
      </div>

      {/* 投稿フォーム */}
      {showForm && (
        <div style={{ padding:"0 16px 12px", animation:"slideUp .2s ease" }}>
          <Tile style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル（短く）"
              style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1.5px solid ${BASE.border}`, background:BASE.bg, fontSize:14, fontFamily:"inherit", outline:"none" }}
            />
            <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="アイデアを書いてください…"
              style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1.5px solid ${BASE.border}`, background:BASE.bg, fontSize:14, fontFamily:"inherit", outline:"none", height:72, resize:"none", lineHeight:1.7 }}
            />
            <TapBtn color={th.accent} disabled={!title.trim()&&!body.trim()} onClick={handleAdd}>投稿する</TapBtn>
          </Tile>
        </div>
      )}

      {/* 空状態 */}
      {memos.length===0 && (
        <div className="sky-board" style={{ margin:"0 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center", color:"white" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>☁️</div>
            <div style={{ fontSize:14, fontWeight:700 }}>まだメモがありません</div>
            <div style={{ fontSize:11, opacity:.8, marginTop:4 }}>「+ 書く」からアイデアを投稿しましょう</div>
          </div>
        </div>
      )}

      {/* 雲ボード */}
      {memos.length > 0 && (
        <div className="sky-board" style={{ margin:"0 16px" }}>
          <div className="cloud-grid">
            {memos.map((m, i) => {
              const isOpen    = openId === m.id;
              const isOwner   = m.author === role;
              const liked     = m.likedBy?.includes(role);
              const isConfirm = confirmId === m.id;
              const ts        = tagStyle[m.author] ?? { bg:"#EEE", color:"#555" };
              const colClass  = i%2===0 ? "col-l" : "col-r";

              return (
                <div key={m.id} className={`cloud-card ${colClass}`}
                  onClick={()=>setOpenId(isOpen ? null : m.id)}
                  style={{ animationDelay:`${i*0.3}s` }}
                >
                  <div className="cloud-inner">
                    {m.pinned && <div style={{ fontSize:8, color:"#E8A000", marginBottom:2 }}>📌</div>}
                    <div style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:20, display:"inline-block", marginBottom:4, background:ts.bg, color:ts.color }}>
                      {THEME[m.author]?.emoji} {m.authorLabel??m.author}
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#1A2A3A", lineHeight:1.35 }}>
                      {m.title || m.body?.slice(0,16)}
                    </div>
                    {!isOpen && <div style={{ fontSize:8, color:"#AABCCC", marginTop:3 }}>タップ ▾</div>}

                    {/* 展開エリア */}
                    <div className={`cloud-detail${isOpen?" open":""}`}>
                      {m.body && <div style={{ fontSize:10, color:"#5A6A7A", lineHeight:1.65, marginBottom:7 }}>{m.body}</div>}
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <button onClick={e=>handleLike(m.id,e)} style={{
                          fontSize:9, padding:"2px 7px", borderRadius:20,
                          border:`1px solid ${liked?"#FFAED1":"#E0EAF4"}`,
                          background:liked?"#FFE8F2":"#F4F9FF",
                          color:liked?"#C0306A":"#6688AA", cursor:"pointer",
                        }}>👍 {m.likes??0}</button>
                        <button onClick={e=>handlePin(m.id,e)} style={{
                          fontSize:9, padding:"2px 7px", borderRadius:20,
                          border:`1px solid ${m.pinned?"#FAC75588":"#E0EAF4"}`,
                          background:m.pinned?"#FFF6EE":"#F4F9FF",
                          color:m.pinned?"#854F0B":"#6688AA", cursor:"pointer",
                        }}>📌</button>
                        <span style={{ fontSize:8, color:"#9BB0C4", marginLeft:"auto" }}>{m.createdAt?.slice(0,8)}</span>
                        {isOwner && !isConfirm && (
                          <button onClick={e=>{e.stopPropagation();setConfirmId(m.id);}} style={{ fontSize:9, padding:"2px 6px", borderRadius:20, border:"1px solid #E0EAF4", background:"transparent", color:"#AAA", cursor:"pointer" }}>🗑</button>
                        )}
                        {isConfirm && (
                          <div style={{ display:"flex", gap:4 }}>
                            <button onClick={e=>handleDelete(m.id,e)} style={{ fontSize:8, padding:"2px 6px", borderRadius:8, border:"none", background:"#E63946", color:"white", cursor:"pointer" }}>削除</button>
                            <button onClick={e=>{e.stopPropagation();setConfirmId(null);}} style={{ fontSize:8, padding:"2px 6px", borderRadius:8, border:"1px solid #DDD", background:"transparent", color:"#AAA", cursor:"pointer" }}>戻る</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 書くボタン */}
            <button onClick={()=>setShowForm(true)} style={{
              gridColumn:"span 2", marginTop:4,
              padding:"12px", borderRadius:36,
              border:"1.5px dashed rgba(255,255,255,0.6)",
              background:"rgba(255,255,255,0.18)",
              color:"white", fontSize:12, cursor:"pointer",
            }}>＋ アイデアを書く</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab,        setTab]        = useState("home");
  const [role,       setRole]       = useState("staff");
  const [unread,     setUnread]     = useState(2);
  const [sharedTask, setSharedTask] = useState(null); // スタッフ→上司で共有するタスク

  const switchRole = (r) => { if(typeof r==="string") setRole(r); else setRole(p=>p==="staff"?"boss":"staff"); };
  const handleTab  = (t)  => { setTab(t); if(t==="notifs") setUnread(0); };

  const HEADER_H = "calc(env(safe-area-inset-top) + 60px)";
  const FOOTER_H = "calc(env(safe-area-inset-bottom) + 60px)";

  return (
    <div style={{ height:"100vh", background:BASE.bg, overflow:"hidden", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input,textarea{color-scheme:light;-webkit-appearance:none;}
        textarea{resize:none;}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .tap-scale:active{transform:scale(0.97);}
        ::-webkit-scrollbar{display:none;}
        html,body{background:#F5F4F0;height:100%;}
      `}</style>

      <AppHeader role={role}/>

      <div style={{ position:"fixed", top:HEADER_H, bottom:FOOTER_H, left:0, right:0, overflowY:"auto", background:BASE.bg }}>
        <div key={`${tab}-${role}`} style={{ animation:"slideUp .25s ease", paddingBottom:32 }}>
          {tab==="home"    && <HomeScreen    role={role} onSwitch={switchRole} sharedTask={sharedTask} onShareTask={setSharedTask}/>}
          {tab==="cases"   && <CasesScreen role={role}/>}
          {tab==="notifs"  && <NotifsScreen  onRead={()=>setUnread(0)} role={role}/>}
          {tab==="memo"    && <SharedMemoScreen role={role}/>}
          {tab==="profile" && <ProfileScreen role={role} onSwitch={switchRole}/>}
        </div>
      </div>

      <BottomNav active={tab} onChange={handleTab} unreadCount={unread} role={role}/>
    </div>
  );
}
