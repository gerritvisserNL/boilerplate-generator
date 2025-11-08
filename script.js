document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const output = document.getElementById("output");
  const zipContainer = document.getElementById("zipContainer");

  // --- Copy to clipboard (moderne API) ---
  const copyToClipboard = async (textarea) => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Copy failed. Please copy manually.");
    }
  };

  // --- Download één bestand ---
  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => alert(`${filename} downloaded!`), 200);
  };

  // --- Formulier submit ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // --- Form values ---
    const fontName = document.getElementById("fontName").value.trim();
    const fontWeight = document.getElementById("fontWeight").value;
    const fontSize = document.getElementById("fontSize").value;
    const lang = document.getElementById("lang").value;
    const title = document.getElementById("title").value;

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

    const googleFontPreconnect = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;

    const googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontName.replaceAll(
      " ",
      "+"
    )}:wght@${fontWeight}&display=swap" rel="stylesheet">`;

    // --- File contents ---
    const indexHTML = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="" />
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

    const stylesCSS = `:root {
${rootColors}
}

html {
  font-size: ${fontSize};
}

body {
  font-family: '${fontName}', sans-serif;
  font-weight: ${fontWeight};
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}`;

    const scriptJS = `console.log("Boilerplate loaded");`;

    const resetCSS = `/* Modern CSS reset 2025 */
*,
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

    // --- Output ---
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

      wrapper.append(label, copyBtn, downloadBtn, textarea);
      output.appendChild(wrapper);
    });

    // --- Scroll naar resultaat ---
    output.scrollIntoView({ behavior: "smooth" });

    // --- ZIP Download ---
    zipContainer.innerHTML = "";
    const zipBtn = document.createElement("button");
    zipBtn.textContent = "Download All as ZIP";
    zipBtn.style.marginTop = "1rem";
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
