document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const output = document.getElementById("output");
  const zipContainer = document.getElementById("zipContainer");
  const colorsFieldset = document.getElementById("colorsFieldset");
  const addColorBtn = document.getElementById("addColorBtn");

  const copyToClipboard = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = original), 1500);
    } catch {
      btn.textContent = "Copy failed";
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    }
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const setupColorFocus = (div) => {
    div.querySelectorAll("input").forEach((input) => {
      input.dataset.defaultValue = input.value;
      input.addEventListener("focus", () => {
        if (!input.dataset.userEdited) input.value = "";
      });
      input.addEventListener("input", () => {
        input.dataset.userEdited = true;
      });
      input.addEventListener("blur", () => {
        if (!input.value.trim()) {
          input.value = input.dataset.defaultValue;
          input.dataset.userEdited = false;
        }
      });
    });
  };

  document.querySelectorAll(".color-input").forEach(setupColorFocus);

  addColorBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "color-input";
    div.innerHTML = `
        <input type="text" class="color-name" placeholder="Variable name" />
        <input type="text" class="color-value" placeholder="Value" />
      `;
    colorsFieldset.insertBefore(div, addColorBtn);
    setupColorFocus(div);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const getValue = (id) => document.getElementById(id).value.trim();
    const fontName = getValue("fontName");
    const fontWeights = getValue("fontWeight")
      .split(";")
      .map((w) => w.trim());
    const fontSize = getValue("fontSize");
    const lang = getValue("lang");
    const title = getValue("title");
    const author = getValue("author");
    const favicon = getValue("favicon");
    const lineHeight = getValue("lineHeight");
    const metaDescription = getValue("metaDescription");
    const sampleContent = document.getElementById("sampleContent").checked;
    const extraJS = getValue("extraJS")
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);

    const colors = {};
    document.querySelectorAll(".color-input").forEach((div) => {
      const name = div.querySelector(".color-name").value.trim();
      const value = div.querySelector(".color-value").value.trim();
      if (name && value) colors[`--${name}`] = value;
    });

    const rootColors = Object.entries(colors)
      .map(([k, v]) => `  ${k}: ${v.includes(",") ? `hsl(${v})` : v};`)
      .join("\n");

    const googleFontPreconnect = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
    const googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontName.replaceAll(
      " ",
      "+"
    )}:wght@${fontWeights.join(";")}&display=swap" rel="stylesheet">`;

    const indexHTML = `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${metaDescription}" />
    <meta name="author" content="${author}" />
    <title>${title}</title>
    <link rel="icon" href="${favicon}" />
    <link rel="stylesheet" href="reset.css" />
    <link rel="stylesheet" href="styles.css" />
    ${googleFontPreconnect}
    ${googleFontLink}
    ${extraJS.map((src) => `<script src="${src}"></script>`).join("\n")}
    <script src="script.js" defer></script>
  </head>
  <body>
    <div class="container">
      ${
        sampleContent
          ? `<header><h1>${title}</h1></header><main><p>Hello world!</p></main><footer><p>© ${author}</p></footer>`
          : `<header></header><main></main><footer></footer>`
      }
    </div>
  </body>
</html>`;

    const stylesCSS = `:root {\n${rootColors}\n}\n
html { font-size: ${fontSize}; }
body { font-family: '${fontName}', sans-serif; font-weight: ${fontWeights[0]}; line-height: ${lineHeight}; }
.container { max-width: 1200px; margin: 0 auto; }`;

    const scriptJS = `// Custom scripts here`;

    const resetCSS = `* { margin:0; padding:0; box-sizing:border-box; }
html,body{height:100%;line-height:1.5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
img,picture,video,canvas,svg{display:block;max-width:100%;height:auto;}
input,button,textarea,select{font:inherit;color:inherit;}
ul,ol{list-style:none;}
table{border-collapse:collapse;border-spacing:0;}
:focus:not(:focus-visible){outline:none;}
p,h1,h2,h3,h4,h5,h6{overflow-wrap:break-word;}
address{font-style:normal;}`;

    const files = [
      { name: "index.html", content: indexHTML },
      { name: "styles.css", content: stylesCSS },
      { name: "script.js", content: scriptJS },
      { name: "reset.css", content: resetCSS },
    ];

    output.innerHTML = "";
    files.forEach((file) => {
      const wrapper = document.createElement("div");
      const label = document.createElement("h3");
      label.textContent = file.name;
      const textarea = document.createElement("textarea");
      textarea.value = file.content;

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.className = "copy-btn";
      downloadBtn.type = "button";
      downloadBtn.addEventListener("click", () =>
        downloadFile(file.name, file.content)
      );

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.className = "copy-btn";
      copyBtn.type = "button";
      copyBtn.addEventListener("click", () =>
        copyToClipboard(file.content, copyBtn)
      );

      wrapper.append(label, downloadBtn, copyBtn, textarea);
      output.appendChild(wrapper);
    });

    output.scrollIntoView({ behavior: "smooth", block: "start" });

    // ZIP
    zipContainer.innerHTML = "";
    const zipBtn = document.createElement("button");
    zipBtn.textContent = "Download All as ZIP";
    zipBtn.addEventListener("click", async () => {
      if (typeof JSZip === "undefined") {
        alert("JSZip not loaded.");
        return;
      }
      const zip = new JSZip();
      files.forEach((f) => zip.file(f.name, f.content));
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "boilerplate.zip";
      a.click();
    });
    zipContainer.appendChild(zipBtn);
  });
});
