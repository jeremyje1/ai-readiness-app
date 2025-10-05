const fs = require('fs');
const path = require('path');

const marketingHtml = fs.readFileSync('marketing-page.html', 'utf8');
const urlRegex = /https:\/\/aiblueprint\.educationaiblueprint\.com\/([^"'\s]+)/g;
const urls = [...marketingHtml.matchAll(urlRegex)].map(match => match[1]);
const uniquePaths = [...new Set(urls)];

console.log('📋 Marketing Page Links Analysis:\n');
console.log('Found', uniquePaths.length, 'unique paths:\n');

uniquePaths.sort().forEach(urlPath => {
    // Convert URL path to file path
    const segments = urlPath.split('/');
    let appPath = path.join('app', ...segments, 'page.tsx');
    
    // Check if page exists
    const exists = fs.existsSync(appPath);
    
    console.log(exists ? '✅' : '❌', `/${urlPath}`, exists ? '' : '(MISSING)');
});

console.log('\n📁 Existing app pages:');
const getPages = (dir, prefix = '') => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    let pages = [];
    
    for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('_') && !item.name.startsWith('.')) {
            pages = pages.concat(getPages(path.join(dir, item.name), prefix + '/' + item.name));
        } else if (item.name === 'page.tsx') {
            pages.push(prefix || '/');
        }
    }
    return pages;
};

const existingPages = getPages('app').sort();
existingPages.forEach(page => console.log('  ', page));

