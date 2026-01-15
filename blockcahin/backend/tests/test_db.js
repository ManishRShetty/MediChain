const { Level } = require('level');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

// Import the functions from your main file if they were exported
// For this example, we'll define them here directly for simplicity
async function createDatabase(name) {
  return new Level(name, { valueEncoding: 'json' });
}

async function addEntry(db, key, value) {
  await db.put(key, value);
}

async function addMultipleEntries(db, entries) {
  await db.batch(entries);
}

async function getEntry(db, key) {
  return await db.get(key);
}

async function iterateEntries(db, options) {
  const result = [];
  for await (const [key, value] of db.iterator(options)) {
    result.push({ key, value });
  }
  return result;
}

// Path to the test database directory
const testDbPath = path.join(__dirname, 'testdb');

// Cleanup test database before and after tests
beforeEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath, { recursive: true, force: true });
  }
});

afterEach(() => {
  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath, { recursive: true, force: true });
  }
});

describe('LevelDB Functions', function () {
  let db;

  beforeEach(async function () {
    db = await createDatabase(testDbPath);
  });

  afterEach(async function () {
    await db.close();
  });

  it('should add and retrieve an entry', async function () {
    await addEntry(db, 'a', 1);
    const value = await getEntry(db, 'a');
    expect(value).to.equal(1);
  });

  it('should add multiple entries', async function () {
    const entries = [
      { type: 'put', key: 'b', value: 2 },
      { type: 'put', key: 'c', value: 3 }
    ];
    await addMultipleEntries(db, entries);
    const valueB = await getEntry(db, 'b');
    const valueC = await getEntry(db, 'c');
    expect(valueB).to.equal(2);
    expect(valueC).to.equal(3);
  });

  it('should iterate over entries', async function () {
    await addEntry(db, 'a', 1);
    await addEntry(db, 'b', 2);
    await addEntry(db, 'c', 3);
    const results = await iterateEntries(db, { gt: 'a' });
    expect(results).to.deep.equal([
      { key: 'b', value: 2 },
      { key: 'c', value: 3 }
    ]);
  });
});
