const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

for (const file of files) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove uuid import
    content = content.replace(/const\s*{\s*v4\s*:\s*uuidv4\s*}\s*=\s*require\("uuid"\);\n?/g, '');
    
    // Add dbHelpers import if not present
    if (!content.includes('dbHelpers')) {
        // Find a good place to insert, e.g. after time util
        content = content.replace(/(const {.*?\} = require\("\.\.\/utils\/time"\);)/, '$1\nconst { mapId, mapIds, toObjectId } = require("../utils/dbHelpers");');
    }

    // Remove id: uuidv4(),
    content = content.replace(/\s*id:\s*uuidv4\(\),?/g, '');

    // Replace { id: req.params.id } with { _id: toObjectId(req.params.id) }
    content = content.replace(/{ id: req\.params\.id }/g, '{ _id: toObjectId(req.params.id) }');
    
    // Replace { id: req.user.id } with { _id: toObjectId(req.user.id) }
    content = content.replace(/{ id: req\.user\.id }/g, '{ _id: toObjectId(req.user.id) }');
    
    // Replace { id: prompt_id } with { _id: toObjectId(prompt_id) }
    content = content.replace(/{ id: prompt_id }/g, '{ _id: toObjectId(prompt_id) }');

    // Replace creator_id: req.user.id with creator_id: req.user.id (this is already fine since req.user.id is a string)
    
    // Remove { projection: { _id: 0 ... } } completely in finds, we will map them
    content = content.replace(/,\s*{\s*projection:\s*{\s*_id:\s*0[^}]*}\s*}/g, '');
    content = content.replace(/,\s*{\s*projection:\s*{\s*_id:\s*0\s*}\s*}/g, '');

    // Any res.json(doc) where doc is from DB should be mapId(doc)
    // For simplicity, we can do this manually or let the script try some replacements.
    // Let's handle the specific routes by saving the file and we can manually check.
    
    fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Refactor complete');
