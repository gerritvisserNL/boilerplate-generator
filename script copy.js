document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const output = document.getElementById("output");
  const zipContainer = document.getElementById("zipContainer");

  function copyToClipboard(textarea) {
    textarea.select();
    document.execCommand("copy");
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- Get form values ---
    const fontName = document.getElementById("fontName").value.trim();
    const fontWeightsInput = document.getElementById("fontWeight").value.trim();
    const fontWeights = fontWeightsInput.split(";").map((w) => w.trim());
    const fontSize = document.getElementById("fontSize").value.trim();
    const lang = document.getElementById("lang").value.trim();
    const title = document.getElementById("title").value.trim();

    const colors = {
      "--primary": document.getElementById("primary").value,
      "--secondary": document.getElementById("secondary").value,
      "--accent": document.getElementById("accent").value,
      "--background": document.getElementById("background").value,
      "--text": document.getElementById("text").value,
    };

    const rootColors = Object.entries(colors)
      .map(([k, v]) => `  ${k}: hsl(${v});`)
      .join("\n");

    // --- Check if font exists on Google Fonts ---
    try {
      const res = await fetch(
        `https://fonts.googleapis.com/css2?family=${fontName.replaceAll(
          " ",
          "+"
        )}`
      );
      if (!res.ok) {
        alert(`Google Font "${fontName}" does not exist.`);
        return;
      }
    } catch {
      alert("Cannot reach Google Fonts. Check your internet connection.");
      return;
    }

    // --- Validate font weights ---
    const availableWeights = [
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ];
    const invalidWeights = fontWeights.filter(
      (w) => !availableWeights.includes(w)
    );
    if (invalidWeights.length > 0) {
      alert(
        `The following font-weights may not be supported: ${invalidWeights.join(
          ", "
        )}. Use one of: ${availableWeights.join(", ")}`
      );
      return;
    }

    // --- Generate Google Fonts link with multiple weights ---
    const googleFontPreconnect = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
    const googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontName.replaceAll(
      " ",
      "+"
    )}:wght@${fontWeights.join(";")}&display=swap" rel="stylesheet">`;

    // --- File contents ---
    const indexHTML = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="Generate a custom HTML, CSS, and JS boilerplate quickly with your chosen fonts, colors, and layout." />
<title>${title}</title>
<link rel="icon" href="favicon.ico">
<link rel="stylesheet" href="reset.css" />
<link rel="stylesheet" href="styles.css" />
${googleFontPreconnect}
${googleFontLink}
<script src="script.js" defer></script>
</head>
<body>
<div class="container">
<header role="banner"><nav></nav></header>
<main role="main"></main>
<footer role="contentinfo"></footer>
</div>
</body>
</html>`;

    const stylesCSS = `:root {\n${rootColors}\n}\n
html { font-size: ${fontSize}; }
body { font-family: '${fontName}', sans-serif; font-weight: ${fontWeights[0]}; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}`;

    const scriptJS = `// This file is intentionally left empty – add your custom scripts here`;

    const resetCSS = `*,
*::before,
*::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
html, body { height: 100%; line-height: 1.5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
img, picture, video, canvas, svg { display: block; max-width: 100%; height: auto; }
input, button, textarea, select { font: inherit; color: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
address { font-style: normal; }
ul, ol { list-style: none; }
:focus:not(:focus-visible) { outline: none; }
table { border-collapse: collapse; border-spacing: 0; }`;

    const files = [
      { name: "index.html", content: indexHTML },
      { name: "styles.css", content: stylesCSS },
      { name: "script.js", content: scriptJS },
      { name: "reset.css", content: resetCSS },
    ];

    // --- Output per file ---
    output.innerHTML = "";
    files.forEach((file) => {
      const wrapper = document.createElement("div");
      const label = document.createElement("h3");
      label.textContent = file.name;

      const textarea = document.createElement("textarea");
      textarea.value = file.content;

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.className = "copy-btn";
      copyBtn.addEventListener("click", () => copyToClipboard(textarea));

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.className = "copy-btn";
      downloadBtn.addEventListener("click", () =>
        downloadFile(file.name, file.content)
      );

      wrapper.appendChild(label);
      wrapper.appendChild(copyBtn);
      wrapper.appendChild(downloadBtn);
      wrapper.appendChild(textarea);
      output.appendChild(wrapper);
    });

    // --- ZIP Download ---
    zipContainer.innerHTML = "";
    const zipBtn = document.createElement("button");
    zipBtn.textContent = "Download All as ZIP";
    zipBtn.addEventListener("click", async () => {
      if (typeof JSZip === "undefined") {
        alert("JSZip is not loaded. Check your internet connection.");
        return;
      }

      const zip = new JSZip();
      files.forEach((file) => zip.file(file.name, file.content));

      try {
        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "boilerplate.zip";
        a.click();
        alert("ZIP file downloaded!");
      } catch (err) {
        console.error("ZIP generation failed:", err);
        alert("Something went wrong while generating the ZIP file.");
      }
    });
    zipContainer.appendChild(zipBtn);
  });
});
