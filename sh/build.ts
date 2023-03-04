import "zx/globals";

async function main() {
	await $`rm -rf dist`;
	await $`tsc --project tsconfig.build.json`;

	const flags = ["--bundle", "--platform=node"];

	await $`esbuild src/index.ts --outfile=dist/index.cjs ${flags}`;
	await $`esbuild src/index.ts --format=esm --outfile=dist/index.mjs ${flags}`;

	await $`cp src/dynoexpr.d.ts dist/dynoexpr.d.ts`;
}

main();
