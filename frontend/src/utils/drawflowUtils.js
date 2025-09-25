import { NODE_META }from "./drawflowConstants";

const INVALID_GRAPH = false;

//Currently directly accesses the dom which is not the best practice but fine for now
/*
 *Takes json object describing the state of the drawflow editor and transforms it into 
 *desired structure for backend to simulate
*/


export function prepareDrawflowData(editorRef, simulationParameters) {
  const drawflowData = editorRef.current.export();
  const drawFlowDict = JSON.parse(JSON.stringify(drawflowData));
  const usefulData = drawFlowDict.drawflow.Home.data;
  const sendData = {
    "node_data": {},
    "simulation_data": {}
  }
  for (const node_id in usefulData) {
    sendData.node_data[node_id] = {         // initialize the node object
      class: usefulData[node_id].class,
      data: usefulData[node_id].data,
      inputs: usefulData[node_id].inputs,
      outputs: usefulData[node_id].outputs,
      id: usefulData[node_id].id
    };
  }
  sendData.simulation_data = simulationParameters
  return sendData;
}

export function checkInvalidGraph(editorRef) {
  let nodeParamsAreInvalid = checkInvalidNodeparams(editorRef);
  let graphIsConnected = checkGraphConnected(editorRef);
  
  if (!nodeParamsAreInvalid && graphIsConnected) {
    return INVALID_GRAPH;
  }
  
  return nodeParamsAreInvalid;
}

/*
* ChatGPT generated
*/
function checkGraphConnected(editorRef) {
  const drawFlowDict = prepareDrawflowData(editorRef, {});
  const nodes = drawFlowDict.node_data;
  const nodeIds = Object.keys(nodes);

  if (nodeIds.length === 0) return true; // empty graph = trivially connected

  // Build adjacency list
  const adjacency = {};
  for (const nodeId in nodes) {
    adjacency[nodeId] = new Set();

    // Add neighbors from outputs
    const outputs = nodes[nodeId].outputs || {};
    for (const outputKey in outputs) {
      outputs[outputKey].connections.forEach(conn => {
        adjacency[nodeId].add(conn.node);
      });
    }

    // Add neighbors from inputs
    const inputs = nodes[nodeId].inputs || {};
    for (const inputKey in inputs) {
      inputs[inputKey].connections.forEach(conn => {
        adjacency[nodeId].add(conn.node);
      });
    }
  }

  // BFS or DFS
  const visited = new Set();
  const startNode = nodeIds[0];
  const queue = [startNode];
  visited.add(startNode);

  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbor of adjacency[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // Check if we visited all nodes
  if (visited.size === nodeIds.length) {
    return INVALID_GRAPH;
  } else {
    return "Please create a connected graph, some nodes are disconnected";
  } 
}


function checkInvalidNodeparams(editorRef) {
  let data = editorRef.current.export();
  let usefulData = data.drawflow.Home.data;
  let errorString = 'Please fill in the Initial Value for'
  let errorFlag = false;
  for (let node_id in usefulData) {
    if (usefulData[node_id].name == 'e_store' || usefulData[node_id].name == 'ce_store') {
      let element = editorRef.current.precanvas.querySelector(`#initial-${node_id}`);
      if (!element?.value) {
        errorFlag = true;
        errorString += ` ${usefulData[node_id].name},`
      }
    }
  }
  
  if (errorFlag) {
    return errorString.slice(0, -1);
  }

  return false;
}

export async function sendToBackend(editorRef, duration = 5) {
  
  const simulationParameters = { 'time': duration };
  const cleanedData = prepareDrawflowData(editorRef,simulationParameters);

  console.log('Cleaned Data:', cleanedData);

  //To download JSON as a file /////////////////////////////////////////////////////////////////
  // const blob = new Blob([JSON.stringify(cleanedData)], { type: "application/json" });
  // const url = URL.createObjectURL(blob);

  // const link = document.createElement("a");
  // link.href = url;
  // link.download = "data.json"; // file name
  // link.click();

  const response = await fetch("http://localhost:8000/api/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanedData),
  });
  return response.json();
}


