import { useState, useEffect, useRef } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  gold:"#c8861a", goldLt:"#e8c87a", goldDim:"rgba(200,134,26,0.28)",
  blue:"#4a8aff", red:"#ff6060", green:"#4affb4", purple:"#a87fff",
  bg:"#08070a", panel:"rgba(200,134,26,0.05)", border:"rgba(200,134,26,0.28)",
  text:"#c8b08a", muted:"#6a5a3a", dark:"rgba(13,17,23,0.96)",
};

// ── Game Data ──────────────────────────────────────────────────────────────
const SCENES = {
  dream:[
    {type:"narrator",text:"The wheat fields stretch gold beneath a moonless sky. Young Joseph stirs in his sleep — and the dream begins."},
    {type:"line",speaker:"Joseph",pose:"happy",side:"left",text:"Brother… I have dreamed a dream.",fx:"Sparkle"},
    {type:"line",speaker:"Joseph",pose:"excited",side:"left",text:"Behold — your sheaves bowed down before my sheaf!",fx:"Sparkle"},
    {type:"choice",prompt:"What will Joseph do?",options:[
      {label:"Explain the dream",next:"dream_explain"},
      {label:"Stay Silent",next:"dream_silent"},
    ]},
  ],
  dream_explain:[
    {type:"line",speaker:"Joseph",pose:"calm",side:"left",text:"It is but a dream… yet it felt so real."},
    {type:"goto",next:"stars"},
  ],
  dream_silent:[
    {type:"line",speaker:"Brothers",pose:"angry",side:"right",text:"He speaks too proudly! Shall you indeed reign over us?",fx:"Screen_Shake"},
    {type:"goto",next:"stars"},
  ],
  stars:[
    {type:"narrator",text:"Scene: The Stars — BG_StarsField_Night",bg:"BG_StarsField_Night"},
    {type:"line",speaker:"Joseph",pose:"excited",side:"left",text:"Father! The sun, the moon — and eleven stars — bowed down before me!",fx:"Sparkle"},
    {type:"line",speaker:"Father",pose:"surprised",side:"right",text:"What is this dream? Shall I and your mother and brothers bow before you?",fx:"Screen_Shake"},
    {type:"goto",next:"betrayal"},
  ],
  betrayal:[
    {type:"narrator",text:"Scene: Betrayal — BG_Desert_Pit",bg:"BG_Desert_Pit"},
    {type:"line",speaker:"Brothers",pose:"angry",side:"right",text:"Behold — the dreamer cometh! Come now, let us slay him!",fx:"Screen_Shake"},
    {type:"choice",prompt:"What will Joseph do?",options:[
      {label:"Beg for Mercy",next:"betrayal_beg"},
      {label:"Stand Brave",next:"betrayal_brave"},
    ]},
  ],
  betrayal_beg:[
    {type:"line",speaker:"Joseph",pose:"crying",side:"left",text:"Please, my brothers! What have I done? I am your own blood!"},
    {type:"narrator",text:"He was cast into a pit — and sold for twenty pieces of silver.",fx:"Fade_Out;Faith_Tested"},
    {type:"goto",next:"potiphar"},
  ],
  betrayal_brave:[
    {type:"line",speaker:"Joseph",pose:"brave",side:"left",text:"You have done wrong. But God sees what you do this day."},
    {type:"narrator",text:"He was cast into a pit — and sold for twenty pieces of silver.",fx:"Fade_Out;Faith_Tested"},
    {type:"goto",next:"potiphar"},
  ],
  potiphar:[
    {type:"narrator",text:"Scene: Potiphar — BG_Potiphar_House",bg:"BG_Potiphar_House"},
    {type:"line",speaker:"Potiphar",pose:"calm",side:"right",text:"This Hebrew servant — the LORD seems to be with him.",fx:"Fade_In"},
    {type:"line",speaker:"Joseph",pose:"firm",side:"left",text:"I will serve faithfully. I will not betray your trust.",fx:"Golden_Glow"},
    {type:"goto",next:"temptation"},
  ],
  temptation:[
    {type:"narrator",text:"Scene: Temptation — BG_Potiphar_House"},
    {type:"line",speaker:"Wife",pose:"tense",side:"right",text:"(Stepping close) Come — be with me."},
    {type:"line",speaker:"Joseph",pose:"firm",side:"left",text:"How can I do this great wickedness and sin against God?"},
    {type:"choice",prompt:"What will Joseph do?",options:[
      {label:"Flee at once",next:"temptation_run"},
      {label:"Remain and reason",next:"temptation_stay"},
    ]},
  ],
  temptation_run:[
    {type:"narrator",text:"Joseph fled — leaving his cloak behind. Integrity preserved. A price still to be paid.",fx:"Fade_Out;Integrity+1"},
    {type:"goto",next:"prison"},
  ],
  temptation_stay:[
    {type:"narrator",text:"Joseph lingered — and was accused falsely. Cast into prison by the very man who trusted him.",fx:"Screen_Shake;Betrayal+1"},
    {type:"goto",next:"prison"},
  ],
  prison:[
    {type:"narrator",text:"Scene: Prison — BG_Prison_Dark",bg:"BG_Prison_Dark"},
    {type:"line",speaker:"Cupbearer",pose:"calm",side:"right",text:"A dream has troubled me in this prison. I do not know what it means.",fx:"Dark_Vignette"},
    {type:"line",speaker:"Joseph",pose:"calm",side:"left",text:"Tell me your dream. Do not interpretations belong to God?"},
    {type:"narrator",text:"Joseph interpreted — the cupbearer would live. All came true. And yet the cupbearer forgot him.",fx:"Forgotten+1"},
    {type:"goto",next:"wait"},
  ],
  wait:[
    {type:"narrator",text:"Scene: The Wait — BG_Prison_Dark"},
    {type:"line",speaker:"Joseph",pose:"praying",side:"left",text:"O God… two full years. I have done no wrong. How long must I wait?",fx:"Candle_Flicker"},
    {type:"goto",next:"pharaoh"},
  ],
  pharaoh:[
    {type:"narrator",text:"Scene: Pharaoh — BG_Palace_Throne",bg:"BG_Palace_Throne"},
    {type:"line",speaker:"Pharaoh",pose:"worried",side:"right",text:"I have dreamed a dream — and none in Egypt can interpret it.",fx:"Golden_Glow"},
    {type:"line",speaker:"Joseph",pose:"confident",side:"left",text:"It is not in me — but God shall give Pharaoh an answer of peace."},
    {type:"goto",next:"interpret"},
  ],
  interpret:[
    {type:"narrator",text:"Scene: Interpret — BG_Palace_Throne"},
    {type:"line",speaker:"Joseph",pose:"confident",side:"left",text:"Seven years of great plenty — then seven years of famine so great the plenty will be forgotten.",fx:"Sparkle"},
    {type:"line",speaker:"Pharaoh",pose:"commanding",side:"right",text:"Since God has shown you all this, you shall be over my house and all my people.",fx:"Golden_Glow;Triumph+1"},
    {type:"goto",next:"reunion"},
  ],
  reunion:[
    {type:"narrator",text:"Scene: Reunion — BG_Palace_Hall",bg:"BG_Palace_Hall"},
    {type:"line",speaker:"Brothers",pose:"guilty",side:"right",text:"(Bowing) My lord — we have come from Canaan to buy food. The famine is severe.",fx:"Fade_In"},
    {type:"narrator",text:"Joseph recognized his brothers — but they did not know him. Years of silence between them."},
    {type:"choice",prompt:"What will Joseph do?",options:[
      {label:"Reveal Himself now",next:"reunion_reveal"},
      {label:"Test them first",next:"reunion_test"},
    ]},
  ],
  reunion_reveal:[
    {type:"line",speaker:"Joseph",pose:"crying",side:"left",text:"I am Joseph! Does my father still live?",fx:"Golden_Glow"},
    {type:"goto",next:"reveal"},
  ],
  reunion_test:[
    {type:"line",speaker:"Joseph",pose:"confident",side:"left",text:"I am a lord of Egypt. Bring your youngest brother — then I will know you are honest men."},
    {type:"goto",next:"reveal"},
  ],
  reveal:[
    {type:"narrator",text:"Scene: Reveal — BG_Palace_Hall"},
    {type:"line",speaker:"Joseph",pose:"crying",side:"left",text:"I am your brother Joseph — whom you sold into Egypt. God sent me before you to preserve life.",fx:"Golden_Glow;Candle_Rise"},
    {type:"line",speaker:"Brothers",pose:"shocked",side:"right",text:"(Speechless — unable to answer him, for they were troubled at his presence.)",fx:"Screen_Shake"},
    {type:"goto",next:"ending_choice"},
  ],
  ending_choice:[
    {type:"narrator",text:"Jacob came down to Egypt. The family was whole again — after years of grief and silence.",fx:"Sparkle"},
    {type:"choice",prompt:"What will Joseph say?",options:[
      {label:"Forgive Fully",next:"end_good"},
      {label:"Keep Some Distance",next:"end_neutral"},
    ]},
  ],
  end_good:[
    {type:"end",ending:"good",title:"Forgiven & Restored",
     quote:"You intended harm — but God intended it for good.",
     ref:"Genesis 50:20",traits:[{n:"Integrity",v:"+2",c:C.gold},{n:"Forgiveness",v:"+1",c:C.blue}]},
  ],
  end_neutral:[
    {type:"end",ending:"neutral",title:"Grace from a Distance",
     quote:"Joseph provided — but the silence between them remained.",
     ref:"Genesis 50:21",traits:[{n:"Integrity",v:"+1",c:C.gold},{n:"Faith",v:"+1",c:C.purple}]},
  ],
};

const CHAPTER_LIST = [
  {id:"dream",     name:"The Dream",      ch:"01", unlocked:true},
  {id:"stars",     name:"The Stars",      ch:"02", unlocked:true},
  {id:"betrayal",  name:"Betrayal",       ch:"03", unlocked:true},
  {id:"potiphar",  name:"Potiphar",       ch:"04", unlocked:true},
  {id:"temptation",name:"Temptation",     ch:"05", unlocked:true},
  {id:"prison",    name:"Prison",         ch:"06", unlocked:false},
  {id:"wait",      name:"The Wait",       ch:"07", unlocked:false},
  {id:"pharaoh",   name:"Pharaoh",        ch:"08", unlocked:false},
  {id:"interpret", name:"Interpret",      ch:"09", unlocked:false},
  {id:"reunion",   name:"Reunion",        ch:"10", unlocked:false},
  {id:"reveal",    name:"The Reveal",     ch:"11", unlocked:false},
  {id:"ending_choice","name":"Forgiven", ch:"12", unlocked:false},
];

// ── Shared micro-components ────────────────────────────────────────────────
const Divider = () => (
  <div style={{display:"flex",alignItems:"center",gap:6,width:"80%",margin:"7px 0"}}>
    <div style={{flex:1,height:1,background:C.goldDim}}/>
    <span style={{fontSize:7,color:C.muted}}>✦</span>
    <div style={{flex:1,height:1,background:C.goldDim}}/>
  </div>
);

const Btn = ({label,color=C.gold,onClick,w="80%",style={}}) => (
  <div onClick={onClick} style={{width:w,padding:"8px 0",background:`${color}12`,
    border:`1.5px dashed ${color}66`,borderRadius:4,textAlign:"center",
    fontSize:9,color,letterSpacing:2,cursor:"pointer",
    transition:"background .15s",...style}}
    onMouseEnter={e=>e.currentTarget.style.background=`${color}22`}
    onMouseLeave={e=>e.currentTarget.style.background=`${color}12`}>
    {label}
  </div>
);

const HomeBar = () => (
  <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:"auto",paddingBottom:10}}>
    {[6,20,6].map((w,i)=><div key={i} style={{width:w,height:3,background:"rgba(255,255,255,0.12)",borderRadius:2}}/>)}
  </div>
);

const NavRow = ({onBack,title,right=null}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
    padding:"10px 12px 0",position:"relative",zIndex:10}}>
    <div onClick={onBack} style={{width:24,height:24,border:`1px dashed ${C.goldDim}`,
      borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:10,color:C.gold,cursor:"pointer"}}>←</div>
    <span style={{fontSize:9,color:C.gold,letterSpacing:2}}>{title}</span>
    {right||<div style={{width:24}}/>}
  </div>
);

// ── Sprite placeholder ─────────────────────────────────────────────────────
const SpriteBox = ({speaker,pose,side}) => {
  const col = speaker==="Brothers"||speaker==="Wife" ? C.red :
              speaker==="Pharaoh"||speaker==="Father"||speaker==="Potiphar"||speaker==="Cupbearer" ? C.blue : C.gold;
  return (
    <div style={{position:"absolute",bottom:"33%",[side==="left"?"left":"right"]:"6%",
      width:54,height:80,border:`1.5px dashed ${col}55`,borderRadius:"50% 50% 4px 4px",
      background:`${col}07`,zIndex:3,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"flex-end",paddingBottom:4}}>
      <span style={{fontSize:6,color:`${col}66`,textAlign:"center"}}>{speaker}<br/>{pose}</span>
    </div>
  );
};

// ── FX Badge ───────────────────────────────────────────────────────────────
const FXBadge = ({fx}) => fx ? (
  <div style={{position:"absolute",top:8,right:8,zIndex:20,
    padding:"2px 6px",background:"rgba(200,134,26,0.12)",
    border:`1px solid ${C.gold}44`,borderRadius:2,fontSize:6,color:C.gold,letterSpacing:1}}>
    ⚡ {fx}
  </div>
) : null;

// ── SCREEN 01: Splash ──────────────────────────────────────────────────────
function SplashScreen({go}) {
  useEffect(()=>{const t=setTimeout(()=>go("title"),2000);return()=>clearTimeout(t);},[]);
  return (
    <div onClick={()=>go("title")} style={{width:"100%",height:"100%",display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",
      background:"radial-gradient(circle at 50% 50%,#1a0a00 0%,#08070a 100%)"}}>
      <div style={{fontSize:26,color:`${C.gold}44`,marginBottom:14,
        animation:"pulse 2s infinite"}}>✦</div>
      <div style={{width:"62%",height:52,border:`1.5px dashed ${C.goldDim}`,borderRadius:5,
        display:"flex",alignItems:"center",justifyContent:"center",background:C.panel}}>
        <span style={{fontSize:8,color:C.muted,letterSpacing:2}}>STUDIO LOGO</span>
      </div>
      <div style={{marginTop:18,display:"flex",gap:5}}>
        {[...Array(5)].map((_,i)=>(
          <div key={i} style={{width:7,height:7,borderRadius:"50%",
            background:i<3?C.gold:"rgba(200,134,26,0.15)"}}/>
        ))}
      </div>
      <div style={{marginTop:10,fontSize:7,color:C.muted,letterSpacing:3}}>LOADING…</div>
      <div style={{marginTop:6,fontSize:6,color:`${C.muted}66`,letterSpacing:1}}>Tap to skip</div>
    </div>
  );
}

// ── SCREEN 02: Title ───────────────────────────────────────────────────────
function TitleScreen({go}) {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#1a0a00,#3d1c00 40%,#1a0a00)"}}>
      <div style={{marginTop:24,display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:30,height:1,background:`linear-gradient(90deg,transparent,${C.gold})`}}/>
        <div style={{width:5,height:5,background:C.gold,borderRadius:"50%",opacity:.6}}/>
        <div style={{width:30,height:1,background:`linear-gradient(90deg,${C.gold},transparent)`}}/>
      </div>
      <div style={{marginTop:12,width:"78%",height:88,border:`1.5px dashed ${C.goldDim}`,
        borderRadius:6,background:C.panel,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:11,color:C.goldLt,letterSpacing:1}}>Joseph's Journey</span>
        <span style={{fontSize:7,color:C.muted,letterSpacing:3,marginTop:4}}>FROM PIT TO PALACE</span>
        <div style={{width:40,height:1,background:C.goldDim,marginTop:7}}/>
        <span style={{fontSize:6.5,color:`${C.muted}88`,marginTop:4,letterSpacing:1}}>Genesis 37–50</span>
      </div>
      <div style={{marginTop:14,width:"84%",padding:"7px 10px",
        background:C.panel,border:`1px dashed ${C.border}`,borderRadius:4,textAlign:"center"}}>
        <div style={{fontSize:6.5,color:C.muted,letterSpacing:2}}>CHAPTER</div>
        <div style={{fontSize:11,color:C.goldLt,marginTop:2}}>The Dream</div>
      </div>
      <Divider/>
      <Btn label="▶  START GAME" onClick={()=>go("chapter_select")}/>
      <div style={{marginTop:8,display:"flex",gap:8,width:"78%"}}>
        {[["CONTINUE",()=>go("saveload")],["SETTINGS",()=>go("settings")]].map(([t,fn])=>(
          <div key={t} onClick={fn} style={{flex:1,padding:"7px 0",
            border:`1px dashed ${C.goldDim}`,borderRadius:3,textAlign:"center",
            fontSize:7.5,color:C.muted,letterSpacing:1,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.color=C.gold}
            onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{t}</div>
        ))}
      </div>
      {/* Bottom nav */}
      <div style={{marginTop:12,display:"flex",gap:6,width:"84%"}}>
        {[["🖼","GALLERY",()=>go("gallery")],["👤","CHARS",()=>go("characters")],
          ["🏅","ACHIEVE",()=>go("achievements")],["📜","CREDITS",()=>go("credits")]].map(([ic,t,fn])=>(
          <div key={t} onClick={fn} style={{flex:1,padding:"5px 0",
            border:`1px dashed rgba(255,255,255,0.07)`,borderRadius:3,textAlign:"center",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.goldDim}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
            <div style={{fontSize:11}}>{ic}</div>
            <div style={{fontSize:5.5,color:C.muted,marginTop:1,letterSpacing:1}}>{t}</div>
          </div>
        ))}
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 03: Settings ────────────────────────────────────────────────────
function SettingsScreen({go}) {
  const [vals,setVals] = useState({bgm:70,sfx:55,speed:80});
  const [toggles,setToggles] = useState({auto:true,skip:false,sub:true});
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>go("title")} title="SETTINGS"/>
      <Divider/>
      <div style={{width:"86%",display:"flex",flexDirection:"column",gap:10,marginTop:4}}>
        {[["BGM Volume","bgm"],["SFX Volume","sfx"],["Text Speed","speed"]].map(([label,key])=>(
          <div key={key} style={{width:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:8,color:C.text}}>{label}</span>
              <span style={{fontSize:7,color:C.muted}}>{vals[key]}%</span>
            </div>
            <div style={{width:"100%",height:4,background:"rgba(200,134,26,0.1)",borderRadius:2,cursor:"pointer"}}
              onClick={e=>{
                const rect=e.currentTarget.getBoundingClientRect();
                const pct=Math.round(((e.clientX-rect.left)/rect.width)*100);
                setVals(v=>({...v,[key]:Math.max(0,Math.min(100,pct))}));
              }}>
              <div style={{width:`${vals[key]}%`,height:"100%",background:C.gold,borderRadius:2,opacity:.8,transition:"width .1s"}}/>
            </div>
          </div>
        ))}
        <Divider/>
        {[["Auto Play","auto"],["Skip Read Text","skip"],["Subtitles","sub"]].map(([label,key])=>(
          <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:8,color:C.text}}>{label}</span>
            <div onClick={()=>setToggles(t=>({...t,[key]:!t[key]}))}
              style={{width:30,height:16,background:toggles[key]?`${C.gold}30`:"rgba(255,255,255,0.05)",
              border:`1px dashed ${toggles[key]?C.gold:"rgba(255,255,255,0.1)"}`,
              borderRadius:8,position:"relative",cursor:"pointer",transition:"all .2s"}}>
              <div style={{width:11,height:11,borderRadius:"50%",position:"absolute",top:1.5,
                left:toggles[key]?16:1.5,background:toggles[key]?C.gold:"rgba(255,255,255,0.15)",transition:"left .2s"}}/>
            </div>
          </div>
        ))}
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 04: Save / Load ─────────────────────────────────────────────────
function SaveLoadScreen({go}) {
  const [tab,setTab]=useState("save");
  const slots=[
    {label:"Pharaoh — Palace Throne",ch:"Ch.08",filled:true},
    {label:"Prison — Dark Cell",ch:"Ch.06",filled:true},
    {label:"— Empty —",ch:"",filled:false},
    {label:"— Empty —",ch:"",filled:false},
  ];
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>go("title")} title="SAVE / LOAD"/>
      <div style={{display:"flex",gap:0,width:"86%",marginBottom:10}}>
        {["save","load"].map(t=>(
          <div key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"5px 0",textAlign:"center",
            fontSize:8,color:tab===t?C.gold:C.muted,letterSpacing:2,cursor:"pointer",
            borderBottom:`2px solid ${tab===t?C.gold:"transparent"}`,transition:"all .2s"}}>
            {t.toUpperCase()}
          </div>
        ))}
      </div>
      <div style={{width:"86%",display:"flex",flexDirection:"column",gap:7}}>
        {slots.map((s,i)=>(
          <div key={i} onClick={()=>s.filled&&go("game",{scene:"pharaoh"})}
            style={{display:"flex",gap:8,alignItems:"center",padding:"7px 8px",
            border:`1px dashed ${s.filled?C.border:"rgba(255,255,255,0.07)"}`,
            borderRadius:4,background:s.filled?C.panel:"transparent",
            cursor:s.filled?"pointer":"default",transition:"background .15s"}}
            onMouseEnter={e=>s.filled&&(e.currentTarget.style.background="rgba(200,134,26,0.1)")}
            onMouseLeave={e=>s.filled&&(e.currentTarget.style.background=C.panel)}>
            <div style={{width:38,height:38,border:`1px dashed ${s.filled?C.goldDim:"rgba(255,255,255,0.07)"}`,
              borderRadius:3,background:s.filled?"rgba(200,134,26,0.06)":"transparent",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>
              {s.filled?"▶":"＋"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:6.5,color:C.muted,letterSpacing:1}}>SLOT {i+1}</div>
              <div style={{fontSize:8.5,color:s.filled?C.text:"rgba(255,255,255,0.12)",marginTop:2}}>{s.label}</div>
              {s.ch&&<div style={{fontSize:6,color:C.muted,marginTop:1}}>{s.ch}</div>}
            </div>
          </div>
        ))}
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 05: Chapter Select ──────────────────────────────────────────────
function ChapterSelectScreen({go}) {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>go("title")} title="CHAPTERS"/>
      <div style={{width:"90%",flex:1,overflowY:"auto",display:"flex",
        flexDirection:"column",gap:5,paddingBottom:12,marginTop:6}}>
        {CHAPTER_LIST.map(c=>(
          <div key={c.id} onClick={()=>c.unlocked&&go("game",{scene:c.id})}
            style={{display:"flex",gap:8,alignItems:"center",padding:"6px 9px",borderRadius:4,
            border:`1px dashed ${!c.unlocked?"rgba(255,255,255,0.06)":c.id==="dream"?C.gold:C.goldDim}`,
            background:c.id==="dream"?`${C.gold}12`:"transparent",
            cursor:c.unlocked?"pointer":"default",transition:"background .15s"}}
            onMouseEnter={e=>c.unlocked&&(e.currentTarget.style.background=`${C.gold}10`)}
            onMouseLeave={e=>c.unlocked&&(e.currentTarget.style.background=c.id==="dream"?`${C.gold}12`:"transparent")}>
            <div style={{width:20,height:20,borderRadius:"50%",fontSize:8,
              display:"flex",alignItems:"center",justifyContent:"center",
              background:!c.unlocked?"rgba(255,255,255,0.03)":c.id==="dream"?`${C.gold}40`:`${C.gold}20`,
              color:!c.unlocked?"rgba(255,255,255,0.12)":C.gold}}>
              {!c.unlocked?"🔒":c.id==="dream"?"▶":"✓"}
            </div>
            <div>
              <div style={{fontSize:6,color:C.muted,letterSpacing:1}}>CH {c.ch}</div>
              <div style={{fontSize:8.5,color:!c.unlocked?"rgba(255,255,255,0.18)":C.text}}>{c.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SCREEN 06/07/08: Game (Dialogue + Choice + Narrator) ──────────────────
function GameScreen({go,initScene="dream"}) {
  const [scene,setScene]=useState(initScene);
  const [lineIdx,setLineIdx]=useState(0);
  const [showPause,setShowPause]=useState(false);
  const [showFX,setShowFX]=useState(false);
  const [fxText,setFXText]=useState("");

  const lines = SCENES[scene]||[];
  const cur = lines[lineIdx];

  const advance = () => {
    if(!cur) return;
    if(cur.fx){setFXText(cur.fx);setShowFX(true);setTimeout(()=>setShowFX(false),900);}
    if(cur.type==="goto"){
      setScene(cur.next);setLineIdx(0);return;
    }
    if(cur.type==="end"){go("ending",{data:cur});return;}
    if(cur.type==="choice") return;
    const next=lineIdx+1;
    if(next>=lines.length){return;}
    setLineIdx(next);
  };

  const choose=(opt)=>{
    setScene(opt.next);setLineIdx(0);
  };

  if(showPause) return (
    <PauseScreen
      onResume={()=>setShowPause(false)}
      onSave={()=>go("saveload")}
      onSettings={()=>go("settings")}
      onChapters={()=>go("chapter_select")}
      onTitle={()=>go("title")}
    />
  );

  if(!cur) return null;

  // Narrator / transition line
  if(cur.type==="narrator"||cur.type==="goto") {
    return (
      <div onClick={cur.type==="goto"?undefined:advance}
        style={{width:"100%",height:"100%",position:"relative",
        background:"linear-gradient(175deg,#0d1117,#1a2332)",cursor:"pointer"}}>
        <div style={{position:"absolute",inset:0,border:`1px dashed ${C.goldDim}`,
          background:"rgba(200,134,26,0.02)"}}>
          <span style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",
            fontSize:6,color:"rgba(200,134,26,0.18)",letterSpacing:2}}>
            {cur.bg||"SCENE BG"}
          </span>
        </div>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,transparent 40%,rgba(13,17,23,0.96) 75%)"}}/>
        {showFX&&<div style={{position:"absolute",inset:0,
          background:"radial-gradient(circle at 50% 40%,rgba(200,134,26,0.25),transparent 70%)",
          zIndex:8,pointerEvents:"none"}}/>}
        {cur.fx&&<FXBadge fx={cur.fx}/>}
        <div style={{position:"absolute",bottom:"29%",left:10,right:10,zIndex:5,
          padding:"9px 12px",background:"rgba(13,17,23,0.9)",
          border:`1px dashed ${C.goldDim}`,borderRadius:5,
          borderLeft:`3px solid ${C.gold}88`}}>
          <div style={{fontSize:8,color:C.text,lineHeight:1.65,fontStyle:"italic"}}>{cur.text}</div>
        </div>
        {cur.type!=="goto"&&(
          <>
          <div style={{position:"absolute",bottom:"17%",left:0,right:0,zIndex:5,
            textAlign:"center",fontSize:7,color:C.muted,letterSpacing:3}}>
            ◈  {scene.toUpperCase().replace("_"," ")}  ◈
          </div>
          <div style={{position:"absolute",bottom:"8%",left:0,right:0,zIndex:5,
            textAlign:"center",fontSize:7,color:`${C.gold}55`,letterSpacing:2}}>
            Tap to continue  ▸
          </div>
          </>
        )}
        {cur.type==="goto"&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
            justifyContent:"center",zIndex:10}}
            onClick={advance}>
            <div style={{fontSize:7,color:`${C.gold}44`,letterSpacing:2}}>Loading scene…</div>
          </div>
        )}
      </div>
    );
  }

  // Choice screen
  if(cur.type==="choice") {
    return (
      <div style={{width:"100%",height:"100%",position:"relative",
        background:"linear-gradient(175deg,#0d1117,#1a2332)"}}>
        <div style={{position:"absolute",inset:0,border:`1px dashed ${C.goldDim}`,
          background:"rgba(200,134,26,0.02)"}}>
          <span style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",
            fontSize:6,color:"rgba(200,134,26,0.18)",letterSpacing:2}}>SCENE BG</span>
        </div>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,transparent 30%,rgba(13,17,23,0.97) 65%)"}}/>
        <div style={{position:"absolute",top:10,left:12,zIndex:6,cursor:"pointer"}}
          onClick={()=>setShowPause(true)}>
          <div style={{width:22,height:22,border:`1px dashed ${C.goldDim}`,
            borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,color:C.muted}}>☰</div>
        </div>
        <div style={{position:"absolute",bottom:"43%",left:"14%",right:"14%",zIndex:5,
          padding:"7px 10px",background:"rgba(13,17,23,0.9)",
          border:`1px dashed ${C.goldDim}`,borderRadius:4,
          fontSize:8,color:C.text,textAlign:"center",lineHeight:1.5}}>
          {cur.prompt}
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:5,
          padding:"0 12px 16px",display:"flex",flexDirection:"column",gap:8,
          height:"42%",justifyContent:"flex-end",
          background:"linear-gradient(180deg,transparent,rgba(13,17,23,0.97) 30%)"}}>
          {cur.options.map((opt,i)=>(
            <div key={i} onClick={()=>choose(opt)}
              style={{padding:"9px 14px",
              background:`${i===0?C.blue:C.gold}10`,
              border:`1.5px dashed ${i===0?C.blue:C.gold}55`,
              borderRadius:5,cursor:"pointer",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${i===0?C.blue:C.gold}22`}
              onMouseLeave={e=>e.currentTarget.style.background=`${i===0?C.blue:C.gold}10`}>
              <div style={{fontSize:10,color:i===0?C.blue:C.gold}}>◈  {opt.label}</div>
              <div style={{fontSize:6.5,color:"rgba(200,200,200,0.25)",marginTop:2,fontFamily:"monospace"}}>
                → scene: {opt.next}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dialogue line
  return (
    <div style={{width:"100%",height:"100%",position:"relative",
      background:"linear-gradient(175deg,#0d1117,#1a2332)"}}>
      <div style={{position:"absolute",inset:0,border:`1px dashed ${C.goldDim}`,
        background:"rgba(200,134,26,0.02)"}}>
        <span style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",
          fontSize:6,color:"rgba(200,134,26,0.18)",letterSpacing:2}}>
          {SCENES[scene]?.find(l=>l.bg)?.bg||"SCENE BG"}
        </span>
      </div>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(180deg,transparent 40%,rgba(13,17,23,0.97) 63%)"}}/>
      {showFX&&<div style={{position:"absolute",inset:0,
        background:"radial-gradient(circle at 50% 40%,rgba(200,134,26,0.22),transparent 70%)",
        zIndex:8,pointerEvents:"none"}}/>}
      {cur.fx&&<FXBadge fx={cur.fx}/>}
      {/* nav buttons */}
      <div style={{position:"absolute",top:10,left:12,right:12,
        display:"flex",justifyContent:"space-between",zIndex:10}}>
        <div onClick={()=>setShowPause(true)} style={{width:22,height:22,
          border:`1px dashed ${C.goldDim}`,borderRadius:3,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:9,color:C.muted,cursor:"pointer"}}>☰</div>
        <div onClick={advance} style={{width:22,height:22,
          border:`1px dashed ${C.goldDim}`,borderRadius:3,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:8,color:C.muted,cursor:"pointer"}}>⏩</div>
      </div>
      {/* sprite */}
      {cur.speaker&&<SpriteBox speaker={cur.speaker} pose={cur.pose} side={cur.side}/>}
      {/* dialogue box */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:5,
        background:`linear-gradient(180deg,rgba(13,17,23,0.88) 0%,rgba(20,12,4,0.97) 100%)`,
        borderTop:`1px solid ${C.border}`,padding:"0 0 14px"}}>
        {cur.speaker&&(
          <div style={{marginLeft:12,marginTop:-8,display:"inline-block",
            background:"rgba(200,134,26,0.15)",border:`1px dashed ${C.gold}88`,
            borderRadius:3,padding:"3px 10px",fontSize:9,color:C.goldLt,letterSpacing:2}}>
            {cur.speaker.toUpperCase()}
          </div>
        )}
        <div onClick={advance} style={{margin:"7px 12px 0",padding:"7px 10px",
          border:`1px dashed ${C.goldDim}`,borderRadius:4,fontSize:8.5,
          color:C.text,lineHeight:1.65,background:"rgba(200,134,26,0.03)",
          minHeight:44,cursor:"pointer"}}>
          {cur.text}
        </div>
        <div onClick={advance} style={{position:"absolute",right:12,bottom:18,
          width:22,height:16,border:`1px dashed ${C.gold}66`,borderRadius:3,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:8,color:C.gold,cursor:"pointer"}}>▶</div>
      </div>
    </div>
  );
}

// ── SCREEN 10: Pause ───────────────────────────────────────────────────────
function PauseScreen({onResume,onSave,onSettings,onChapters,onTitle}) {
  return (
    <div style={{width:"100%",height:"100%",position:"relative",
      background:"linear-gradient(175deg,#0d1117,#1a2332)"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(8,7,10,0.88)",zIndex:2}}/>
      <div style={{position:"absolute",inset:0,zIndex:5,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:9,color:C.gold,letterSpacing:3,marginBottom:4}}>PAUSED</span>
        <Divider/>
        <Btn label="▶  RESUME" onClick={onResume} color={C.gold}/>
        <Btn label="SAVE GAME" onClick={onSave} color={C.muted} w="72%"/>
        <Btn label="SETTINGS" onClick={onSettings} color={C.muted} w="72%"/>
        <Btn label="CHAPTER SELECT" onClick={onChapters} color={C.muted} w="72%"/>
        <Btn label="TITLE SCREEN" onClick={onTitle} color={C.red} w="72%"/>
      </div>
    </div>
  );
}

// ── SCREEN 11: CG Gallery ─────────────────────────────────────────────────
function GalleryScreen({go}) {
  const cgs=[
    {l:"Dream",u:true},{l:"Stars",u:true},{l:"Betrayal",u:true},
    {l:"Potiphar",u:true},{l:"Prison",u:true},{l:"Pharaoh",u:true},
    {l:"Tempt.",u:false},{l:"Reunion",u:false},{l:"Reveal",u:false},
    {l:"End A",u:false},{l:"End B",u:false},{l:"Bonus",u:false},
  ];
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>go("title")} title="CG GALLERY"/>
      <div style={{fontSize:7,color:C.muted,letterSpacing:1,margin:"4px 0 8px"}}>6 / 12 Unlocked</div>
      <div style={{width:"88%",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
        {cgs.map((cg,i)=>(
          <div key={i} style={{aspectRatio:"3/4",
            border:`1px dashed ${cg.u?C.goldDim:"rgba(255,255,255,0.06)"}`,
            borderRadius:3,background:cg.u?"rgba(200,134,26,0.05)":"rgba(0,0,0,0.3)",
            display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",
            cursor:cg.u?"pointer":"default"}}
            onMouseEnter={e=>cg.u&&(e.currentTarget.style.background="rgba(200,134,26,0.1)")}
            onMouseLeave={e=>cg.u&&(e.currentTarget.style.background="rgba(200,134,26,0.05)")}>
            {cg.u
              ?<><span style={{fontSize:14}}>🖼</span>
                 <span style={{fontSize:5.5,color:C.muted,marginTop:2}}>{cg.l}</span></>
              :<span style={{fontSize:14}}>🔒</span>}
          </div>
        ))}
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 12: Characters ─────────────────────────────────────────────────
function CharactersScreen({go}) {
  const [selected,setSelected]=useState(null);
  const chars=[
    {name:"Joseph",role:"Protagonist",bio:"Son of Jacob; dreamer, slave, ruler.",unlocked:true},
    {name:"Brothers",role:"Antagonists",bio:"12 sons of Jacob; jealous of Joseph's favour.",unlocked:true},
    {name:"Father / Jacob",role:"Patriarch",bio:"Loved Joseph above all his sons.",unlocked:true},
    {name:"Potiphar",role:"Egyptian Master",bio:"Captain of Pharaoh's guard.",unlocked:true},
    {name:"Pharaoh",role:"King of Egypt",bio:"Troubled by dreams none could interpret.",unlocked:false},
    {name:"Cupbearer",role:"Prisoner",bio:"Forgot Joseph for two full years.",unlocked:false},
  ];
  if(selected) return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>setSelected(null)} title="CHARACTER"/>
      <div style={{width:60,height:80,border:`1.5px dashed ${C.goldDim}`,
        borderRadius:"50% 50% 6px 6px",background:C.panel,marginTop:16,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>👤</div>
      <div style={{marginTop:10,textAlign:"center"}}>
        <div style={{fontSize:12,color:C.goldLt}}>{selected.name}</div>
        <div style={{fontSize:7.5,color:C.muted,marginTop:3,letterSpacing:2}}>{selected.role.toUpperCase()}</div>
      </div>
      <Divider/>
      <div style={{width:"82%",padding:"10px 12px",border:`1px dashed ${C.border}`,
        borderRadius:5,background:C.panel}}>
        <div style={{fontSize:8.5,color:C.text,lineHeight:1.7}}>{selected.bio}</div>
      </div>
      <HomeBar/>
    </div>
  );
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>go("title")} title="CHARACTERS"/>
      <div style={{width:"88%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginTop:8}}>
        {chars.map((c,i)=>(
          <div key={i} onClick={()=>c.unlocked&&setSelected(c)}
            style={{padding:"8px 8px",border:`1px dashed ${c.unlocked?C.border:"rgba(255,255,255,0.07)"}`,
            borderRadius:4,background:c.unlocked?C.panel:"transparent",
            display:"flex",gap:7,alignItems:"center",
            cursor:c.unlocked?"pointer":"default",transition:"background .15s"}}
            onMouseEnter={e=>c.unlocked&&(e.currentTarget.style.background="rgba(200,134,26,0.1)")}
            onMouseLeave={e=>c.unlocked&&(e.currentTarget.style.background=C.panel)}>
            <div style={{width:28,height:36,border:`1px dashed ${c.unlocked?C.goldDim:"rgba(255,255,255,0.07)"}`,
              borderRadius:"50% 50% 3px 3px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:10,color:c.unlocked?`${C.gold}77`:"rgba(255,255,255,0.08)"}}>
                {c.unlocked?"👤":"🔒"}
              </span>
            </div>
            <div>
              <div style={{fontSize:8,color:c.unlocked?C.text:"rgba(255,255,255,0.15)"}}>{c.name}</div>
              <div style={{fontSize:6,color:C.muted,marginTop:1}}>{c.role}</div>
            </div>
          </div>
        ))}
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 13: Achievements ────────────────────────────────────────────────
function AchievementsScreen({go}) {
  const traits=[
    {name:"Integrity",val:2,max:5,color:C.gold,desc:"Honesty & faithfulness in testing"},
    {name:"Forgiveness",val:1,max:5,color:C.blue,desc:"Releasing offences against you"},
    {name:"Faith",val:3,max:5,color:C.purple,desc:"Trusting God in the dark"},
    {name:"Wisdom",val:1,max:5,color:C.green,desc:"Interpreting dreams & situations"},
  ];
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <NavRow onBack={()=>go("title")} title="ACHIEVEMENTS"/>
      <div style={{fontSize:7,color:C.muted,letterSpacing:1,margin:"3px 0 8px"}}>Trait Tracker · Ch 4 of 12</div>
      <div style={{width:"88%",display:"flex",flexDirection:"column",gap:11}}>
        {traits.map(t=>(
          <div key={t.name}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:8.5,color:C.text}}>{t.name}</span>
              <span style={{fontSize:7,color:t.color,letterSpacing:1}}>{t.val}/{t.max}</span>
            </div>
            <div style={{width:"100%",height:5,background:"rgba(255,255,255,0.05)",borderRadius:3}}>
              <div style={{width:`${(t.val/t.max)*100}%`,height:"100%",
                background:t.color,borderRadius:3,opacity:.75,transition:"width 1s"}}/>
            </div>
            <div style={{fontSize:6.5,color:C.muted,marginTop:2}}>{t.desc}</div>
          </div>
        ))}
        <Divider/>
        <div>
          <div style={{fontSize:8,color:C.text,marginBottom:7}}>Badges</div>
          <div style={{display:"flex",gap:6}}>
            {["🏅","⭐","🌟","🔒","🔒"].map((b,i)=>(
              <div key={i} style={{width:28,height:28,
                border:`1px dashed ${i<3?C.goldDim:"rgba(255,255,255,0.06)"}`,
                borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,cursor:i<3?"pointer":"default"}}>{b}</div>
            ))}
          </div>
        </div>
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 14: Credits ─────────────────────────────────────────────────────
function CreditsScreen({go}) {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:"linear-gradient(175deg,#08070a,#1a0a00)"}}>
      <NavRow onBack={()=>go("title")} title="CREDITS"/>
      <div style={{width:"58%",height:48,border:`1.5px dashed ${C.goldDim}`,
        borderRadius:5,background:C.panel,display:"flex",alignItems:"center",
        justifyContent:"center",marginTop:8}}>
        <span style={{fontSize:7,color:C.muted,letterSpacing:2}}>STUDIO LOGO</span>
      </div>
      <div style={{width:"86%",display:"flex",flexDirection:"column",gap:7,marginTop:12}}>
        {[
          ["GAME ART & DESIGN","[Your Name]"],
          ["STORY & SCRIPT","Original · Genesis 37–50"],
          ["DEVELOPMENT","Unity · Yarn Spinner"],
          ["BACKGROUND ART","[Artist Name]"],
          ["BGM & SFX","[Composer]"],
          ["SPECIAL THANKS","Church Community  ✦"],
        ].map(([role,name])=>(
          <div key={role} style={{borderBottom:`1px solid rgba(200,134,26,0.08)`,paddingBottom:5}}>
            <div style={{fontSize:6,color:C.muted,letterSpacing:2}}>{role}</div>
            <div style={{fontSize:9,color:C.text,marginTop:2}}>{name}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:14,textAlign:"center",padding:"0 16px"}}>
        <div style={{fontSize:8,color:C.muted,fontStyle:"italic",lineHeight:1.6}}>
          "And God meant it for good."
        </div>
        <div style={{fontSize:6.5,color:`${C.muted}88`,marginTop:3}}>Genesis 50:20</div>
      </div>
      <HomeBar/>
    </div>
  );
}

// ── SCREEN 15: Ending ──────────────────────────────────────────────────────
function EndingScreen({go,data={}}) {
  const isGood = data.ending==="good";
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",background:isGood
        ?"linear-gradient(175deg,#0a0a1a,#1c1c3d,#0a0a1a)"
        :"linear-gradient(175deg,#0a0c10,#141824)"}}>
      <div style={{marginTop:12,width:"84%",height:80,
        border:`1.5px dashed ${isGood?C.blue:C.goldDim}`,
        borderRadius:6,background:isGood?"rgba(74,138,255,0.04)":C.panel,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:20,color:`${isGood?C.blue:C.gold}44`}}>✦</span>
        <span style={{fontSize:6.5,color:`${isGood?C.blue:C.muted}`,letterSpacing:2,marginTop:4}}>
          ENDING ILLUSTRATION
        </span>
      </div>
      <div style={{marginTop:12,textAlign:"center"}}>
        <div style={{fontSize:7,color:isGood?C.blue:C.gold,letterSpacing:3,opacity:.8}}>
          {isGood?"GOOD ENDING":"NEUTRAL ENDING"}
        </div>
        <div style={{fontSize:13,color:C.goldLt,marginTop:3,letterSpacing:1}}>{data.title}</div>
        <div style={{width:40,height:1,background:`${C.gold}55`,margin:"6px auto 0"}}/>
      </div>
      <div style={{marginTop:10,width:"84%",padding:"8px 10px",
        border:`1px dashed ${C.goldDim}`,borderRadius:4,background:C.panel,textAlign:"center"}}>
        <div style={{fontSize:8,color:"#a08060",lineHeight:1.65,fontStyle:"italic"}}>"{data.quote}"</div>
        <div style={{fontSize:7,color:C.muted,marginTop:3}}>{data.ref}</div>
      </div>
      <div style={{marginTop:9,width:"84%",padding:"8px 10px",
        border:`1px dashed rgba(255,255,255,0.1)`,borderRadius:4}}>
        <div style={{fontSize:6.5,color:"rgba(200,200,200,0.25)",letterSpacing:2,marginBottom:5}}>TRAITS EARNED</div>
        <div style={{display:"flex",gap:7}}>
          {(data.traits||[]).map(t=>(
            <div key={t.n} style={{flex:1,padding:"5px 6px",
              background:`${t.c}10`,border:`1px dashed ${t.c}44`,
              borderRadius:3,textAlign:"center"}}>
              <div style={{fontSize:10,color:t.c}}>{t.v}</div>
              <div style={{fontSize:7,color:"rgba(200,200,200,0.35)"}}>{t.n}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:10,display:"flex",gap:8,width:"84%"}}>
        <Btn label="PLAY AGAIN" onClick={()=>go("game",{scene:"dream"})} color={C.gold} w="48%"/>
        <Btn label="MAIN MENU" onClick={()=>go("title")} color={C.muted} w="48%"/>
      </div>
      <HomeBar/>
    </div>
  );
}

// ── Router / Phone Shell ───────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("splash");
  const [params,setParams]=useState({});

  const go=(s,p={})=>{setScreen(s);setParams(p);};

  const renderScreen=()=>{
    switch(screen){
      case "splash":        return <SplashScreen go={go}/>;
      case "title":         return <TitleScreen go={go}/>;
      case "settings":      return <SettingsScreen go={go}/>;
      case "saveload":      return <SaveLoadScreen go={go}/>;
      case "chapter_select":return <ChapterSelectScreen go={go}/>;
      case "game":          return <GameScreen go={go} initScene={params.scene||"dream"}/>;
      case "gallery":       return <GalleryScreen go={go}/>;
      case "characters":    return <CharactersScreen go={go}/>;
      case "achievements":  return <AchievementsScreen go={go}/>;
      case "credits":       return <CreditsScreen go={go}/>;
      case "ending":        return <EndingScreen go={go} data={params.data||{}}/>;
      default:              return <TitleScreen go={go}/>;
    }
  };

  const SCREEN_LABELS={
    splash:"01 · Splash",title:"02 · Title",settings:"03 · Settings",
    saveload:"04 · Save / Load",chapter_select:"05 · Chapters",
    game:"06–08 · Game",gallery:"11 · CG Gallery",
    characters:"12 · Characters",achievements:"13 · Achievements",
    credits:"14 · Credits",ending:"15 · Ending",
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"flex-start",
      padding:"28px 16px 40px",fontFamily:"'Georgia',serif"}}>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:8,color:"#3a2a18",letterSpacing:4,marginBottom:4}}>
          INTERACTIVE PROTOTYPE · MOBILE VISUAL NOVEL
        </div>
        <div style={{fontSize:20,color:C.goldLt,letterSpacing:2}}>Joseph's Journey</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8}}>
          <div style={{height:1,width:50,background:`linear-gradient(90deg,transparent,${C.goldDim})`}}/>
          <div style={{width:4,height:4,background:C.gold,borderRadius:"50%",opacity:.4}}/>
          <div style={{height:1,width:50,background:`linear-gradient(90deg,${C.goldDim},transparent)`}}/>
        </div>
      </div>

      {/* Current screen label */}
      <div style={{marginBottom:12,padding:"4px 14px",
        background:`${C.gold}12`,border:`1px dashed ${C.goldDim}`,borderRadius:20,
        fontSize:8,color:C.gold,letterSpacing:2}}>
        ◈ {SCREEN_LABELS[screen]||screen.toUpperCase()} ◈
      </div>

      {/* Phone */}
      <div style={{width:220,height:440,background:"#0f0f12",borderRadius:32,padding:5,
        boxShadow:`0 0 0 1px ${C.goldDim}, 0 16px 60px rgba(0,0,0,0.7)`,
        position:"relative"}}>
        {/* Notch */}
        <div style={{position:"absolute",top:9,left:"50%",transform:"translateX(-50%)",
          width:44,height:12,background:"#0f0f12",borderRadius:7,zIndex:20,
          display:"flex",alignItems:"center",justifyContent:"center",gap:5,
          boxShadow:"0 0 0 1px rgba(255,255,255,0.04)"}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
          <div style={{width:14,height:4,borderRadius:2,background:"rgba(255,255,255,0.07)"}}/>
        </div>
        {/* Screen area */}
        <div style={{width:"100%",height:"100%",borderRadius:28,overflow:"hidden",position:"relative"}}>
          {renderScreen()}
        </div>
        {/* Side buttons */}
        <div style={{position:"absolute",right:-4,top:80,width:4,height:28,
          background:"rgba(200,134,26,0.15)",borderRadius:"0 3px 3px 0"}}/>
        {[70,96].map(t=>(
          <div key={t} style={{position:"absolute",left:-4,top:t,width:4,height:22,
            background:"rgba(200,134,26,0.1)",borderRadius:"3px 0 0 3px"}}/>
        ))}
      </div>

      {/* Help text */}
      <div style={{marginTop:16,textAlign:"center",maxWidth:260}}>
        <div style={{fontSize:7.5,color:C.muted,lineHeight:1.8}}>
          Tap the screen to interact • ▶ to advance dialogue<br/>
          ☰ opens Pause Menu • Choices branch the story
        </div>
      </div>

      {/* Quick nav */}
      <div style={{marginTop:16,display:"flex",flexWrap:"wrap",
        justifyContent:"center",gap:5,maxWidth:320}}>
        {[
          ["Splash","splash"],["Title","title"],["Settings","settings"],
          ["Save","saveload"],["Chapters","chapter_select"],["Game","game"],
          ["Gallery","gallery"],["Chars","characters"],["Achieve","achievements"],
          ["Credits","credits"],
        ].map(([label,s])=>(
          <div key={s} onClick={()=>go(s)} style={{padding:"4px 10px",cursor:"pointer",
            background:screen===s?`${C.gold}18`:"transparent",
            border:`1px dashed ${screen===s?C.gold:C.goldDim}`,
            borderRadius:20,fontSize:7,color:screen===s?C.gold:C.muted,
            letterSpacing:1,transition:"all .15s"}}
            onMouseEnter={e=>{if(screen!==s){e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.color=C.gold;}}}
            onMouseLeave={e=>{if(screen!==s){e.currentTarget.style.borderColor=C.goldDim;e.currentTarget.style.color=C.muted;}}}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
