export default function install(app){
  const styleId="nie-rounded-map-components";
  document.getElementById(styleId)?.remove();
  const style=document.createElement("style");style.id=styleId;
  style.textContent=`
    #app-view calcite-action,
    #app-view .esri-widget--button,
    #app-view arcgis-home,
    #app-view arcgis-expand > calcite-action,
    #app-view [class*="esri-zoom"] button {
      border-radius:50% !important;
      overflow:hidden !important;
    }
    #app-view calcite-button {--calcite-button-corner-radius:999px;border-radius:999px !important;overflow:hidden}
    #app-view calcite-chip {border-radius:999px !important;overflow:hidden}
    #app-view arcgis-expand,
    #app-view arcgis-layer-list,
    #app-view arcgis-basemap-gallery,
    #app-view arcgis-search,
    #app-view .esri-search,
    #app-view .esri-menu,
    #app-view [role="listbox"],
    #app-view [role="menu"] {border-radius:16px !important;overflow:hidden !important}
    #app-view .esri-widget:not(.esri-widget--button),
    #app-view .esri-component > .esri-widget:not(.esri-widget--button) {border-radius:16px !important}
    #app-view [role="dialog"],
    #app-view .esri-popup,
    #app-view .esri-popup__main-container,
    #app-view .esri-features,
    #app-view .esri-feature {border-radius:18px !important;overflow:hidden !important}
    #app-view .esri-popup__header,
    #app-view .esri-popup__header-container {border-radius:18px 18px 0 0 !important}
    #app-view .esri-popup__footer,
    #app-view .esri-popup__navigation {border-radius:0 0 18px 18px !important}
    #app-view .esri-popup__pointer-direction {border-radius:3px !important}
    #app-view input,
    #app-view select,
    #app-view calcite-input {border-radius:999px !important}
    #app-view button[data-details] {border-radius:999px !important}
    #app-view fieldset {border-radius:12px !important}
    #app-view .esri-basemap-gallery__item,
    #app-view .esri-layer-list__item,
    #app-view .esri-search__suggestions-menu li {border-radius:10px !important;overflow:hidden}
    #app-region-left,#app-region-right {border-radius:16px;overflow:hidden}
    @media (max-width:700px){#app-view [role="dialog"],#app-view .esri-popup__main-container{border-radius:14px !important}}
  `;document.head.append(style);
  const rounded=new Set();
  const selectors="calcite-action,calcite-button,calcite-chip,arcgis-home,arcgis-expand,arcgis-layer-list,arcgis-basemap-gallery,arcgis-search,.esri-widget,.esri-popup__main-container,[role='dialog'],[role='listbox'],[role='menu']";
  const apply=()=>{document.querySelectorAll(`#app-view ${selectors}`).forEach(el=>{if(!(el instanceof HTMLElement))return;el.style.setProperty("--calcite-corner-radius","16px");el.style.setProperty("--calcite-corner-radius-base","16px");el.style.setProperty("--calcite-corner-radius-round","999px");if(el.matches("calcite-action,arcgis-home,.esri-widget--button"))el.style.setProperty("border-radius","50%","important");else if(el.matches("[role='dialog'],.esri-popup__main-container,arcgis-expand,arcgis-layer-list,arcgis-basemap-gallery,arcgis-search"))el.style.setProperty("border-radius","16px","important");rounded.add(el)});const popup=app.view.popup?.container;if(popup instanceof HTMLElement){popup.style.setProperty("border-radius","18px","important");popup.style.setProperty("overflow","hidden","important");rounded.add(popup)}};
  const observer=new MutationObserver(apply);observer.observe(document.getElementById("app-view")||document.body,{childList:true,subtree:true});const popupHandle=app.view.watch("popup.visible",apply);apply();
  app.onCleanup(()=>{observer.disconnect();popupHandle?.remove?.();for(const el of rounded){el.style.removeProperty("--calcite-corner-radius");el.style.removeProperty("--calcite-corner-radius-base");el.style.removeProperty("--calcite-corner-radius-round");el.style.removeProperty("border-radius");if(el===app.view.popup?.container)el.style.removeProperty("overflow")}style.remove()});
  return{rounded:true,mapButtons:"circular",popupRadiusPx:18,componentRadiusPx:16};
}