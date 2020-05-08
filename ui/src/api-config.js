/**
 * @deprecated
 *
 * In local development environments we used to run the API and UI on separate ports. This caused
 * us to do some fancy port juggling in local environments as to determine where to send a request.
 * In production we don't need to do this, as a reverse proxy is responsible for routing things
 * to the right place.
 *
 * We now use a reverse proxy to do the same locally, so the port acrobatics are no longer necessary.
 * That said this value is referenced in a lot of places, so for now we tread softly by merely
 * exporting an empty string. As we refactor the UI we should gradually phase out usage of this.
 */
export const API_ROOT = '';
