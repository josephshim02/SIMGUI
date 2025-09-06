alert("Rules loaded");

const notAllowedConnections = [
    // Source rules (Se, Sf)
    ["e_store", "se"],
    ["f_store", "sf"],

    // Passive elements rules C, I, R
    // passive connections C, I, R cant be connected to each other, and must connect through junction (0,1)
    ["e_store", "f_store"],
    ["e_store", "re"],
    ["f_store", "re"],
    ["e_store", "e_store"],
    ["f_store", "f_store"],
    ["re", "re"],

    // Junction rules 0,1
    // 1,1  and  0,0 is redundant, but 1,0 is allowed
    ["f_junc", "f_junc"], 
    ["e_junc", "e_junc"], 
];

const sourceNodeTypes = ["se", "sf"];

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
            
            console.log("Connected node:", connectedNode);

            // If any connected node is a source type, block the new connection
            if (connectedNode && outputNodeId != connection.node && newOutputNodeName == connectedNode.name) {
                return false; // Already has a source connected
            }
        }
    }
    
    return true; // No conflicting source connections found
}

export function checkRules(editor, outputNodeName, inputNodeName, outputNodeId, inputNodeId) {
    // First check basic connection rules
    if (!checkBasicRules(outputNodeName, inputNodeName)) {
        return false
    }

    if (sourceNodeTypes.includes(outputNodeName)) {
        // Then check source rules
        if (!checkSourceRules(editor, outputNodeId, outputNodeName, inputNodeId)) {
            return false
        }
    }
    return true; // All checks passed
}