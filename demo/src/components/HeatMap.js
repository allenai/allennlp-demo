import React from 'react';
import '../css/HeatMap.css';

/*******************************************************************************
  <HeatMap /> Component

  Supported normalization types:
    "none" (default, use this if you already have normalized probability distributions),
    "log-global" (does a global softmax over the whole matrix to get a probability distribution),
    "log-per-row" (does a softmax per row to get a probability distribution),
    "log-per-row-with-zero" (does a softmax per row, with the addition of a 0 logit),
    "linear" (finds the max and min values in the matrix, does a linear interpolation between them)

*******************************************************************************/

export default class HeatMap extends React.Component {
  render() {
    const { data,
            colLabels,
            rowLabels,
            normalization = "none" } = this.props;

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
        <div className="heatmap">
          <table className="heatmap__datagrid">
            <tbody>
              <tr className="heatmap__col-labels" data-row="header">
                <th className="heatmap__col-labels__placeholder"></th>
                {colLabels.map((colLabel, colIndex) => (
                  <th className="heatmap__label" key={`${colLabel}_${colIndex}`} data-col={colIndex} data-row="header">
                    <div className="heatmap__label__outer">
                      <div className="heatmap__label__inner">
                        <span>{colLabel}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
              {rowLabels.map((rowLabel, rowIndex) => (
                <tr className="heatmap__datagrid__row" key={`${rowLabel}_${rowIndex}`} data-row={rowIndex}>
                  <th className="heatmap__label" data-col="header" data-row={rowIndex}>
                    <span>{rowLabel}</span>
                  </th>
                  {colLabels.map((colLabel, colIndex) => (
                    <td key={`${colLabel}_${colIndex}_${rowLabel}_${rowIndex}`}
                      data-col={colIndex}
                      data-row={rowIndex}
                      className="heatmap__cell"
                      title={`${data[rowIndex][colIndex]}`}>
                      <div className="heatmap__color-box" style={{opacity: opacity[rowIndex][colIndex]}}></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
