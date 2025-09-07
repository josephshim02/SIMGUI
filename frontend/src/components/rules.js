const notAllowedConnections = [
    // Source rules (Se, Sf)
    ["e_store", "se"],
    ["f_store", "sf"], 
    ["f_junc", "se"], // Se -X-> 1 
    ["e_junc", "sf"], // Sf -X-> 0

    // Passive elements rules C, I, R (e_store, f_store, re)
    // passive connections C, I, R cant be connected to each other, and must connect through junction (0,1)
    ["e_store", "f_store"],
    ["e_store", "re"],
    ["f_store", "re"],
    ["e_store", "e_store"],
    ["f_store", "f_store"],
    ["re", "re"],

    // React element rules - can't connect to passive elements directly
    ["e_store", "rxn"],
    ["f_store", "rxn"],
    ["re", "rxn"],
    ["react", "rxn"],

    // Junction rules 0,1 (e_junc, f_junc)
    // 1,1  and  0,0 is redundant, but 1,0 is allowed
    ["f_junc", "f_junc"], 
    ["e_junc", "e_junc"], 
];

const sourceNodeTypes = ["se", "sf"];
const restrictedConnectionTypes = {
    "re": 1,      // Re can only connect to 1 junction
    "rxn": 2    // React can connect to max 2 junctions
};

function checkBasicRules(outputNodeName, inputNodeName) {
    return !notAllowedConnections.some(pair => 
        (pair[0] === outputNodeName && pair[1] === inputNodeName) ||
        (pair[0] === inputNodeName && pair[1] === outputNodeName)
    );
}

function checkSourceRules(editor, outputNodeId, newOutputNodeName, newInputNodeId) {
    const inputNode = editor.getNodeFromId(newInputNodeId);
    if (!inputNode) {
        return false; // Invalid input node
    }

    // Check all inputs of the target node for existing source connections
    for (let inputClass in inputNode.inputs) {
        const input = inputNode.inputs[inputClass];

        // Check all existing connections to this input
        for (let connection of input.connections) {
            const connectedNode = editor.getNodeFromId(connection.node);

            // If any connected node is a source type, block the new connection
            if (connectedNode && outputNodeId != connection.node && newOutputNodeName == connectedNode.name) {
                return false; // Already has a source connected
            }
        }
    }
    
    return true; // No conflicting source connections found
}

function checkJunctionConnectionLimit(editor, outputNodeName, outputNodeId, inputNodeName, inputNodeId) {
    // Only check for restricted connection types connecting to junctions
    if (!(outputNodeName in restrictedConnectionTypes) || !["e_junc", "f_junc"].includes(inputNodeName)) {
        return true; // No restriction applies
    }

    const outputNode = editor.getNodeFromId(outputNodeId);
    if (!outputNode) {
        return false; // Invalid output node
    }

    const maxConnections = restrictedConnectionTypes[outputNodeName];
    let junctionConnectionCount = 0;

    // Count existing connections from this node to junctions
    for (let outputClass in outputNode.outputs) {
        const output = outputNode.outputs[outputClass];
        
        for (let connection of output.connections) {
            const connectedNode = editor.getNodeFromId(connection.node);
            if (connectedNode && outputNodeId != connection.node && ["e_junc", "f_junc"].includes(connectedNode.name)) {
                junctionConnectionCount++;
            }
        }
    }

    // Check if adding this connection would exceed the limit
    return junctionConnectionCount <= maxConnections;
}

export function checkRules(editor, outputNodeName, inputNodeName, outputNodeId, inputNodeId) {
    // First check basic connection rules
    if (!checkBasicRules(outputNodeName, inputNodeName)) {
        return false;
    }

    // Check source rules
    if (sourceNodeTypes.includes(outputNodeName)) {
        if (!checkSourceRules(editor, outputNodeId, outputNodeName, inputNodeId)) {
            return false;
        }
    }

    // Check junction connection limits for restricted components
    if (!checkJunctionConnectionLimit(editor, outputNodeName, outputNodeId, inputNodeName, inputNodeId)) {
        return false;
    }

    return true; // All checks passed
}