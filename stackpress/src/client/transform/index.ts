//modules
import { VariableDeclarationKind } from 'ts-morph';
//root
import type { IdeaPluginWithProject } from '../../types/index.js';
//schema
import Registry from '../../schema/Registry.js';
//local
import generateConfig from './config.js';
import generatePackage from './package.js';

/**
 * Client File Structure
 * - profile/
 * | - actions/
 * | | - batch.ts
 * | | - create.ts
 * | | - detail.ts
 * | | - get.ts
 * | | - index.ts
 * | | - remove.ts
 * | | - restore.ts
 * | | - search.ts
 * | | - update.ts
 * | | - upsert.ts
 * | - admin/
 * | | - pages/
 * | | | - create.ts
 * | | | - detail.ts
 * | | | - remove.ts
 * | | | - restore.ts
 * | | | - search.ts
 * | | | - update.ts
 * | | - templates/
 * | | | - create.ink
 * | | | - detail.ink
 * | | | - remove.ink
 * | | | - restore.ink
 * | | | - search.ink
 * | | | - update.ink
 * | | - routes.ts
 * | - components/
 * | | - filter.ink
 * | | - form.ink
 * | | - table.ink
 * | | - view.ink
 * | - events/
 * | | - batch.ts
 * | | - create.ts
 * | | - detail.ts
 * | | - get.ts
 * | | - index.ts
 * | | - remove.ts
 * | | - restore.ts
 * | | - search.ts
 * | | - update.ts
 * | | - upsert.ts
 * | - tests/
 * | | - actions.ts
 * | | - events.ts
 * | | - index.ts
 * | - config.ts
 * | - index.ts
 * | - schema.ts
 * | - types.ts
 * - address/
 * | - config.ts
 * | - index.ts
 * | - types.ts
 * - admin.ts
 * - config.ts
 * - enums.ts
 * - index.ts
 * - schema.ts
 * - store.ts
 * - tests.ts
 * - types.ts
 */

/**
 * Client File Structure
 * - profile/
 * | - config.ts
 * | - index.ts
 * - address/
 * | - config.ts
 * | - index.ts
 * - config.json
 * - index.ts
 * - registry.ts
 */

/**
 * This is the The params comes form the cli
 */
export default function generate(props: IdeaPluginWithProject) {
  //-----------------------------//
  // 1. Config
  //extract props
  const { cli, schema, project } = props;
  const registry = new Registry(schema);
  
  //-----------------------------//
  // 2. Generators
  // - profile/config.ts
  // - address/config.ts
  // - config.ts
  generateConfig(project, schema, registry, cli.server);
  // - package.json
  generatePackage(project, schema, cli.server);

  //-----------------------------//
  // 3. profile/index.ts
  for (const model of registry.model.values()) {
    const filepath = `${model.name}/index.ts`;
    //load profile/index.ts if it exists, if not create it
    const source = project.getSourceFile(filepath) 
      || project.createSourceFile(filepath, '', { overwrite: true });
    //import config from './config.js';
    source.addImportDeclaration({
      moduleSpecifier: './config.js',
      defaultImport: 'config'
    });
    //export { config };
    source.addExportDeclaration({ namedExports: [ 'config' ] });
  }
  
  //-----------------------------//
  // 4. address/index.ts
  for (const fieldset of registry.fieldset.values()) {
    const filepath = `${fieldset.name}/index.ts`;
    //load profile/index.ts if it exists, if not create it
    const source = project.getSourceFile(filepath) 
      || project.createSourceFile(filepath, '', { overwrite: true });
    //import config from './config.js';
    source.addImportDeclaration({
      moduleSpecifier: './config.js',
      defaultImport: 'config'
    });
    //export { config };
    source.addExportDeclaration({ namedExports: [ 'config' ] });
  }
  
  //-----------------------------//
  // 5. index.ts
  //load index.ts if it exists, if not create it
  const source = project.getSourceFile('index.ts') 
    || project.createSourceFile('index.ts', '', { overwrite: true });
  //import config from './config.js';
  source.addImportDeclaration({ 
    moduleSpecifier: './config.js', 
    defaultImport: 'registry',
    namedImports: [ 'config' ] 
  });
  //import * as modelProfile from './Profile/index.js';
  for (const model of registry.model.values()) {
    source.addImportDeclaration({
      moduleSpecifier: `./${model.name}/index.js`,
      defaultImport: `* as model${model.title}`
    });
  }
  //import * as fieldsetAddress from './Profile/index.js';
  for (const fieldset of registry.fieldset.values()) {
    source.addImportDeclaration({
      moduleSpecifier: `./${fieldset.name}/index.js`,
      defaultImport: `* as fieldset${fieldset.title}`
    });
  }
  //export { config, registry };
  source.addExportDeclaration({ 
    namedExports: [ 'config', 'registry' ] 
  });
  //export const model = {}
  //export const fieldset = {}
  source.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
      name: 'model',
      initializer: `{
        ${Array.from(registry.model.values()).map(
          model => `${model.camel}: model${model.title}`
        ).join(',\n')}
      }`
    }, {
      name: 'fieldset',
      initializer: `{
        ${Array.from(registry.fieldset.values()).map(
          fieldset => `${fieldset.camel}: fieldset${fieldset.title}`
        ).join(',\n')}
      }`
    }]
  });
}