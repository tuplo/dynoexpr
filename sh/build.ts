import "zx/globals";

async function main() {
	await $`rm -rf dist`;
	await $`rm -rf cjs`;
	await $`tsc --build tsconfig.build.json`;

	await $`esbuild src/cjs/index.cjs --bundle --platform=node --outfile=dist/index.cjs --external:aws-sdk`;

	await $`esbuild src/index.ts --bundle --platform=node --format=esm --outfile=dist/index.mjs --external:aws-sdk`;

	// node12 compatibility
	await $`mkdir cjs`;
	await $`cp dist/index.cjs cjs/index.js`;

	await $`cp src/dynoexpr.d.ts dist/dynoexpr.d.ts`;
}

main();
