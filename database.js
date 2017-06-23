/* @flow */
/*
 * You may redistribute this program and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';


/*::const ConfigType = require('./config.example.js');*/
module.exports.create = (config /*:typeof(ConfigType)*/) => {
    config.databaseType = config.databaseType || 'postgres';
    switch (config.databaseType) {
        case 'postgres':
            return require('./database_postgres').create(config);
        case 'inmemory':
            return require('./database_inmemory').create(config);
        default:
            throw new Error('Invalid database type.');

    }
};
