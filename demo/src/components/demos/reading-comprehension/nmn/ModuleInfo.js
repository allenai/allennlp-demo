import { getHighlightColor } from '../../../highlight/NestedHighlight';

/**
 * Metadata about a single NMN module.
 */
export class ModuleInfo {
  /**
   * @param {string} name
   * @param {string} signature
   * @param {string} description
   * @param {string} color
   */
  constructor(name, signature, description, color) {
    this.name = name;
    this.signature = signature;
    this.description = description;
    this.color = color;
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
    'For text spans in the question, find similar text spans in the passage.',
    getHighlightColor(0)
  ),
  new ModuleInfo(
    'filter',
    'filter(Q, P) → P',
    'Based on the question, select a subset of spans from the input.',
    getHighlightColor(1)
  ),
  new ModuleInfo(
    'relocate',
    'relocate(Q, P) → P',
    'Find spans in the passage related to an argument in the question.',
    getHighlightColor(2)
  ),
  new ModuleInfo(
    'find-num',
    'find-num(P) → N',
    'Find the number(s) associated to the input paragraph spans.',
    getHighlightColor(3)
  ),
  new ModuleInfo(
    'find-date',
    'find-date(P) → D',
    'Find the date(s) associated to the input paragraph spans.',
    getHighlightColor(4)
  ),
  new ModuleInfo(
    'count',
    'count(P) → C',
    'Count the number of input passage spans.',
    getHighlightColor(5)
  ),
  new ModuleInfo(
    'compare-num-lt',
    'compare-num-lt(P1, P2) → P ',
    'Output the span associated with the smaller number.',
    getHighlightColor(6)
  ),
  new ModuleInfo(
    'date-diff',
    'date-diff(P1, P2) → TD',
    'Difference between the dates associated with the paragraph spans.',
    getHighlightColor(7)
  ),
  new ModuleInfo(
    'find-max-num',
    'find-max-num(P) → P',
    'Select the text span in the passage with the largest number.',
    getHighlightColor(8)
  ),
  new ModuleInfo(
    'find-min-num',
    'find-min-num(P) → P',
    'Select the text span in the passage with the smallest number.',
    getHighlightColor(9)
  ),
  new ModuleInfo(
    'span',
    'span(P) → S',
    'Identify a contiguous span from the attended tokens.',
    getHighlightColor(10)
  )
];
