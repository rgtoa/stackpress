//stackpress
import type { UnknownNest, StatusResponse } from '@stackpress/lib/types';
import type Engine from '@stackpress/inquire/Engine';
//root
import Exception from '../../Exception.js';
//schema
import type Model from '../../schema/spec/Model.js';
//sql
import { toErrorResponse } from '../helpers.js';
//local
import search from './search.js';

/**
 * Returns a database table row
 */
export default async function detail<M extends UnknownNest = UnknownNest>(
  model: Model, 
  engine: Engine,
  ids: Record<string, string|number>,
  columns = [ '*' ],
  seed?: string
): Promise<StatusResponse<M|null>> {
  const filter = Object.fromEntries(
    model.ids.map(column => [ 
      column.name, 
      ids[column.name] 
    ])
  );
  if (model.active) {
    filter[model.active.name] = -1;
  }
  const response = await search<M>(
    model, 
    engine, 
    { columns, filter, take: 1 }, 
    seed
  );
  //if error
  if (response.code !== 200) {
    return response as unknown as StatusResponse<M>;
  //if no results
  } else if (!response.results?.[0]) {
    return toErrorResponse(
      Exception.for('Not Found').withCode(404)
    ) as StatusResponse<M>;
  }
  //@ts-ignore - Property 'results' does not exist on type 'ErrorResponse'.
  response.results = response.results[0];
  return response as unknown as StatusResponse<M>;
};