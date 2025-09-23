import { NODE_META }from "./drawflowConstants";

/*
 *Takes json object describing the state of the drawflow editor and transforms it into 
 *desired structure for backend to simulate
*/
export function cleanDrawflowData(drawflowData, verbose = false) {
  const drawFlowDict = JSON.parse(JSON.stringify(drawflowData));
  const usefulData = drawFlowDict.drawflow.Home.data;
  for (const node_id in usefulData) {
    delete usefulData[node_id].html;
    const meta = NODE_META[usefulData[node_id].name];
    let param_dict = {};
    if (meta.body === 'param') {
      const element = document.getElementById(`param-${node_id}`);
      param_dict['parameters'] = element.value;
    } else if (meta.body === 'source') {
      const element = document.getElementById(`source-${node_id}`);
      param_dict['source'] = element.value;
    }
    usefulData[node_id].params = param_dict;
    if (verbose) {
      console.log('param_dict:', param_dict);
    }
  }
  drawFlowDict.drawflow.Home.data = usefulData;
  return drawFlowDict;
}
