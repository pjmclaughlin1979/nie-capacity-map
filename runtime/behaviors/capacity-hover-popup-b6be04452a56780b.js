export default function install(app) {
  const view=app.view;
  let sequence=0,lastGraphic=null,closeTimer=null;
  const clearClose=()=>{if(closeTimer){clearTimeout(closeTimer);closeTimer=null}};
  const pointerOverPopup=()=>{const popup=view.popup;const container=popup?.container;return container instanceof Element&&container.matches(":hover")};
  const closeHover=()=>{clearClose();if(pointerOverPopup()){closeTimer=setTimeout(closeHover,500);return}lastGraphic=null;view.container.style.cursor="";view.closePopup()};
  const scheduleClose=()=>{clearClose();closeTimer=setTimeout(closeHover,900)};
  const moveHandle=view.on("pointer-move",async event=>{
    const current=++sequence;clearClose();
    const layer=app.map.findLayerById(app.config.graphicsLayerId);if(!layer)return;
    try{const response=await view.hitTest(event,{include:[layer]});if(current!==sequence)return;const hit=response.results.find(result=>result.type==="graphic"&&result.graphic?.layer?.id===app.config.graphicsLayerId&&result.graphic.visible!==false);const graphic=hit?.graphic;if(graphic){view.container.style.cursor="pointer";if(graphic!==lastGraphic){lastGraphic=graphic;await view.openPopup({features:[graphic],location:graphic.geometry})}}else{view.container.style.cursor="";scheduleClose()}}catch(error){if(current===sequence)scheduleClose()}
  });
  const leave=()=>{sequence++;scheduleClose()};
  view.container.addEventListener("pointerleave",leave);
  app.onCleanup(()=>{sequence++;clearClose();moveHandle.remove();view.container.removeEventListener("pointerleave",leave);view.container.style.cursor="";view.closePopup()});
  return {mouseoverPopups:true,detailsInteraction:true,closeDelayMs:900,layerId:app.config.graphicsLayerId};
}