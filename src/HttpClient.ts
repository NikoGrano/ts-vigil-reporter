/**
 *
 * Typescript Vigil Reporter — NOTICE OF LICENSE
 * This source file is released under MIT license by copyright holders.
 * Please see LICENSE file for more specific licensing terms.
 * @author Niko Granö <niko@granö.fi>
 *
 */

import http from 'http';
import https from 'https';
import Options from "./Options";

interface Client {
    request(options: http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
}

export default class HttpClient {
    private readonly client: Client;
    private readonly args: http.RequestOptions;
    private readonly postPath: string;
    private readonly deletePath: string;
    private readonly debug: boolean;
    private readonly defaultHeaders: object = {
        'Content-Type': 'application/json; charset=urf-8',
        'User-Agent': 'Vigil-TS-Reporter/1.0'
    };


    constructor(options: Options) {
        let url = new URL(options.url);
        this.debug = options.debug;
        this.client = (url.protocol === 'https:' ? http : https);
        this.args = {
            host: url.host,
            port: url.port || url.protocol === 'https:' ? 443 : 80,
            auth: (':'+options.token),
            timeout: options.timeout,
            headers: { ...this.defaultHeaders, ...options.headers}
        };
        const probe = encodeURIComponent(options.probe);
        const node = encodeURIComponent(options.node)
        const replica = encodeURIComponent(options.replica)
        this.postPath = ("/reporter/" + probe + '/' + node + '/');
        this.deletePath = ("/reporter/" + probe + '/' + node + '/' + replica + '/');
    }

    public post(payload: string, next: (status: boolean) => void): void {
        let args = this.args;
        args.path = this.postPath;
        args.method = 'POST';
        args.headers['Content-Length'] = Buffer.byteLength(payload);
        this.request(args, next, payload);
    }

    public delete(next: (status: boolean) => void): void {
        let args = this.args;
        args.path = this.deletePath;
        args.method = 'DELETE';
        this.request(args, next);
    }

    private request(options: http.RequestOptions, next: (r: boolean) => void, payload?: string,): void {
        const request = this.client.request(options, (r) => {
            r.setEncoding('utf-8');
            if(r.statusCode === 200) {
                this.log('Request succeeded.');
                return next(true);
            }

            this.log('Request failed: ' + r.statusCode);
            return next(false);
        });

        request.on('timeout', () => {
            this.log('Request timed out!');
            request.destroy();
            return next(false);
        });

        request.on('abort', () => {
            this.log('Request aborted!');
            return next(false);
        });

        request.on('error', (e) => {
            this.log('Request error: '+ e);
            return next(false);
        });

        request.on('close', () => {
            this.log('Request closed.');
            return next(true);
        })

        if (options.method === 'POST' && payload !== undefined) {
            request.write(payload);
        }
        request.end();
    }

    private log(msg: string): void {
        if (this.debug) {
            console.log('Vigil DEBUG: '+ msg);
        }
    }
}
