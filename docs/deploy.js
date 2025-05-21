// docs/deploy.js
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build the app
console.log('Building the documentation site...');
execSync('npm run build', { stdio: 'inherit' });

// Create .nojekyll file to prevent GitHub Pages from using Jekyll
console.log('Creating .nojekyll file...');
fs.writeFileSync(path.join(__dirname, 'dist', '.nojekyll'), '');

// Create a simple 404.html for client-side routing
console.log('Creating 404.html for SPA routing...');
const notFoundContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>@voilajsx/appkit Docs</title>
  <script type="text/javascript">
    var pathSegmentsToKeep = 1;
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
  <p>Redirecting to @voilajsx/appkit documentation...</p>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'dist', '404.html'), notFoundContent);

// For GitHub Pages, we need the dist folder content at the root of docs
// but we also want to keep our source code
console.log('Moving built files to docs/build for GitHub Pages...');
fs.ensureDirSync(path.join(__dirname, 'build'));
fs.emptyDirSync(path.join(__dirname, 'build'));
fs.copySync(path.join(__dirname, 'dist'), path.join(__dirname, 'build'));

console.log(
  'Deployment prep complete! The docs/build folder is ready for GitHub Pages.'
);
console.log('Now commit and push the changes to GitHub.');
