import React from 'react';
import Tree from 'react-d3-tree';

// ``beams`` should be an array of arrays of pairs (value, history),
// where the outer array is timesteps, and the inner array is the beam
// at that timestep. This function converts the beams into a tree,
// where a sequence's parent is the prior subsequence.
const makeTree = (beams) => {
    const tree = {name: "[]", children: []}
    const node2tree = {"[]": tree}
    beams.forEach(beam => {
        beam.forEach(([value, history]) => {
            // Find the parent, which is the subsequence one element shorter.
            const prehistory = history.slice(0, history.length - 1)
            const previousNode = JSON.stringify(prehistory)
            const parent = node2tree[previousNode]

            // Create a new node for this sequence.
            const newNode = JSON.stringify(history)
            const child = {name: newNode, children: []}

            // Add the node to its parent.
            parent.children.push(child)

            // And index the node.
            node2tree[JSON.stringify(history)] = child
        })
    })

    return tree
}

// Here ``beams`` should be an array of arrays of pairs (value, history).
const BeamTree = ({beams}) => {
    const tree = makeTree(beams)
    return <Tree data={tree}/>
}

export default BeamTree
