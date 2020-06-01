import React from 'react'
import { Tree } from 'hierplane';
import { Button } from '@allenai/varnish';


class HierplaneVisualization extends React.Component {
    constructor(...args) {
      super(...args);
      this.state = { selectedIdx: 0 };

      this.selectPrevVerb = this.selectPrevVerb.bind(this);
      this.selectNextVerb = this.selectNextVerb.bind(this);
    }
    selectPrevVerb() {
      const nextIdx =
          this.state.selectedIdx === 0 ? this.props.trees.length - 1 : this.state.selectedIdx - 1;
      this.setState({ selectedIdx: nextIdx });
    }
    selectNextVerb() {
      const nextIdx =
          this.state.selectedIdx === this.props.trees.length - 1 ? 0 : this.state.selectedIdx + 1;
      this.setState({ selectedIdx: nextIdx });
    }

    render() {
      if (this.props.trees) {
        const verbs = this.props.trees.map(({ root: { word } }) => word);

        const totalVerbCount = verbs.length;
        const selectedVerbIdxLabel = this.state.selectedIdx + 1;
        const selectedVerb = verbs[this.state.selectedIdx];

        return (
          <div className="hierplane__visualization">
            <div className="hierplane__visualization-verbs">
              <Button className="hierplane__visualization-verbs__prev" type="link" ghost onClick={this.selectPrevVerb}>
                <svg width="12" height="12">
                  <use xlinkHref="#icon__disclosure"></use>
                </svg>
              </Button>
              <Button type="link" ghost onClick={this.selectNextVerb}>
                <svg width="12" height="12">
                  <use xlinkHref="#icon__disclosure"></use>
                </svg>
              </Button>
              <span className="hierplane__visualization-verbs__label">
                Verb {selectedVerbIdxLabel} of {totalVerbCount}: <strong>{selectedVerb}</strong>
              </span>
            </div>
            <Tree tree={this.props.trees[this.state.selectedIdx]} theme="light" />
          </div>
        )
      } else {
        return null;
      }
    }
  }

export default HierplaneVisualization
