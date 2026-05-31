const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

function refactorFile(file) {
    const filePath = path.join(routesDir, file);
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Remove uuid import
    code = code.replace(/const\s*{\s*v4\s*:\s*uuidv4\s*}\s*=\s*require\("uuid"\);\n?/g, '');
    
    // 2. Add dbHelpers import
    if (!code.includes('dbHelpers')) {
        code = code.replace(/(const {.*?\} = require\("\.\.\/utils\/time"\);)/, '$1\nconst { mapId, mapIds, toObjectId } = require("../utils/dbHelpers");');
    }

    // 3. Remove `id: uuidv4(),` insertions
    code = code.replace(/\s*id:\s*uuidv4\(\),?\n?/g, '\n');

    // 4. Update string ID queries to _id
    // This requires care.
    code = code.replace(/{ id: req\.params\.id }/g, '{ _id: toObjectId(req.params.id) }');
    code = code.replace(/{ id: req\.user\.id }/g, '{ _id: toObjectId(req.user.id) }');
    code = code.replace(/{ id: prompt_id }/g, '{ _id: toObjectId(prompt_id) }');
    code = code.replace(/{ id: payload\.sub }/g, '{ _id: toObjectId(payload.sub) }');
    code = code.replace(/\{ id: p\.creator_id \}/g, '{ _id: toObjectId(p.creator_id) }');
    code = code.replace(/\{ user_id: me\.id, prompt_id: p\.id \}/g, '{ user_id: me._id.toString(), prompt_id: p._id.toString() }');

    // Remove projection of _id: 0
    code = code.replace(/,\s*{\s*projection:\s*{\s*_id:\s*0[^}]*}\s*}/g, '');
    code = code.replace(/,\s*{\s*projection:\s*{\s*_id:\s*0\s*}\s*}/g, '');

    // Map outputs
    if (file === 'prompts.js') {
        // Rewrite publicView
        code = code.replace(
            /function publicView\(prompt, hideContent = true\) {\s*const out = { \.\.\.prompt };\s*delete out\._id;\s*if \(hideContent\) out\.content = null;\s*return out;\s*}/g,
            `function publicView(prompt, hideContent = true) {\n    const out = mapId(prompt);\n    if (hideContent && out) out.content = null;\n    return out;\n}`
        );
        
        // Rewrite res.json(rows) to mapIds(rows) in prompts.js
        code = code.replace(/res\.json\(rows\);/g, 'res.json(mapIds(rows));');
        code = code.replace(/p\.creator = creator;/g, 'p.creator = mapId(creator);');
        code = code.replace(/p\.creator = await db\.collection\("users"\)\.findOne\(\s*{\s*_id: toObjectId\(p\.creator_id\)\s*},\s*\);/g, 'p.creator = mapId(await db.collection("users").findOne({ _id: toObjectId(p.creator_id) }));');
        code = code.replace(/me\.id === p\.creator_id/g, 'me._id.toString() === p.creator_id');
        
        // purchase insert update to return _id
        code = code.replace(/await db\.collection\("prompts"\)\.insertOne\(\{ \.\.\.doc \}\);\n\s*res\.json\(doc\);/g, 'const result = await db.collection("prompts").insertOne({ ...doc });\n    doc._id = result.insertedId;\n    res.json(mapId(doc));');
    }
    
    // Payments
    if (file === 'payments.js') {
        code = code.replace(/res\.json\(rows\);/g, 'res.json(mapIds(rows));');
        code = code.replace(/res\.json\(history\);/g, 'res.json(mapIds(history));');
    }

    fs.writeFileSync(filePath, code, 'utf8');
}

files.forEach(refactorFile);
console.log('Advanced refactor complete');
