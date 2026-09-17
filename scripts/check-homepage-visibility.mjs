// Run in a browser after homepage entrance animations have settled.
// Checks painted visibility, not merely whether the text exists in the DOM.
export function checkHomepageVisibility() {
  const heading = document.querySelector("main h1");
  const bio = heading?.nextElementSibling;
  const socialLink = document.querySelector("main a[aria-label]");
  const results = [];

  for (const [name, element] of [["heading", heading], ["bio", bio], ["social link", socialLink]]) {
    if (!element) throw new Error(`Homepage ${name} is missing`);
    let opacity = 1;
    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (style.display === "none" || style.visibility !== "visible") {
        throw new Error(`Homepage ${name} is hidden by ${ancestor.tagName}`);
      }
      opacity *= Number(style.opacity);
    }
    const bounds = element.getBoundingClientRect();
    if (opacity < 0.99 || bounds.width === 0 || bounds.height === 0) {
      throw new Error(`Homepage ${name} is not visible (effective opacity ${opacity})`);
    }
    results.push({ name, text: element.textContent, opacity });
  }

  return results;
}
