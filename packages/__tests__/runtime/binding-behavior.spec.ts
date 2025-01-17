import { DI, IContainer } from '@aurelia/kernel';
import { bindingBehavior, BindingBehaviorResource } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe(`@bindingBehavior('foo')`, function () {
  let container: IContainer;

  beforeEach(function () {
    container = DI.createContainer();
  });

  // @ts-ignore
  @bindingBehavior('foo')
  class FooBindingBehavior { }

  it(`should define the binding behavior`, function () {
    assert.strictEqual(FooBindingBehavior['kind'], BindingBehaviorResource, `FooBindingBehavior['kind']`);
    assert.strictEqual(FooBindingBehavior['description'].name, 'foo', `FooBindingBehavior['description'].name`);
    FooBindingBehavior['register'](container);
    const instance = container.get(BindingBehaviorResource.keyFrom('foo'));
    assert.instanceOf(instance, FooBindingBehavior, `instance`);
  });

});
