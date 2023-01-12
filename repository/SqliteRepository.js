import sqlite3 from 'sqlite3';
import fs from 'fs';
import { open } from 'sqlite';

const defaultUrl = './db/world.db';
const defaultSchema = './db/schema/myworld_schema.sql';
const defaultData = './db/schema/myworld_data.sql';

const TAG = `SqliteRepository`;

export default class SqliteRepository {
  /**
   * Creates an instance of the CountryRepository class.
   * @param {String} url The connection string for the database.
   */
  constructor(url) {
    this.url = url || defaultUrl;
  }

  /**
   * Opens a connection to the datbase.
   * @param {String} url The connection string for the database.
   * @returns {Promise} promise containing the internal database connection.
   */
  async _connect(url) {
    //console.debug(`${ TAG }._connect(${ JSON.stringify(url) })`);

    return open({
      filename: url || this.url || defaultUrl,
      driver: sqlite3.Database
    }).then((db) => {
      //console.log('Connected to the world database.');
      return db;
    });
  }

  /**
   * Queries or retrieves data from the underlying database.
   * @param {String} sql The SQL statement to execute.
   * @param {Array.Object} params The optional parameters for the statement.
   * @param {Function} rowmapper The optional function to execute to serialized a row.
   * @returns The serialized results from the query. If query returns no data, then an empty array is returned.
   */
  async query(sql, params, rowmapper) {
    //console.debug(`${ TAG }.query(${ JSON.stringify(sql) }, ${ JSON.stringify((typeof(parameters) === 'function') ? [] : parameters ) })`);

    if (! sql) {
      return;
    }

    if (typeof(params) === 'function') {
      rowmapper = params;
      params = [];
    }

    const db = await this._connect();
    try {
      const results = await db.all(sql, params);
      await this._close(db);

      if (rowmapper) {
        let previous = null;
        return results.map((row,index) => {
          let data = rowmapper(row,previous,index);
          previous = data;
          return data;
        });
      }
      return results;
    } catch(err) {
      console.log(`[ERROR] SQL: ${ sql }`);
      console.error(`[ERROR] ${ JSON.stringify(err) }`);
      await this._close(db);
      throw err;
    }
  }

  /**
   * Executes the specified SQL statement.
   * @param {String} sql The SQL statement.
   * @param {Array.Object} params The optional parameters for the statement.
   * @returns {Integer} The SQLLite result code.
   */
  async #execute(sql, params) {
    console.debug(`${ TAG }.execute(${ JSON.stringify(sql) }, ${ JSON.stringify(params) })`);

    if (! sql) {
      return;
    }

    const db = await this._connect();
    try {
      const result = await db.exec(sql, params);
      await this._close(db);

      return result;
    } catch(err) {
      console.log(`[ERROR] SQL: ${ sql }`);
      console.error(`[ERROR] ${ JSON.stringify(err) }`);
      await this._close(db);
      throw err;
    }
  }

  /**
   * Executes the specified SQL statement.
   * @param {String} sql The SQL statement.
   * @param {Array.Object} params The optional parameters for the statement.
   * @returns {Integer} The SQLLite result code.
   */
  async execute(sql, params) {
    //console.debug(`${ TAG }.execute(${ JSON.stringify(sql) }, ${ JSON.stringify(params) })`);

    if (! sql) {
      return;
    }

    const db = await this._connect();
    try {
      let changes = 0;
      await db.exec("BEGIN TRANSACTION");
      const statements = sql.split(';')
                            .map((statement) => (statement || '').trim())
                            .filter((statement) => statement);
      statements.forEach(async (statement,index) => {
        if ((statement || '').trim()) {
          if (statements.length > 1) {
            //console.debug(` - [${ index }] ${ statement };`);
          }
          const result = await db.run(statement, params);
          changes += (result || {}).changes || 0;
        }
      });
      await db.exec("COMMIT");
      await this._close(db);

      return (changes);
    } catch(err) {
      console.log(`[ERROR] SQL: ${ sql }`);
      console.error(`[ERROR] ${ JSON.stringify(err) }`);
      await this._close(db);
      throw err;
    }
  }

  /**
   * Initializes a fresh / clean copy of the database.
   */
  async initialize() {
    console.debug(`${ TAG }.initialize()`);

    var schema = await fs.readFileSync(defaultSchema, 'utf8');
    await this.#execute(schema);
    console.info(' - Loaded world schema from file...');
    
    var data = await fs.readFileSync(defaultData, 'utf8');
    await this.#execute(data);
    console.info(' - Loaded world / default data from file.');
  }

  /**
   * Closes the connection to the database'
   * @param {Database} db The database connection
   */
  async _close(db) {
    //console.debug(`${ TAG }._close(${ JSON.stringify(db) })`);

    if (db) {
      try {
        await db.close();
        //console.log('Closed the database connection.');
      } catch(e) {
        //console.error(`Failed closing database connection. ${ JSON.stringify(e) }`);
      }
    }
  }  
};