import { Aurelia, CustomElementResource, IViewModel } from '@aurelia/runtime';
import { TestContext, HTMLTestContext, hJsx, assert } from '@aurelia/testing';

// IMPORTANT:
//      JSX is used to eliminate space between tags so test result can be easier to manually constructed
//      if template string can be used to achieve the same effect, it could be converted back

describe.skip('replaceable', function () {

  describe('Difficult cases', function() {
    describe('+ scope altering template controllers', function() {
      describe('+ [repeat]', function() {
        const testCases: [string, HTMLElement, HTMLElement, ITestItem[], string, ICustomAssertion?][] = [
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace #0'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.replacement of 1-item-1.`
          ],
          // Same with previous, though [repeat] + [replaceable] are on same element
          [
            [
              '[repeat] [replaceable #0] << replace #0'
            ].join('\n'),
            <div repeat$for="item of items" replaceable part="p0">{'${item.name}'}</div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.replacement of 1-item-1.`
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace #0',
              '    [replaceable #1]'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.replacement of 1-item-1.`
          ],
          // Same with previous, though [repeat] + [replaceable] are on same element
          [
            [
              '[repeat] [replaceable #0] << replace #0',
              '  [replaceable #1]'
            ].join('\n'),
            <div repeat$for="item of items" replaceable part="p0">
              {'${item.name}'}
              <div replaceable part="p1">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            `replacement of 0-item-0.replacement of 1-item-1.`
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}'}
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0replacement of 0-item-0.item-1replacement of 1-item-1.'
          ],
          [
            [
              '[replaceable #0]',
              '  [repeat]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div replaceable part="p0">
              item-0.
              <div repeat$for="item of items">
                <div replaceable part="p1">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.replacement of 1-item-1.'
          ],
          [
            [
              '[replaceable #0]',
              '  [repeat]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div replaceable part="p0">
              item-0.
              <div repeat$for="item of items" replaceable part="p1">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.replacement of 1-item-1.'
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace #0',
              '[repeat]',
              '  [replaceable #0] << replace #0'
            ].join('\n'),
            <div>
              <div repeat$for="item of items">
                <div replaceable part="p0">{'${item.name}'}</div>
              </div>
              <div repeat$for="item of items">
                <div replaceable part="p0">{'${item.name}'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'replacement of 0-item-0.replacement of 1-item-1.replacement of 0-item-0.replacement of 1-item-1.'
          ],
          // Same with previous. Though [repeat] + [replaceable] are on same element
          [
            [
              '[repeat] [replaceable #0] << replace #0',
              '[repeat] [replaceable #0] << replace #0'
            ].join('\n'),
            <div>
              <div repeat$for="item of items" replaceable part="p0">{'${item.name}'}</div>
              <div repeat$for="item of items" replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'replacement of 0-item-0.replacement of 1-item-1.replacement of 0-item-0.replacement of 1-item-1.'
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0]',
              '    [replaceable #1] << replace #1',
              '  [replaceable #0]',
              '    [replaceable #1] << replace #1'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">
                {'${item.name}.'}
                <div replaceable part="p1">{'${item.name}.'}</div>
              </div>
              <div replaceable part="p0">
                {'${item.name}.'}
                <div replaceable part="p1">{'${item.name}.'}</div>
              </div>
            </div>,
            <foo>
              <template replace-part="p1">replacement of {'${item.idx}-${item.name}.'}</template>
            </foo>,
            createItems(2),
            'item-0.replacement of 0-item-0.item-0.replacement of 0-item-0.item-1.replacement of 1-item-1.item-1.replacement of 1-item-1.'
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              '  [${}] <-- by interpolation binding from consumer'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.1-item-1 Message: Aurelia.`,
            async (host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              await Promise.resolve();
              assert.strictEqual(
                host.textContent,
                '0-item-0. Message: Hello world from Aurelia.1-item-1. Message: Hello world from Aurelia.',
                'host.textContent@changed',
              );
            }
          ],
          // Same with previous. Though [repeat] + [replaceable] are on same element
          [
            [
              '[repeat] [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              '  [${}] <-- by interpolation binding from consumer'
            ].join('\n'),
            <div repeat$for="item of items" replaceable part="p0">{'${item.name}'}</div>,
            <foo>
              <template replace-part="p0">{'${item.idx}-${item.name}. Message: ${message}.'}</template>
            </foo>,
            createItems(2),
            `0-item-0. Message: Aurelia.1-item-1 Message: Aurelia.`,
            async (host, app, foo) => {
              app.message = 'Hello world from Aurelia';
              await Promise.resolve();
              assert.strictEqual(
                host.textContent,
                '0-item-0. Message: Hello world from Aurelia.1-item-1. Message: Hello world from Aurelia.',
                'host.textContent@changed',
              );
            }
          ],
          [
            [
              '[repeat]',
              '  [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              // note that we are not repeating this template, as it seems to be incorrect usage
              // if there are two replace-part aiming for 1 replaceable, which should be the right one?
              '  [template r#0]',
              '    [repeat] <-- by a repeat'
            ].join('\n'),
            <div repeat$for="item of items">
              <div replaceable part="p0">{'${item.name}'}</div>
            </div>,
            <foo>
              <template replace-part="p0">
                <template repeat$for="item of items">{'${item.idx}-${item.name}.'}</template>
              </template>
            </foo>,
            createItems(2),
            `0-item-0.1-item-1.0-item-0.1-item-1.`,
            async (host, app, foo) => {
              foo.items = createItems(3, 'ITEM');
              await Promise.resolve();
              assert.strictEqual(
                host.textContent,
                `0-ITEM-0.1-ITEM-1.2-ITEM-2.`.repeat(3),
                'host.textContent@changed',
              );

              foo.items = [];
              await Promise.resolve();
              assert.strictEqual(host.textContent, '', 'host.textContent@[]');

              foo.items.push(...createItems(1));
              await Promise.resolve();
              assert.strictEqual(host.textContent, '0-item-0.', 'host.textContent@[1]');

              foo.items.push(...createItems(2).slice(1));
              await Promise.resolve();
              assert.strictEqual(host.textContent, '0-item-0.1-item-1.', 'host.textContent@[1]');

              foo.items.sort((i1, i2) => i1.idx > i2.idx ? -1 : 1);
              await Promise.resolve();
              assert.strictEqual(host.textContent, '1-item-1.0-item-0.', 'host.textContent@[0🔁1]');
            }
          ],
          // Same with previous. Though [repeat] + [replaceable] are on same element
          [
            [
              '[repeat] [replaceable #0] << replace #0',
              '🔻',
              '[foo]',
              // note that we are not repeating this template, as it seems to be incorrect usage
              // if there are two replace-part aiming for 1 replaceable, which should be the right one?
              '  [template r#0]',
              '    [repeat] <-- by a repeat'
            ].join('\n'),
            <div repeat$for="item of items" replaceable part="p0">{'${item.name}'}</div>,
            <foo>
              <template replace-part="p0">
                <template repeat$for="item of items">{'${item.idx}-${item.name}.'}</template>
              </template>
            </foo>,
            createItems(2),
            `0-item-0.1-item-1.0-item-0.1-item-1.`,
            async (host, app, foo) => {
              foo.items = createItems(3, 'ITEM');
              await Promise.resolve();
              assert.strictEqual(
                host.textContent,
                `0-ITEM-0.1-ITEM-1.2-ITEM-2.`.repeat(3),
                'host.textContent@changed',
              );

              foo.items = [];
              await Promise.resolve();
              assert.strictEqual(host.textContent, '', 'host.textContent@[]');

              foo.items.push(...createItems(1));
              await Promise.resolve();
              assert.strictEqual(host.textContent, '0-item-0.', 'host.textContent@[1]');

              foo.items.push(...createItems(2).slice(1));
              await Promise.resolve();
              assert.strictEqual(host.textContent, '0-item-0.1-item-1.', 'host.textContent@[1]');

              foo.items.sort((i1, i2) => i1.idx > i2.idx ? -1 : 1);
              await Promise.resolve();
              assert.strictEqual(host.textContent, '1-item-1.0-item-0.', 'host.textContent@[0🔁1]');
            }
          ]
        ];
        for (
          const [
            testTitle,
            fooContentTemplate,
            appContentTemplate,
            fooItems,
            expectedTextContent,
            customAssertion
          ] of testCases
        ) {
          it(`\n----\n${testTitle}`, async function() {
            const Foo = CustomElementResource.define(
              { name: 'foo', template: <template>{fooContentTemplate}</template> },
              class Foo { items = fooItems }
            );
            const App = CustomElementResource.define(
              { name: 'app', template: <template>{appContentTemplate}</template> },
              class App { message = 'Aurelia' }
            );

            const ctx = TestContext.createHTMLTestContext();
            ctx.container.register(Foo);
            const au = new Aurelia(ctx.container);

            const host = ctx.createElement('div');
            const component = new App();

            au.app({ host, component });
            au.start();

            assert.strictEqual(host.textContent, expectedTextContent, `host.textContent`);
            if (customAssertion) {
              await customAssertion(host, component, component.$controller.controllers[0] as any as IFoo);
            }
            tearDown(au);
          });
        }

        interface IFoo {
          items: ITestItem[];
        }
        interface IApp {
          message: string;
        }
        type ICustomAssertion = (host: HTMLElement, app: IApp, foo: IFoo) => void;

        function createExpectedReplacementText(count: number, itemBaseName: string = 'item') {
          let text = '';
          for (let i = 0; count > i; ++i) {
            text += `replacement of ${i}-${itemBaseName}-${i}.`
          }
          return text;
        }
      });
    });
  });

  interface ITestItem {
    idx: number;
    name: string;
  }

  function tearDown(au: Aurelia) {
    au.stop();
    (au.root.host as Element).remove();
  }

  function createItems(count: number, baseName: string = 'item') {
    return Array.from({ length: count }, (_, idx) => {
      return { idx, name: `${baseName}-${idx}` }
    });
  }
});
