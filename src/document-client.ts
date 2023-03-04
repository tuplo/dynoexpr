/* eslint-disable class-methods-use-this */
let AwsSdk: unknown = null;

export class AwsSdkDocumentClient {
	static setDocumentClient(clientAwsSdk: unknown) {
		AwsSdk = clientAwsSdk;
	}

	createSet(
		list: unknown[] | Record<string, unknown>,
		options?: Record<string, unknown>
	) {
		if (!AwsSdk) {
			throw Error(
				"dynoexpr: When working with Sets, please provide the AWS DocumentClient (v2)."
			);
		}

		// @ts-expect-error Property 'prototype' does not exist on type '{}'.
		return AwsSdk.prototype.createSet(list, options);
	}
}
