const { Level } = require('level');

async function createDatabase(name) {
  return new Level(name, { valueEncoding: 'json' });
}

async function addEntry(db, key, value) {
  await db.put(key, value);
  console.log(`Added entry: key = ${key}, value = ${value}`);
}

async function addMultipleEntries(db, entries) {
  await db.batch(entries);
  console.log('Added multiple entries:', entries);
}

async function getEntry(db, key) {
  const value = await db.get(key);
  console.log(`Retrieved entry: key = ${key}, value = ${value}`);
  return value;
}

async function iterateEntries(db, options) {
  console.log('Iterating entries with options:', options);
  for await (const [key, value] of db.iterator(options)) {
    console.log(`key = ${key}, value = ${value}`);
  }
}








// (async () => {
//   const dbName = 'example';
//   const db = await createDatabase(dbName);

//   try {
//     // Add an entry with key 'a' and value 1
//     await addEntry(db, 'a', 1);

//     // Add multiple entries
//     await addMultipleEntries(db, [
//       { type: 'put', key: 'b', value: 2 },
//       { type: 'put', key: 'c', value: 3 }
//     ]);

//     // Get value of key 'a'
//     await getEntry(db, 'a');

//     // Iterate entries with keys that are greater than 'a'
//     await iterateEntries(db, { gt: 'a' });
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }

//   // Close the database
//   await db.close();
// })();


export { createDatabase, addEntry, addMultipleEntries, getEntry, iterateEntries };