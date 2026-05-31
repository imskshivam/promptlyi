const { ObjectId } = require("mongodb");

/**
 * Safely converts a string or undefined into a MongoDB ObjectId.
 * If the value is already an ObjectId, it returns it as is.
 * If the value is invalid or null/undefined, it may throw or return null.
 * 
 * @param {string|ObjectId} id
 * @returns {ObjectId|null}
 */
function toObjectId(id) {
    if (!id) return null;
    if (id instanceof ObjectId) return id;
    try {
        return new ObjectId(id);
    } catch (e) {
        return null;
    }
}

/**
 * Maps a MongoDB document's _id to a string `id` property, 
 * and deletes the _id property for clean frontend serialization.
 * Also handles foreign keys commonly used in the app if they are ObjectIds.
 * 
 * @param {Object} doc - The MongoDB document
 * @returns {Object|null}
 */
function mapId(doc) {
    if (!doc) return null;
    
    const mapped = { ...doc };
    
    // Convert primary key
    if (mapped._id) {
        mapped.id = mapped._id.toString();
        delete mapped._id;
    }

    // Convert common foreign keys if they are ObjectIds
    const fks = ["user_id", "creator_id", "prompt_id", "plan_id", "client_id", "business_id"];
    for (const fk of fks) {
        if (mapped[fk] instanceof ObjectId) {
            mapped[fk] = mapped[fk].toString();
        }
    }

    return mapped;
}

/**
 * Maps an array of MongoDB documents
 * 
 * @param {Array<Object>} docs
 * @returns {Array<Object>}
 */
function mapIds(docs) {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.map(mapId);
}

module.exports = {
    toObjectId,
    mapId,
    mapIds
};
