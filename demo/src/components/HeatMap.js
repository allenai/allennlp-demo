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
      <div className="heatmap">
        <div className="heatmap__col-labels">
          <div className="heatmap__col-labels__placeholder"></div>
          {colLabels.map((colLabel, colIndex) => (
            <div className="heatmap__label" key={`${colLabel}_${colIndex}`}>{colLabel}</div>
          ))}
        </div>

        <div className="heatmap__datagrid">
          {rowLabels.map((rowLabel, rowIndex) => (
            <div className="heatmap__datagrid__row" key={`${rowLabel}_${rowIndex}`}>
              <div className="heatmap__label">{rowLabel}</div>
              {colLabels.map((colLabel, colIndex) => (
                <div key={`${colLabel}_${colIndex}_${rowLabel}_${rowIndex}`}
                  className="heatmap__cell"
                  title={`${data[rowIndex][colIndex]}`}
                  style={{opacity: opacity[rowIndex][colIndex]}}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
