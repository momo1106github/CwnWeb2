import wordMap from "../data/word_map.json";
import relationLabels from "../data/relation_labels.json";
// import * as am5 from "@amcharts/amcharts5";

const useData = () => {
  const groupBy = (nodes, prop) => {
    return nodes.reduce((groups, node) => {
      console.log(node[prop]);
      groups[node[prop]] = groups[node[prop]] || [];
      groups[node[prop]].push(node);
      return groups;
    }, {});
  };

  const getRelationNodes = (relations) => {
    return Object.keys(relations).map((type) => ({
      name: relationLabels[type],
      value: 20,
      children: relations[type].map((node) => ({
        name: `[fontSize: 30px]${node[0]}`,
        value: 80,
        children: [],
        cwn_id: node[1],
      })),
    }));
  };

  const queryGlyph = async (glyph) => {
    const idx = wordMap[glyph];
    if (!idx) return null;
    const response = await fetch(`./data/cwn_data/cwn_web_data_${idx}.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const nodes = await response.json();
    console.log(nodes[glyph]);
    const groupedNodes = groupBy(nodes[glyph], "zhuyin");

    return [
      {
        name: `[fontSize: 30px]${glyph}`,
        value: 100,
        children: Object.keys(groupedNodes).map((zhuyin) => ({
          name: zhuyin,
          value: 50,
          children: groupedNodes[zhuyin].map((n) => ({
            ...n,
            name: n.pos,
            value: 10,
            children: getRelationNodes(n.relations),
          })),
          lemma: glyph,
        })),
        // x: am5.percent(50),
        // y: am5.percent(50),
      },
    ];
  };

  return queryGlyph;
};

export default useData;