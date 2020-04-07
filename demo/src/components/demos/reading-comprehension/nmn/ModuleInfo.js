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
  constructor(name, signature, description, defaultMinAttn = 0.1) {
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
   * @returns {ModuleInfo}
   */
  static findInfoByName(name) {
    // When there's multiple instances of the same module in a single program, the module name is
    // de-anonymized by prefixing it with as many `*`s is necessary. We strip those prior to
    // searching.
    const canonicalName = name.replace(/\*+$/, '');
    const info = allModules.find(info => info.name === canonicalName);

    // Fallback to something sensible, so the UI doesn't error out in this scenario
    if (!info) {
      return new ModuleInfo(canonicalName, `${canonicalName}(?, ?) -> ?`, 'Sorry, no description yet.');
    }
    return info;
  }
}

/**
 * Static list of all modules and some information about them.
 */
const allModules = [
  new ModuleInfo(
    'find',
    'find(Q) → P',
    'For text spans in the question, find similar text spans in the passage.',
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
    'Find spans in the passage related to an argument in the question.',
  ),
  new ModuleInfo(
    'find-num',
    'find-num(P) → N',
    'Find the number(s) associated to the input paragraph spans.',
  ),
  new ModuleInfo(
    'find-date',
    'find-date(P) → D',
    'Find the date(s) associated to the input paragraph spans.',
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
    'date-diff',
    'date-diff(P1, P2) → TD',
    'Difference between the dates associated with the paragraph spans.',
  ),
  new ModuleInfo(
    'find-max-num',
    'find-max-num(P) → P',
    'Select the text span in the passage with the largest number.',
  ),
  new ModuleInfo(
    'find-min-num',
    'find-min-num(P) → P',
    'Select the text span in the passage with the smallest number.',
  ),
  new ModuleInfo(
    'span',
    'span(P) → S',
    'Identify a contiguous span from the attended tokens.',
  ),
  new ModuleInfo(
    'compare-date-lt',
    'compare-date-lt(P1, P2) → P ',
    'Output the span associated with the earlier date.',
  ),
  new ModuleInfo(
    'compare-date-gt',
    'compare-date-gt(P1, P2) → P ',
    'Output the span associated with the later date.',
  ),
  new ModuleInfo(
    'year-diff',
    'year-diff(P1, P2) → TY',
    'Difference between the years associated with the paragraph spans.',
  ),
];
