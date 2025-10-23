import * as moduleAlias from 'module-alias';
import * as path from 'path';

moduleAlias.addAliases({
    '@': path.join(__dirname, '../src/')
});
