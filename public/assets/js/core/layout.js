export async function renderLayout() {
  const layout = await fetch("/views/layout.html").then(r => r.text());
  document.body.innerHTML = layout;
}
