import "zx/globals";

async function main() {
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
