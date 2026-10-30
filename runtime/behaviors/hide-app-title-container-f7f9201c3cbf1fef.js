export default function install(app) {
  const header = document.getElementById("app-header");
  const title = document.getElementById("app-title");
  const titleContainer = title?.parentElement;
  const previousHeaderDisplay = header?.style.display ?? "";
  const previousTitleDisplay = titleContainer?.style.display ?? "";
  if (titleContainer) titleContainer.style.display = "none";
  if (header) header.style.display = "none";
  app.onCleanup(() => {
    if (titleContainer) titleContainer.style.display = previousTitleDisplay;
    if (header) header.style.display = previousHeaderDisplay;
  });
  return { hidden: Boolean(header), titleContainerHidden: Boolean(titleContainer) };
}