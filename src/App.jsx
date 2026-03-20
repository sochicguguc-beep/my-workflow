import { useState } from "react";

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEME = {
  staff:     { accent:"#0066FF", accentSoft:"#E8F0FF", accentText:"#0044CC", headerBg:"#0066FF",  label:"スタッフ", emoji:"👤" },
  boss:      { accent:"#B45309", accentSoft:"#FFF7ED", accentText:"#92400E", headerBg:"#1C1917",  label:"上司",     emoji:"👔" },
  president: { accent:"#7C3AED", accentSoft:"#F5F0FF", accentText:"#5B21B6", headerBg:"#1E1035",  label:"社長",     emoji:"👑" },
};

const BASE = {
  bg:"#F5F4F0", surface:"#FFFFFF", border:"#E8E6E0",
  text:"#1A1A1A", sub:"#888880",
  green:"#1DB954", orange:"#FF6B00", red:"#E63946", purple:"#7C3AED",
};

// 社長用パスコード
const PRESIDENT_PASSCODE = "0000";

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

function AppHeader({ role, onSwitch }) {
  const th = THEME[role];
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:500, background:th.headerBg, paddingTop:"env(safe-area-inset-top)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", height:60 }}>
        <div>
          <div style={{ fontSize:17, fontWeight:900, color:"white", letterSpacing:"-.3px" }}>WorkFlow OS</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:1 }}>案件管理システム</div>
        </div>
        <button onClick={onSwitch} className="tap-scale" style={{
          display:"flex", alignItems:"center", gap:8,
          background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.35)",
          borderRadius:24, padding:"8px 14px", cursor:"pointer", fontFamily:"inherit",
        }}>
          <span style={{ fontSize:16 }}>{th.emoji}</span>
          <span style={{ fontSize:13, fontWeight:800, color:"white" }}>{th.label}</span>
          <span style={{ fontSize:10, fontWeight:700, background:"rgba(255,255,255,0.25)", color:"white", padding:"1px 7px", borderRadius:10 }}>切替</span>
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
    { id:"cases",   emoji:"📋", label:"案件一覧"  },
    { id:"notifs",  emoji:"🔔", label:"通知",      badge:unreadCount },
    { id:"profile", emoji:"👤", label:"マイページ" },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:500, background:BASE.surface, borderTop:`1px solid ${BASE.border}`, paddingBottom:"env(safe-area-inset-bottom)" }}>
      <div style={{ display:"flex", justifyContent:"space-around", height:60, alignItems:"center" }}>
        {items.map(n => (
          <button key={n.id} onClick={()=>onChange(n.id)} className="tap-scale" style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
            color:active===n.id?th.accent:BASE.sub, padding:"4px 14px", position:"relative",
          }}>
            {active===n.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:28, height:2.5, borderRadius:2, background:th.accent }}/>}
            <span style={{ fontSize:22 }}>{n.emoji}</span>
            <span style={{ fontSize:9, fontWeight:700 }}>{n.label}</span>
            {n.badge>0 && <div style={{ position:"absolute", top:2, right:8, width:16, height:16, borderRadius:"50%", background:BASE.red, color:"white", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{n.badge}</div>}
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
    if (code === PRESIDENT_PASSCODE) { onUnlock(); }
    else { setErr(true); setCode(""); setTimeout(()=>setErr(false), 1500); }
  };

  return (
    <div style={{ padding:"32px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
      <div style={{ fontSize:56 }}>👑</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:22, fontWeight:900, color:BASE.text }}>社長専用ビュー</div>
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
        ※ デモ用パスコード：0000
      </p>
    </div>
  );
}

// ─── PRESIDENT DASHBOARD ─────────────────────────────────────────────────────

function PresidentDashboard() {
  const [selected, setSelected] = useState(null);

  // 全体サマリー
  const totalPending = BOSS_METRICS.reduce((a,b)=>a+b.pending, 0);
  const avgScore     = Math.round(BOSS_METRICS.reduce((a,b)=>a+b.score,0) / BOSS_METRICS.length);
  const sorted       = [...BOSS_METRICS].sort((a,b)=>b.score-a.score);

  // 放置案件アラート（思案中が5日以上）
  const staleBosses = BOSS_METRICS.filter(b => b.pendingDays.some(d=>d>=5));

  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* サマリーバナー */}
      <Tile style={{ background:"linear-gradient(135deg,#1E1035,#3B0764)", padding:"22px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:700 }}>組織の判断力スコア</div>
            <div style={{ fontSize:42, fontWeight:900, color:"white", lineHeight:1 }}>{avgScore}<span style={{ fontSize:16, color:"rgba(255,255,255,0.6)" }}>/100</span></div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>放置案件</div>
            <div style={{ fontSize:28, fontWeight:900, color: totalPending>5?BASE.red:"#81C784" }}>{totalPending}件</div>
          </div>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.15)", borderRadius:3 }}>
          <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#A78BFA,#7C3AED)", width:`${avgScore}%`, transition:"width .6s ease" }}/>
        </div>
      </Tile>

      {/* 放置アラート */}
      {staleBosses.length > 0 && (
        <Tile style={{ background:"#FFF0F0", borderLeft:`4px solid ${BASE.red}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:18 }}>🚨</span>
            <span style={{ fontSize:14, fontWeight:800, color:BASE.red }}>放置アラート</span>
          </div>
          {staleBosses.map(b=>(
            <div key={b.id} style={{ fontSize:13, color:BASE.text, marginBottom:4 }}>
              <strong>{b.name}</strong> — {b.pendingDays.filter(d=>d>=5).length}件が5日以上放置中
            </div>
          ))}
        </Tile>
      )}

      {/* 上司ランキング */}
      <div>
        <Lbl>上司の判断力ランキング</Lbl>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sorted.map((b,i)=>{
            const grade = getGrade(b.score);
            const approveRate = Math.round(b.approved/b.total*100);
            const rejectRate  = Math.round(b.rejected/b.total*100);
            const pendingRate = Math.round(b.pending/b.total*100);
            const isOpen = selected===b.id;

            return (
              <div key={b.id}>
                <button onClick={()=>setSelected(isOpen?null:b.id)} className="tap-scale" style={{
                  width:"100%", background:BASE.surface, borderRadius:16,
                  padding:"16px 18px", border:`1.5px solid ${isOpen?grade.color:BASE.border}`,
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left",
                  transition:"all .2s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    {/* 順位 */}
                    <div style={{ fontSize:20, fontWeight:900, color:i===0?"#F59E0B":i===1?"#9CA3AF":i===2?"#B45309":BASE.sub, minWidth:24, textAlign:"center" }}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                    </div>

                    {/* 名前 */}
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:800, color:BASE.text }}>{b.name}</div>
                      <div style={{ fontSize:11, color:BASE.sub, marginTop:1 }}>{b.dept}</div>
                    </div>

                    {/* グレード */}
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:28, fontWeight:900, color:grade.color, background:grade.bg, width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>{grade.label}</div>
                    </div>

                    <span style={{ fontSize:16, color:BASE.border }}>{isOpen?"▲":"▼"}</span>
                  </div>
                </button>

                {/* 詳細パネル */}
                {isOpen && (
                  <div style={{ background:grade.bg, borderRadius:"0 0 16px 16px", padding:"16px 18px", border:`1.5px solid ${grade.color}`, borderTop:"none", marginTop:-4 }}>

                    {/* スコアゲージ */}
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:BASE.sub, marginBottom:6 }}>
                        <span>判断力スコア</span>
                        <span style={{ fontWeight:800, color:grade.color }}>{b.score} / 100</span>
                      </div>
                      <div style={{ height:8, background:"rgba(0,0,0,0.08)", borderRadius:4 }}>
                        <div style={{ height:"100%", borderRadius:4, background:grade.color, width:`${b.score}%`, transition:"width .5s ease" }}/>
                      </div>
                    </div>

                    {/* 承認・却下・放置バー */}
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:12, color:BASE.sub, marginBottom:6 }}>判断の内訳（全{b.total}件）</div>
                      <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden", gap:2 }}>
                        <div style={{ width:`${approveRate}%`, background:BASE.green, transition:"width .5s" }}/>
                        <div style={{ width:`${rejectRate}%`,  background:BASE.red,   transition:"width .5s" }}/>
                        <div style={{ width:`${pendingRate}%`, background:BASE.orange,transition:"width .5s" }}/>
                      </div>
                      <div style={{ display:"flex", gap:12, marginTop:6 }}>
                        {[
                          { label:"承認",   value:b.approved, color:BASE.green  },
                          { label:"却下",   value:b.rejected, color:BASE.red    },
                          { label:"保留中", value:b.pending,  color:BASE.orange },
                        ].map(s=>(
                          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:s.color }}/>
                            <span style={{ fontSize:11, color:BASE.sub }}>{s.label}</span>
                            <span style={{ fontSize:12, fontWeight:800, color:s.color }}>{s.value}件</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 平均決断日数 */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div style={{ background:BASE.surface, borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:24, fontWeight:900, color: b.avgDays<=2?BASE.green:b.avgDays<=4?BASE.orange:BASE.red }}>{b.avgDays}日</div>
                        <div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>平均決断スピード</div>
                      </div>
                      <div style={{ background:BASE.surface, borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:24, fontWeight:900, color:b.pending===0?BASE.green:b.pending<=2?BASE.orange:BASE.red }}>{b.pending}件</div>
                        <div style={{ fontSize:11, color:BASE.sub, marginTop:2 }}>現在の保留中</div>
                      </div>
                    </div>

                    {/* 診断コメント */}
                    <div style={{ marginTop:12, padding:"12px 14px", background:BASE.surface, borderRadius:12, fontSize:13, color:BASE.text, lineHeight:1.7 }}>
                      {b.score>=85 && "✅ 優秀な判断力。承認・却下ともに迅速で明確です。組織の模範となっています。"}
                      {b.score>=70 && b.score<85 && "👍 安定した判断力。保留案件も少なく、スタッフへの影響も最小限です。"}
                      {b.score>=50 && b.score<70 && "⚠️ 概ね良好ですが、保留案件の処理を速めると更に向上します。"}
                      {b.score>=30 && b.score<50 && "🔴 保留案件が多く、スタッフの業務が滞るリスクがあります。改善が必要です。"}
                      {b.score<30  && "🚨 判断の遅延と放置が常態化しています。役職の機能を果たしていない状態です。即時改善が必要です。"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 評価基準説明 */}
      <Tile style={{ background:"#F8F7FF" }}>
        <Lbl>📐 スコアの算出基準</Lbl>
        {[
          { grade:"S (85〜)", desc:"即決率が高く、保留ゼロ。判断が明確" },
          { grade:"A (70〜)", desc:"保留少なく決断スピードも速い"        },
          { grade:"B (50〜)", desc:"普通。保留が散見されるが許容範囲"    },
          { grade:"C (30〜)", desc:"保留が多く、決断に時間がかかる"      },
          { grade:"D (〜29)", desc:"放置・先送りが常態化。要改善"        },
        ].map((r,i,arr)=>{
          const g = getGrade(parseInt(r.grade));
          return (
            <div key={r.grade} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<arr.length-1?`1px solid ${BASE.border}`:"none" }}>
              <span style={{ fontSize:14, fontWeight:900, color:g.color, minWidth:60 }}>{r.grade}</span>
              <span style={{ fontSize:12, color:BASE.sub }}>{r.desc}</span>
            </div>
          );
        })}
      </Tile>

    </div>
  );
}

// ─── PRESIDENT SCREEN ────────────────────────────────────────────────────────

function PresidentScreen() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <PresidentDashboard/> : <PresidentLock onUnlock={()=>setUnlocked(true)}/>;
}

// ─── WORKFLOW VIEWS ───────────────────────────────────────────────────────────

function Intake({ onNext, role }) {
  const th = THEME[role];
  const [title,setTitle]=useState(""); const [detail,setDetail]=useState(""); const [deadline,setDeadline]=useState(""); const [urgent,setUrgent]=useState(false);
  const ok=title&&detail&&deadline;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"slideUp .3s ease" }}>
      <Tile style={{ background:th.accentSoft }}>
        <p style={{ fontSize:22, fontWeight:900, margin:"0 0 4px", color:th.accentText }}>
          {role==="boss"?"📤 仕事を振る":"📥 案件を受け取る"}
        </p>
        <p style={{ fontSize:13, color:BASE.sub, margin:0 }}>
          {role==="boss"?"スタッフに割り振る仕事を入力してください":"上司から届いた指示をここに入力"}
        </p>
      </Tile>
      <Tile style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><Lbl>{role==="boss"?"仕事のタイトル":"案件タイトル"}</Lbl><Inp placeholder={role==="boss"?"例：提案書作成をお願いしたい":"例：新規クライアント提案書の作成"} value={title} onChange={e=>setTitle(e.target.value)}/></div>
        <div><Lbl>{role==="boss"?"指示内容・やってほしいこと":"上司からの指示内容"}</Lbl><Inp multiline placeholder={role==="boss"?"スタッフへの指示内容を入力…":"「〇〇をやっておいて」のような指示をそのまま…"} value={detail} onChange={e=>setDetail(e.target.value)}/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div><Lbl>希望期限</Lbl><Inp type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
          <div><Lbl>緊急度</Lbl>
            <button onClick={()=>setUrgent(u=>!u)} className="tap-scale" style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${urgent?BASE.red:BASE.border}`, background:urgent?"#FFF0F0":BASE.bg, color:urgent?BASE.red:BASE.sub, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{urgent?"🚨 緊急":"⚡ 通常"}</button>
          </div>
        </div>
      </Tile>
      <TapBtn color={th.accent} disabled={!ok} onClick={()=>onNext({title,detail,deadline,urgent})}>
        {ok?(role==="boss"?"スタッフに振る →":"上司の承認へ →"):"全項目を入力してください"}
      </TapBtn>
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
        <p style={{ fontSize:21, fontWeight:900, margin:"8px 0 4px", color:th.accentText }}>
          {role==="boss"?"誰に送りますか？":"どうしますか？"}
        </p>
        <p style={{ fontSize:13, color:BASE.sub, margin:"0 0 2px" }}>{task.title}</p>
        <p style={{ fontSize:12, color:BASE.sub, margin:0 }}>期限：{task.deadline}　{task.urgent&&<span style={{color:BASE.red,fontWeight:700}}>🚨 緊急</span>}</p>
      </Tile>
      {screen==="main" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {(role==="boss"?[
            {emoji:"📤",label:"送る",       sub:"スタッフに仕事を割り当てる", color:BASE.green,  cb:()=>onNext("approved")},
            {emoji:"📌",label:"留めておく", sub:"まだ割り当てない",           color:BASE.red,    cb:()=>onNext("rejected")},
            {emoji:"💬",label:"相談する",   sub:"理由を伝えて担当者と話す",   color:BASE.orange, cb:()=>setScreen("reason")},
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

// ─── TAB SCREENS ─────────────────────────────────────────────────────────────

function HomeScreen({ role }) {
  const th = THEME[role];

  // 社長は専用ダッシュボードを表示
  if (role==="president") return <PresidentScreen/>;

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
      <div style={{ padding:"16px" }}>
        {step==="intake"     && <Intake     onNext={d=>{setTaskData(d);go("approval")}} role={role}/>}
        {step==="approval"   && <Approval   task={taskData} onNext={r=>go("staff_view",r)} role={role}/>}
        {step==="staff_view" && <StaffView  task={taskData} approval={approval} onNext={()=>go("report")} role={role}/>}
        {step==="report"     && <Report     task={taskData} onReset={reset} role={role}/>}
      </div>
    </>
  );
}

function CasesScreen() {
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
    </div>
  );
}

function NotifsScreen({ onRead, role }) {
  const th=THEME[role];
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
  const th=THEME[role];
  const nameMap={staff:"田中 一郎",boss:"山本 部長",president:"代表取締役社長"};
  const deptMap={staff:"マーケティング部",boss:"マーケティング部　部長",president:"経営本部"};
  return (
    <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
      <Tile style={{ background:th.accentSoft, textAlign:"center", padding:"28px 20px" }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:th.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px" }}>{th.emoji}</div>
        <div style={{ fontSize:18, fontWeight:900 }}>{nameMap[role]}</div>
        <div style={{ fontSize:13, color:BASE.sub, marginTop:4 }}>{deptMap[role]}</div>
        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, background:th.accent, color:"white", fontSize:12, fontWeight:700 }}>
          {th.emoji} {th.label}
        </div>
      </Tile>
      <Tile>
        <Lbl>ロール切り替え</Lbl>
        <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
          {[
            {id:"staff",     label:"👤 スタッフ", th:THEME.staff     },
            {id:"boss",      label:"👔 上司",      th:THEME.boss      },
            {id:"president", label:"👑 社長",      th:THEME.president },
          ].map(r=>(
            <button key={r.id} onClick={()=>onSwitch(r.id)} className="tap-scale" style={{
              flex:1, minWidth:80, padding:"12px 8px", borderRadius:14,
              border:`1.5px solid ${role===r.id?r.th.accent:BASE.border}`,
              background:role===r.id?r.th.accent:BASE.bg,
              color:role===r.id?"white":BASE.sub,
              fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
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

      <AppHeader role={role} onSwitch={switchRole}/>

      <div style={{ position:"fixed", top:HEADER_H, bottom:FOOTER_H, left:0, right:0, overflowY:"auto", background:BASE.bg }}>
        <div key={`${tab}-${role}`} style={{ animation:"slideUp .25s ease", paddingBottom:16 }}>
          {tab==="home"    && <HomeScreen    role={role}/>}
          {tab==="cases"   && <CasesScreen/>}
          {tab==="notifs"  && <NotifsScreen  onRead={()=>setUnread(0)} role={role}/>}
          {tab==="profile" && <ProfileScreen role={role} onSwitch={switchRole}/>}
        </div>
      </div>

      <BottomNav active={tab} onChange={handleTab} unreadCount={unread} role={role}/>
    </div>
  );
}
