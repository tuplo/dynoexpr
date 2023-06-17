import * as shell from "@tuplo/shell";

async function main() {
	const $ = shell.$({ verbose: true });

	const flags = [
		"--bundle",
		"--watch",
		"--format=esm",
		"--platform=node",
		"--outfile=dist/index.js",
		"--external:aws-sdk",
	];

	await $`esbuild src/index.ts ${flags}`;
}

main();
