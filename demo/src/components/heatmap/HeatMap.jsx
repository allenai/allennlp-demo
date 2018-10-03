/*
 * A scrollable component that displays a two-dimensional heat map, with labels on the rows and the
 * columns.  This is done with a series of divs, where the first div has the column labels (the
 * `XLabels` component) and the rest of the divs each have a row label and then colored boxes for
 * each cell, where the colors are determined by the data values (the `DataGrid` component).
 *
 * Supported normalization types:
 *    "none" (default, use this if you already have normalized probability distributions),
 *    "log-global" (does a global softmax over the whole matrix to get a probability distribution),
 *    "log-per-row" (does a softmax per row to get a probability distribution),
 *    "log-per-row-with-zero" (does a softmax per row, with the addition of a 0 logit),
 *    "linear" (finds the max and min values in the matrix, does a linear interpolation between them)
 */

import React from 'react';
import PropTypes from 'prop-types';
import XLabels from './XLabels';
import DataGrid from './DataGrid';

function HeatMap({xLabels, yLabels, data, background, height, xLabelWidth, boxSize, normalization}) {
  return (
    <div style={{height: height, overflow: "scroll", overflowX: "scroll", whiteSpace: "nowrap"}}>
      <XLabels labels={xLabels} width={xLabelWidth} boxSize={boxSize} />
      <DataGrid
        {...{xLabels, yLabels, data, background, height, xLabelWidth, boxSize, normalization}}
      />
    </div>
  );
}

HeatMap.propTypes = {
  xLabels: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  yLabels: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  background: PropTypes.string,
  height: PropTypes.number,
  xLabelWidth: PropTypes.number,
  normalization: PropTypes.string,
};

HeatMap.defaultProps = {
  background: '#329fff',
  height: 600,
  xLabelWidth: 60,
  boxSize: 28,
  overflow: "scroll",
};

export default HeatMap;
