import axios from 'axios';

const MAX_PAGE_SIZE = 1000; // The Graph max page size

interface PageResultsProps {
	api: string;
	query: {
		entity: string;
		selection?: any;
		properties?: string[];
	};
	timeout?: number;
	max?: number;
}

/**
 * Page results from The Graph protocol
 *
 * @param {string} api - The API address
 * @param {Object} query - The Query object
 * @param {string} query.entity - The entity name
 * @param {Object} query.selection - The selection mapping object for GraphQL filters and sorts
 * @param {Object} query.properties - The list of fields to include in the output
 * @param {number} timeout - Number of ms timeout for any single graph paging result (default: 10seconds)
 * @param {number} max - Maximum number of results to return (default: Infinity)
 */
const pageResults = ({
	api,
	query: { entity, selection = {}, properties = [] },
	timeout = 10e3,
	max = Infinity,
}: PageResultsProps) => {
	max = Number(max);
	const pageSize = MAX_PAGE_SIZE;

	// Note: this approach will call each page in linear order, ensuring it stops as soon as all results
	// are fetched. This could be sped up with a number of requests done in parallel, stopping as soon as any return
	// empty. - JJM
	const runner = ({ skip }: { skip: number }): any => {
		const propToString = (obj: any): string =>
			Object.entries(obj)
				.filter(([, value]) => typeof value !== 'undefined')
				.map(
					([key, value]) =>
						`${key}:${typeof value === 'object' ? '{' + propToString(value) + '}' : value}`
				)
				.join(',');

		const first = skip + pageSize > max ? max % pageSize : pageSize;

		// mix the page size and skip fields into the selection object
		const selectionObj = Object.assign({}, selection, {
			first,
			skip,
		});

		const data = `{"query":"{${entity}(${propToString(selectionObj)}){${properties.join(
			','
		)}}}", "variables": null}`;

		// support query logging in nodejs
		if (typeof process === 'object' && process.env.DEBUG === 'true') {
			console.log(data);
		}

		return axios(api, {
			method: 'POST',
			data,
			timeout,
		})
			.then((response: any) => response.data)
			.then((json: any) => {
				if (json.errors) {
					throw Error(JSON.stringify(json.errors));
				}
				const {
					data: { [entity]: results },
				} = json;

				// stop if we are on the last page
				if (results.length < pageSize || Math.min(max, skip + results.length) >= max) {
					return results;
				}

				return runner({ skip: skip + pageSize }).then((newResults: any) =>
					results.concat(newResults)
				);
			});
	};

	return runner({ skip: 0 });
};

export default pageResults;
