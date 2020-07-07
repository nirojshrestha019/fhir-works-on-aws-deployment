import { Operation } from './constants';

export function chunkArray(myArray: any[], chunkSize: number): any[][] {
    const results = [];

    while (myArray.length) {
        results.push(myArray.splice(0, chunkSize));
    }

    return results;
}

export function clone(item: any) {
    return JSON.parse(JSON.stringify(item));
}

export function cleanAuthHeader(authorizationHeader?: string): string {
    let token = authorizationHeader || '';
    if (token.substr(0, 'Bearer '.length) === 'Bearer ') {
        token = token.substr('Bearer '.length);
    }
    return token;
}

/**
 * Removes the starting '/' and the ending '?'
 * ex: /Patient?name=Joe -> Patient
 */
function cleanUrlPath(urlPath: string): string {
    let path = urlPath;
    if (urlPath.indexOf('/') === 0) {
        path = urlPath.substr(1);
    }
    return path.split('?')[0];
}

export function getRequestInformation(
    verb: string,
    urlPath: string,
): {
    operation: Operation;
    resourceType?: string;
    id?: string;
    vid?: string;
} {
    const path = cleanUrlPath(urlPath);
    const urlSplit = path.split('/');
    switch (verb) {
        case 'PUT': {
            return {
                operation: 'update',
                resourceType: urlSplit[0],
                id: urlSplit[1],
            };
        }
        case 'PATCH': {
            return {
                operation: 'patch',
                resourceType: urlSplit[0],
                id: urlSplit[1],
            };
        }
        case 'DELETE': {
            return {
                operation: 'delete',
                resourceType: urlSplit[0],
                id: urlSplit[1],
            };
        }
        case 'GET': {
            if (urlSplit[urlSplit.length - 1].startsWith('_history')) {
                // if the last section of the url string starts with history
                if (urlSplit[0].startsWith('_history')) {
                    // '_history' is at root or url
                    return { operation: 'history' };
                }
                return { operation: 'type-history', resourceType: urlSplit[0], id: urlSplit[1] };
            }
            if (path.includes('_history/'))
                return { operation: 'vread', resourceType: urlSplit[0], id: urlSplit[1], vid: urlSplit[3] };
            // For a generic read it has to be [type]/[id]
            if (urlSplit.length === 2) return { operation: 'read', resourceType: urlSplit[0], id: urlSplit[1] };
            if (path.length === 0) return { operation: 'search' };
            return { operation: 'type-search', resourceType: urlSplit[0] };
        }
        case 'POST': {
            if (path.includes('_search')) {
                if (urlSplit[0] === '_search') {
                    return { operation: 'search' };
                }
                return { operation: 'type-search', resourceType: urlSplit[0] };
            }
            if (path.length === 0) return { operation: 'bundle' };
            return { operation: 'create', resourceType: urlSplit[0] };
        }
        default: {
            throw new Error('Unable to parse the http verb');
        }
    }
}
