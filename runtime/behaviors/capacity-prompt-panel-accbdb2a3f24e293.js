export default async function install(app) {
  const layerId=app.config.graphicsLayerId;
  let active={type:null,status:null};
  let lastPrompt="Show all capacity sites";

  const control=document.createElement("calcite-action");
  control.setAttribute("icon","speech-bubble");
  control.setAttribute("text","Capacity prompts");
  control.setAttribute("title","Capacity prompts");
  control.setAttribute("scale","m");
  control.className="esri-widget";

  const panel=document.createElement("div");
  panel.className="esri-widget";
  Object.assign(panel.style,{display:"none",width:"min(560px, calc(100vw - 120px))",padding:"14px",boxSizing:"border-box",borderRadius:"2px",boxShadow:"0 1px 4px rgba(0,0,0,.3)",background:"var(--calcite-color-foreground-1,#fff)"});
  const heading=document.createElement("div");Object.assign(heading.style,{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",marginBottom:"10px"});
  const title=document.createElement("strong");title.textContent="Ask the capacity map";
  const close=document.createElement("calcite-action");close.setAttribute("icon","x");close.setAttribute("text","Close prompts");close.setAttribute("scale","s");heading.append(title,close);
  const intro=document.createElement("p");intro.textContent="Choose a suggested request or type one using a site type and capacity colour.";Object.assign(intro.style,{margin:"0 0 10px",fontSize:"0.85rem",color:"var(--calcite-color-text-2)"});
  const form=document.createElement("form");Object.assign(form.style,{display:"grid",gridTemplateColumns:"1fr auto",gap:"8px",marginBottom:"10px"});
  const input=document.createElement("calcite-input");input.setAttribute("placeholder","e.g. Show all primary substations with green capacity");input.setAttribute("aria-label","Capacity map request");
  const run=document.createElement("calcite-button");run.textContent="Show";run.setAttribute("type","submit");form.append(input,run);
  const suggestions=document.createElement("div");Object.assign(suggestions.style,{display:"flex",flexWrap:"wrap",gap:"6px"});
  const status=document.createElement("p");Object.assign(status.style,{margin:"10px 0 0",fontSize:"0.85rem",fontWeight:"600"});
  panel.append(heading,intro,form,suggestions,status);

  const normaliseType=text=>{if(/dual[ -]?primary|paired/.test(text))return "Dual primary";if(/bulk|bsp/.test(text))return "Bulk supply point";if(/primary|pri/.test(text))return "Primary";return null};
  const normaliseStatus=text=>{if(/green|available|capacity/.test(text))return "Green";if(/amber|limited/.test(text))return "Amber";if(/red|constrain|unavailable|no capacity/.test(text))return "Red";if(/blue/.test(text))return "Blue";return null};
  const matchingStatus=(a,wanted)=>wanted==="Green"?[a.primaryStatus,a.bulkStatus,a.leftStatus,a.rightStatus].includes("Green"):wanted?[a.primaryStatus,a.bulkStatus,a.leftStatus,a.rightStatus].includes(wanted):true;
  const apply=()=>{const layer=app.map.findLayerById(layerId);if(!layer)return 0;let shown=0;for(const graphic of layer.graphics){const a=graphic.attributes||{};const typeOk=!active.type||a.typeLabel===active.type;const statusOk=matchingStatus(a,active.status);graphic.visible=typeOk&&statusOk;if(graphic.visible)shown++}status.textContent=`${shown} sites shown · ${lastPrompt}`;return shown};
  const submitPrompt=value=>{const text=String(value||"").trim();const lower=text.toLowerCase();lastPrompt=text||"Show all capacity sites";if(!text||/show all sites|show all capacity sites|clear|reset/.test(lower)){active={type:null,status:null}}else{active={type:normaliseType(lower),status:normaliseStatus(lower)}}const shown=apply();if(!active.type&&!active.status&&!/all|clear|reset/.test(lower)){status.textContent=`${shown} sites shown · Try mentioning primary, dual-primary or bulk, and green, amber or red.`}input.value=""};
  const prompts=["Show all primary substations with capacity (green)","Show primary substations with limited capacity (amber)","Show constrained primary substations (red)","Show all dual-primary substations","Show all bulk supply points","Show all capacity sites"];
  for(const prompt of prompts){const chip=document.createElement("calcite-chip");chip.setAttribute("kind","neutral");chip.setAttribute("scale","s");chip.setAttribute("value",prompt);chip.textContent=prompt;chip.tabIndex=0;const choose=()=>submitPrompt(prompt);chip.addEventListener("click",choose);chip.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}});suggestions.append(chip)}
  const toggle=()=>{const opening=panel.style.display==="none";panel.style.display=opening?"block":"none";control.toggleAttribute("active",opening);if(opening){apply();setTimeout(()=>input.focus(),0)}};
  const closePanel=()=>{panel.style.display="none";control.removeAttribute("active")};
  const submit=e=>{e.preventDefault();submitPrompt(input.value)};
  control.addEventListener("click",toggle);close.addEventListener("click",closePanel);form.addEventListener("submit",submit);
  app.view.ui.add(control,"top-left");app.view.ui.add(panel,"top-left");
  let changeHandle=null;
  const attach=()=>{changeHandle?.remove?.();const layer=app.map.findLayerById(layerId);if(layer?.graphics?.on)changeHandle=layer.graphics.on("change",()=>queueMicrotask(apply))};
  attach();const layerHandle=app.map.layers.on("change",attach);
  apply();
  app.onCleanup(()=>{control.removeEventListener("click",toggle);close.removeEventListener("click",closePanel);form.removeEventListener("submit",submit);changeHandle?.remove?.();layerHandle?.remove?.();app.view.ui.remove(control);app.view.ui.remove(panel);control.remove();panel.remove();const layer=app.map.findLayerById(layerId);if(layer)for(const graphic of layer.graphics)graphic.visible=true});
  return {promptPanel:true,suggestions:prompts.length,shown:apply()};
}