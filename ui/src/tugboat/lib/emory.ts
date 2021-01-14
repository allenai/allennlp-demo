/**
 * Emory is a Skiff hosted key-value store that's exposed via a public HTTP API.
 *
 * See: https://github.com/allenai/emory
 */
export namespace emory {
    type AppId = string;
    type DocId = string;
    type Doc = {};

    interface Entry {
        app: AppId;
        type?: string;
        doc: Doc;
    }

    /**
     * Emory returns a URL path when an item is created, i.e. `/d/:id`. We strip `/d/` so that
     * the caller only gets the id back.
     */
    function removePrefix(url: string): DocId {
        return url.replace(/^\/d\//, '');
    }

    const origin = 'https://emory.apps.allenai.org';

    /**
     * Creates a document and returns the resulting id.
     */
    export function createDoc(entry: Entry): Promise<DocId> {
        return fetch(`${origin}/api/v1/document/`, {
            method: 'POST',
            body: JSON.stringify(entry),
        })
            .then((r) => r.text())
            .then((url) => removePrefix(url));
    }

    /**
     * Retrieves a document by it's id.
     */
    export function getDoc(id: DocId): Promise<Entry> {
        return fetch(`${origin}/d/${id}`).then((r) => r.json());
    }
}
