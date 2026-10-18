import type { ZipFileItem } from './zipUtils';

export function createSampleFolder(): ZipFileItem[] {
  const sampleFiles: Array<{ path: string; content: string; type: string }> = [
    {
      path: 'my-project/index.html',
      type: 'text/html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Website Project</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <header>
    <h1>Welcome to My Project</h1>
    <p>This project was packed into a ZIP archive seamlessly in the browser!</p>
  </header>
  <script src="assets/js/main.js"></script>
</body>
</html>`,
    },
    {
      path: 'my-project/assets/css/style.css',
      type: 'text/css',
      content: `body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 2rem;
  background-color: #0f172a;
  color: #f8fafc;
}

header {
  max-width: 640px;
  margin: 0 auto;
  border-radius: 12px;
  background: #1e293b;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

h1 {
  color: #38bdf8;
  font-size: 2rem;
  margin-top: 0;
}`,
    },
    {
      path: 'my-project/assets/js/main.js',
      type: 'text/javascript',
      content: `console.log("Sample project loaded successfully!");

function greetUser(name = "Explorer") {
  console.log(\`Hello, \${name}! Your folder was compressed accurately.\`);
}

greetUser();`,
    },
    {
      path: 'my-project/assets/images/icon.svg',
      type: 'image/svg+xml',
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#0284c7"/>
  <path d="M50 20 L80 60 L60 60 L60 80 L40 80 L40 60 L20 60 Z" fill="#ffffff"/>
</svg>`,
    },
    {
      path: 'my-project/docs/README.md',
      type: 'text/markdown',
      content: `# My Project Documentation

This is a demonstration project folder to showcase folder-to-ZIP compression.

## Folder Structure
- \`index.html\`: Web entrance
- \`assets/css/style.css\`: Main styling
- \`assets/js/main.js\`: Core script
- \`assets/images/icon.svg\`: Project vector icon
- \`docs/README.md\`: Documentation
- \`package.json\`: Project manifest

Everything is preserved with exact subdirectories inside the downloaded ZIP.`,
    },
    {
      path: 'my-project/package.json',
      type: 'application/json',
      content: JSON.stringify(
        {
          name: 'my-project',
          version: '1.0.0',
          description: 'A sample project archived with Folder2Zip',
          main: 'assets/js/main.js',
          author: 'Demo User',
          license: 'MIT',
        },
        null,
        2
      ),
    },
  ];

  return sampleFiles.map((file, idx) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(file.content);
    const fileName = file.path.split('/').pop() || 'file';
    return {
      id: `sample-${idx}-${fileName}`,
      name: fileName,
      path: file.path,
      size: bytes.byteLength,
      type: file.type,
      lastModified: Date.now(),
      content: file.content,
    };
  });
}
