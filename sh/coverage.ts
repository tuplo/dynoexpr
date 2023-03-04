import "zx/globals";

async function main() {
	await $`rm -rf ./node_modules/.cache`;
	await $`rm -rf coverage/`;
	await $`rm -rf .nyc_output/`;

	const flags = ["--coverage true"].flatMap((f) => f.split(" "));
	await $`NODE_ENV=test LOG_LEVEL=silent nyc yarn test:ci ${flags}`;
}

main();
