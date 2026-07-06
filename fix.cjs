const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let totalFixes = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const rules = [
        { from: /(?<=[ "'`\n]|^|:)ms-/g, to: 'ml-' },
        { from: /(?<=[ "'`\n]|^|:)me-/g, to: 'mr-' },
        { from: /(?<=[ "'`\n]|^|:)ps-/g, to: 'pl-' },
        { from: /(?<=[ "'`\n]|^|:)pe-/g, to: 'pr-' },
        { from: /(?<=[ "'`\n]|^|:)start-/g, to: 'left-' },
        { from: /(?<=[ "'`\n]|^|:)end-/g, to: 'right-' },
        { from: /(?<=[ "'`\n]|^|:)text-start\b/g, to: 'text-left' },
        { from: /(?<=[ "'`\n]|^|:)text-end\b/g, to: 'text-right' },
        { from: /(?<=[ "'`\n]|^|:)border-s\b/g, to: 'border-l' },
        { from: /(?<=[ "'`\n]|^|:)border-s-/g, to: 'border-l-' },
        { from: /(?<=[ "'`\n]|^|:)border-e\b/g, to: 'border-r' },
        { from: /(?<=[ "'`\n]|^|:)border-e-/g, to: 'border-r-' },
        { from: /(?<=[ "'`\n]|^|:)rounded-s\b/g, to: 'rounded-l' },
        { from: /(?<=[ "'`\n]|^|:)rounded-s-/g, to: 'rounded-l-' },
        { from: /(?<=[ "'`\n]|^|:)rounded-e\b/g, to: 'rounded-r' },
        { from: /(?<=[ "'`\n]|^|:)rounded-e-/g, to: 'rounded-r-' },
        { from: /(?<=[ "'`\n]|^|:)rounded-ts-/g, to: 'rounded-tl-' },
        { from: /(?<=[ "'`\n]|^|:)rounded-te-/g, to: 'rounded-tr-' },
        { from: /(?<=[ "'`\n]|^|:)rounded-bs-/g, to: 'rounded-bl-' },
        { from: /(?<=[ "'`\n]|^|:)rounded-be-/g, to: 'rounded-br-' },
    ];

    rules.forEach(rule => {
        content = content.replace(rule.from, rule.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
        totalFixes++;
    }
});

console.log('Total files fixed:', totalFixes);
