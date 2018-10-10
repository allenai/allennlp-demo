import React from 'react';
import '../css/HeatMap.css';

/*******************************************************************************
  <HeatMap /> Component

  Properties:

    data: Array[number[]]   * Array of arrays (rows) of numbers (cols) where each number
                              corresponds to a table cell / heatmap intensity value
    colLabels: string[]     * List of table header labels describing each column
    rowLabels: string[]     * List of table header labels describing each row
    normalization: string   * Sets normalization type (optional). Supported types:

      "none" (default, use this if you already have normalized probability distributions),
      "log-global" (does a global softmax over the whole matrix to get a probability distribution),
      "log-per-row" (does a softmax per row to get a probability distribution),
      "log-per-row-with-zero" (does a softmax per row, with the addition of a 0 logit),
      "linear" (finds the max and min values in the matrix, does a linear interpolation between them)

*******************************************************************************/

export default class HeatMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeRow: null,
      activeCol: null
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  handleMouseOver(rowIndex, colIndex) {
    this.setState({
      activeRow: rowIndex,
      activeCol: colIndex
    });
  }

  handleMouseOut() {
    this.setState({
      activeRow: null,
      activeCol: null
    });
  }

  render() {
    const { data,
            colLabels,
            rowLabels,
            normalization = "none" } = this.props;

    const { activeRow,
            activeCol } = this.state;

    let opacity;

    if (normalization === "log-global") {
      const exped = data.map((x_list) => x_list.map((x) => Math.exp(x)));
      const flatArray = exped.reduce((i, o) => [...o, ...i], []);
      const sum = flatArray.reduce((a, b) => a + b, 0);
      opacity = exped.map((x_list) => x_list.map((x) => x / sum));
    } else if (normalization === "log-per-row") {
      const exped = data.map((x_list) => x_list.map((x) => Math.exp(x)));
      opacity = exped.map((x_list) => {
        const sum = x_list.reduce((a, b) => a + b, 0);
        return x_list.map((x) => x / sum);
      });
    } else if (normalization === "log-per-row-with-zero") {
      const exped = data.map((x_list) => x_list.map((x) => Math.exp(x)));
      opacity = exped.map((x_list) => {
        const sum = x_list.reduce((a, b) => a + b, 0) + Math.exp(0);
        return x_list.map((x) => x / sum);
      });
    } else if (normalization === "linear") {
      const flatArray = data.reduce((i, o) => [...o, ...i], []);
      const max = Math.max(...flatArray);
      const min = Math.min(...flatArray);
      if (max === min) {
        opacity = data;
      } else {
        opacity = data.map((x_list) => x_list.map((x) => ((x - min) / (max - min))));
      }
    } else if (normalization === "none") {
      opacity = data;
    }

    return (
      <div className="heatmap-container">
        <div className="heatmap-scroll">
          <div className="heatmap">
            <div className="heatmap__ft">
              <div className="heatmap__tr">
                <div className="heatmap__td heatmap__td--placeholder"></div>
                <div className="heatmap__td">
                  {/* BEGIN Column Labels */}
                  <table className="heatmap__col-labels">
                    <tbody>
                      <tr data-row="header">
                        {colLabels.map((colLabel, colIndex) => (
                          <th className={`heatmap__label${colIndex === activeCol ? " heatmap__col-label-cursor" : ""}`}
                            key={`${colLabel}_${colIndex}`}
                            data-col={colIndex}
                            data-row="header"
                            onMouseOver={() => {this.handleMouseOver(null, colIndex)}}
                            onMouseOut={() => {this.handleMouseOut()}}>
                            <div className="heatmap__label__outer">
                              <div className="heatmap__label__inner">
                                <span>{colLabel}</span>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </tbody>
                  </table>{/* END Column Labels */}
                </div>{/* END .heatmap__td */}
              </div>{/* END .heatmap__tr */}
              <div className="heatmap__tr">
                <div className="heatmap__td">
                  {/* BEGIN Row Labels */}
                  <table className="heatmap__row-labels">
                    <tbody>
                      {rowLabels.map((rowLabel, rowIndex) => (
                        <tr className="heatmap__row" key={`${rowLabel}_${rowIndex}`} data-row={rowIndex}>
                          <th
                            className={`heatmap__label${rowIndex === activeRow ? " heatmap__row-label-cursor" : ""}`}
                            data-col="header"
                            data-row={rowIndex}
                            onMouseOver={() => {this.handleMouseOver(rowIndex, null)}}
                            onMouseOut={() => {this.handleMouseOut()}}>
                            <span>{rowLabel}</span>
                          </th>
                        </tr>
                      ))}
                    </tbody>
                  </table>{/* END Row Labels */}
                </div>{/* END .heatmap__td */}
                <div className="heatmap__td heatmap__datagrid-container">
                  {/* BEGIN Data Grid */}
                  <table>
                    <tbody>
                      {rowLabels.map((rowLabel, rowIndex) => (
                        <tr className="heatmap__row" key={`${rowLabel}_${rowIndex}`} data-row={rowIndex}>
                          {colLabels.map((colLabel, colIndex) => (
                            <td key={`${colLabel}_${colIndex}_${rowLabel}_${rowIndex}`}
                              className="heatmap__cell"
                              data-col={colIndex}
                              data-row={rowIndex}>
                              <div className={`heatmap__cursor${rowIndex === activeRow && colIndex === activeCol ? " heatmap__data--active" : ""}`}></div>
                              <div className={`heatmap__col-cursor${((rowIndex === activeRow && colIndex === activeCol) || (colIndex === activeCol && rowIndex === 0 && activeRow === null)) ? " heatmap__data--active" : ""}`}></div>
                              <div className={`heatmap__row-cursor${((rowIndex === activeRow && colIndex === activeCol) || (rowIndex === activeRow && colIndex === 0 && activeCol === null)) ? " heatmap__data--active" : ""}`}></div>
                              <div className="heatmap__color-box" style={{opacity: opacity[rowIndex][colIndex]}}></div>
                              <div
                                className="heatmap__trigger"
                                onMouseOver={() => {this.handleMouseOver(rowIndex, colIndex)}}
                                onMouseOut={() => {this.handleMouseOut()}}></div>
                              <div className="heatmap__tooltip">{`${data[rowIndex][colIndex]}`}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>{/* END Data Grid */}
                </div>{/* END .heatmap__td */}
              </div>{/* END .heatmap__tr */}
            </div>{/* END .heatmap__ft */}
          </div>{/* END .heatmap */}
        </div>{/* END .heatmap-scroll */}
        {/* END .heatmap-container */}
      </div>
    );
  }
}
