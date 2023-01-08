import "zx/globals";

async function main() {
	await $`rm -rf ./node_modules/.cache`;
	await $`rm -rf coverage/`;
	await $`rm -rf .nyc_output/`;

	await $`NODE_ENV=test LOG_LEVEL=silent nyc yarn test:ci --coverage true --coverageReporters lcov`;
}

main();
