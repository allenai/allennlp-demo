export const DEFAULT_MIN_ATTN = 0.1;

/**
 * Metadata about a single NMN module.
 */
export class ModuleInfo {
  /**
   * @param {string} name
   * @param {string} signature
   * @param {string} description
   * @param {number} defaultMinAttn
   * @param {string} tokenSeparator
   */
  constructor(name, signature, description, defaultMinAttn = DEFAULT_MIN_ATTN) {
    this.name = name;
    this.signature = signature;
    this.description = description;
    this.defaultMinAttn = defaultMinAttn;
  }

  /**
   * Returns ModuleInfo for the module with the provided name. If there's no module with the given
   * name, undefined is returned.
   *
   * @param   {string} name
   * @returns {ModuleInfo|undefined}
   */
  static findInfoByName(name) {
    // When there's multiple instances of the same module in a single program, the module name is
    // de-anonymized by prefixing it with as many `*`s is necessary. We strip those prior to
    // searching.
    const canonicalName = name.replace(/\*+$/, '');
    return allModules.find(info => info.name === canonicalName);
  }
}

/**
 * Static list of all modules and some information about them.
 */
const allModules = [
  new ModuleInfo(
    'find',
    'find(Q) → P',
    'For the selected span in the question, find similar spans in the passage.',
    0.01,
  ),
  new ModuleInfo(
    'filter',
    'filter(Q, P) → P',
    'Based on the question, select a subset of spans from the input.',
  ),
  new ModuleInfo(
    'relocate',
    'relocate(Q, P) → P',
    'Based on the question, select the relevant argument for the input passage spans.',
  ),
  new ModuleInfo(
    'find-num',
    'find-num(P) → N',
    'Find the number(s) associated to the input passage spans.',
  ),
  new ModuleInfo(
    'find-date',
    'find-date(P) → D',
    'Find the date(s) associated to the input passage spans.',
  ),
  new ModuleInfo(
    'count',
    'count(P) → C',
    'Count the number of input passage spans.',
  ),
  new ModuleInfo(
    'compare-num-lt',
    'compare-num-lt(P1, P2) → P ',
    'Output the span associated with the smaller number.',
  ),
  new ModuleInfo(
    'compare-num-gt',
    'compare-num-gt(P1, P2) → P ',
    'Output the span associated with the larger number.',
  ),
  new ModuleInfo(
    'number-difference',
    'number-difference(N1, N2) -> N',
    'Return the difference between the two input numbers.'
  ),
  new ModuleInfo(
    'number-addition',
    'number-difference(N1, N2) -> N',
    'Return the summation between the two input numbers.'
  ),
  new ModuleInfo(
    'find-max-num',
    'find-max-num(P) → P',
    'Among the input spans, select the span associated with the largest number.',
  ),
  new ModuleInfo(
    'find-min-num',
    'find-min-num(P) → P',
    'Among the input spans, select the span associated with the smallest number.',
  ),
  new ModuleInfo(
    'span',
    'span(P) → S',
    'Identify a contiguous span from the attended tokens.',
  ),
  new ModuleInfo(
    'compare-date-lt',
    'compare-date-lt(P1, P2) → P',
    'Output the span associated with the earlier date.',
  ),
  new ModuleInfo(
    'compare-date-gt',
    'compare-date-gt(P1, P2) → P',
    'Output the span associated with the later date.',
  ),
  new ModuleInfo(
    'year-diff',
    'year-diff(P1, P2) → TY',
    'Difference in years between the dates associated with the input passage spans.',
  ),
];
