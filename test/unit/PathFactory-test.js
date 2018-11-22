import PathFactory from '../../src/PathFactory';
import context from '../context';

describe('the PathFactory class', () => {
  it('exposes the defaultHandlers', () => {
    expect(PathFactory.defaultHandlers).toBeInstanceOf(Object);
    expect(PathFactory.defaultHandlers).toHaveProperty('then');
    expect(PathFactory.defaultHandlers).toHaveProperty('pathExpression');
    expect(PathFactory.defaultHandlers).toHaveProperty('sparql');
  });
});

describe('a PathFactory instance without parameters', () => {
  let factory;
  beforeAll(() => factory = new PathFactory());

  it('adds __esModule', () => {
    expect(factory.create().__esModule).toBeUndefined();
  });

  it('adds ExecuteQueryHandler for single values', () => {
    expect(factory.create().then).toBeInstanceOf(Function);
  });

  it('adds ExecuteQueryHandler for asynchronous iteration', () => {
    expect(factory.create()[Symbol.asyncIterator]).toBeInstanceOf(Function);
  });

  it('adds PathExpressionHandler', async () => {
    await expect(factory.create().pathExpression).rejects.toThrow(/root subject/);
  });

  it('adds SparqlHandler', async () => {
    await expect(factory.create().sparql).rejects.toThrow(/root subject/);
  });


  it('does not add a JSONLDResolver', () => {
    expect(factory.create({}).other).toBeUndefined();
  });
});

describe('a PathFactory instance without empty handlers and resolvers', () => {
  let factory;
  beforeAll(() => factory = new PathFactory({ handlers: {}, resolvers: [] }));

  it('does not add a SparqlHandler', () => {
    expect(factory.create().sparql).toBeUndefined();
  });

  it('does not add a JSONLDResolver', () => {
    expect(factory.create().other).toBeUndefined();
  });
});

describe('a PathFactory instance with initial settings and data', () => {
  let factory;
  beforeAll(() => factory = new PathFactory({
    foo: 'bar',
    handlers: {
      internal: { execute: pathProxy => pathProxy },
    },
  }, {
    a: 1,
  }));

  describe('creating path without parameters', () => {
    let path;
    beforeAll(() => (path = factory.create()));

    it('passes the settings', () => {
      expect(path.internal.settings).toEqual({ foo: 'bar' });
    });

    it('passes the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
    });
  });

  describe('creating path with data', () => {
    let path;
    beforeAll(() => (path = factory.create({ b: 2 })));

    it('passes the settings', () => {
      expect(path.internal.settings).toEqual({ foo: 'bar' });
    });

    it('extends the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
      expect(path.internal).toHaveProperty('b', 2);
    });
  });

  describe('creating path with data and settings', () => {
    let path;
    beforeAll(() => (path = factory.create({ other: 'x' }, { b: 2 })));

    it('extends the settings', () => {
      expect(path.internal.settings).toEqual({ foo: 'bar', other: 'x' });
    });

    it('extends the data', () => {
      expect(path.internal).toHaveProperty('a', 1);
      expect(path.internal).toHaveProperty('b', 2);
    });
  });
});

describe('a PathFactory instance with functions as handlers and resolvers', () => {
  let factory;
  beforeAll(() => factory = new PathFactory({
    handlers: {
      foo: () => 'foo',
    },
    resolvers: [
      () => 'bar',
      { supports: () => true, resolve: () => 'baz' },
    ],
  }));

  it('creates a handler', () => {
    expect(factory.create().foo).toBe('foo');
  });

  it('creates a catch-all resolver', () => {
    expect(factory.create().other).toBe('bar');
  });
});

describe('a PathFactory instance with a context parameter', () => {
  let factory;
  beforeAll(() => factory = new PathFactory({ context }));

  it('adds __esModule', () => {
    expect(factory.create().__esModule).toBeUndefined();
  });

  it('adds a JSONLDResolver', () => {
    expect(factory.create().knows).toBeInstanceOf(Object);
  });
});
