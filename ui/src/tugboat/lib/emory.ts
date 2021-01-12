/**
 * Emory is a Skiff hosted key-value store that's exposed via a public HTTP API.
 *
 * See: https://github.com/allenai/emory
 */
export namespace emory {
    type AppId = string;
    type DocId = string;
    type Doc = {};

    interface AppDoc {
        app: AppId;
        doc: Doc;
    }

    const origin = 'https://emory.apps.allenai.org';

    /**
     * Creates a document and returns the resulting id.
     */
    export function createDoc(app: AppId, doc: Doc): Promise<DocId> {
        const body: AppDoc = { app, doc };
        return fetch(`${origin}/api/v1/document/`, {
            method: 'POST',
            body: JSON.stringify(body),
        }).then((r) => r.text());
    }

    /**
     * Retrieves a document by it's id.
     */
    export function getDoc(id: DocId): Promise<Doc> {
        return fetch(`${origin}/d/${id}`)
            .then((r) => r.json())
            .then((d: AppDoc) => d.doc);
    }
}
