import t from 'libtap';
import {testBrowser} from '@cfware/tap-selenium-manager';
import {FastifyTestHelper} from '@cfware/fastify-test-helper';

const pages = {
    async 'strings.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await selenium.executeScript(element => element.undefinable === undefined, element), true);
        t.equal(await selenium.executeScript(element => element.stringProp, element), 'String Prop');
        t.equal(await element.getText(), 'String Prop');

        const attribute = await selenium.executeScript(element => {
            element.stringProp = 'new value';

            return element.getAttribute('string-prop');
        }, element);

        t.equal(attribute, 'new value');

        await selenium.sleep(100);
        t.equal(await element.getText(), 'new value');

        t.equal(await selenium.executeScript(element => {
            element.stringProp = null;

            return element.hasAttribute('string-prop');
        }, element), false);

        t.equal(await selenium.executeScript(element => element.stringProp, element), 'String Prop');
        await selenium.sleep(100);
        t.equal(await element.getText(), 'String Prop');

        await selenium.executeScript(element => element.setAttribute('undefinable', 'test'), element);
        t.equal(await selenium.executeScript(element => element.undefinable, element), 'test');
        const property = await selenium.executeScript(element => {
            element.setAttribute('string-prop', 'reset it');

            return element.stringProp;
        }, element);
        t.equal(property, 'reset it');

        await selenium.sleep(100);
        t.equal(await element.getText(), 'reset it');

        t.equal(await selenium.executeScript(element => {
            element.stringProp = undefined;

            return element.hasAttribute('string-prop');
        }, element), false);

        t.equal(await selenium.executeScript(element => element.stringProp, element), 'String Prop');
        await selenium.sleep(100);
        t.equal(await element.getText(), 'String Prop');
    },

    async 'numbers.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await selenium.executeScript(element => element.numericProp, element), 5);
        t.equal(await element.getText(), '5');

        const attribute = await selenium.executeScript(element => {
            element.numericProp = 50;

            return element.getAttribute('numeric-prop');
        }, element);

        t.equal(attribute, '50');

        await selenium.sleep(100);
        t.equal(await element.getText(), '50');

        t.equal(await selenium.executeScript(element => {
            element.numericProp = null;

            return element.hasAttribute('numeric-prop');
        }, element), false);

        t.equal(await selenium.executeScript(element => element.numericProp, element), 5);
        await selenium.sleep(100);
        t.equal(await element.getText(), '5');

        const property = await selenium.executeScript(element => {
            element.setAttribute('numeric-prop', '500');

            return element.numericProp;
        }, element);
        t.equal(property, 500);

        await selenium.sleep(100);
        t.equal(await element.getText(), '500');

        t.equal(await selenium.executeScript(element => {
            element.numericProp = undefined;

            return element.hasAttribute('numeric-prop');
        }, element), false);

        t.equal(await selenium.executeScript(element => element.numericProp, element), 5);
        await selenium.sleep(100);
        t.equal(await element.getText(), '5');
    },

    async 'booleans.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await selenium.executeScript(element => element.booleanProp, element), false);
        t.equal(await element.getText(), 'false');

        const attribute = await selenium.executeScript(element => {
            element.booleanProp = true;

            return element.hasAttribute('boolean-prop');
        }, element);

        t.equal(attribute, true);

        await selenium.sleep(100);
        t.equal(await element.getText(), 'true');

        t.equal(await selenium.executeScript(element => {
            element.booleanProp = null;

            return element.hasAttribute('boolean-prop');
        }, element), false);

        t.equal(await selenium.executeScript(element => element.booleanProp, element), false);
        await selenium.sleep(100);
        t.equal(await element.getText(), 'false');

        t.equal(await selenium.executeScript(element => {
            element.setAttribute('boolean-prop', '');

            return element.booleanProp;
        }, element), true);

        await selenium.sleep(100);
        t.equal(await element.getText(), 'true');

        t.equal(await selenium.executeScript(element => {
            element.booleanProp = undefined;

            return element.hasAttribute('boolean-prop');
        }, element), false);

        t.equal(await selenium.executeScript(element => element.booleanProp, element), false);
        await selenium.sleep(100);
        t.equal(await element.getText(), 'false');

        t.ok(await selenium.executeScript(element => element.checkBooleanAttribute() === undefined, element), 'no arg');
        t.ok(await selenium.executeScript(element => element.checkBooleanAttribute('') === undefined, element), 'empty string');
        t.ok(await selenium.executeScript(element => element.checkBooleanAttribute(false) === undefined, element), 'false');
        t.ok(await selenium.executeScript(element => element.checkBooleanAttribute(true) === '', element), 'true');
        t.ok(await selenium.executeScript(element => element.checkBooleanAttribute('yes') === '', element), 'yes');
    },

    async 'meta-link.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});
        const getHref = () => selenium.executeScript(element => element.href, element);

        t.equal(await getHref(), 'http://localhost/index.css');

        await selenium.executeScript(element => {
            element.metaURL = 'http://localhost/test/test.html';
            element.url = 'page.html';
        }, element);

        t.equal(await getHref(), 'http://localhost/test/page.html');

        await selenium.executeScript(element => {
            element.url = '../index.html';
        }, element);
        t.equal(await getHref(), 'http://localhost/index.html');
    },

    async 'render-props.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await selenium.executeScript(element => element.prop1, element), 'property 1');
        t.same(await selenium.executeScript(element => element.prop2, element), [1, 2]);
        t.equal(await selenium.executeScript(element => element.renderCount, element), 1);

        await selenium.executeScript(element => {
            element.prop1 = 'yes';
        }, element);
        t.equal(await selenium.executeScript(element => element.prop1, element), 'yes');

        await selenium.sleep(100);
        t.equal(await selenium.executeScript(element => element.renderCount, element), 2);

        await selenium.executeScript(element => {
            element.prop2 = [false];
        }, element);
        t.same(await selenium.executeScript(element => element.prop2, element), [false]);

        await selenium.sleep(100);
        t.equal(await selenium.executeScript(element => element.renderCount, element), 3);
    },

    async 'events.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await selenium.executeScript(element => element.windowClicks, element), 0);
        t.equal(await selenium.executeScript(() => document.documentClicks), 0);
        t.equal(await selenium.executeScript(element => element.elementClicks, element), 0);

        await element.click();

        t.equal(await selenium.executeScript(element => element.windowClicks, element), 1);
        t.equal(await selenium.executeScript(() => document.documentClicks), 1);
        t.equal(await selenium.executeScript(element => element.elementClicks, element), 1);

        await selenium.executeScript(() => document.body.click());

        t.equal(await selenium.executeScript(element => element.windowClicks, element), 2);
        t.equal(await selenium.executeScript(() => document.documentClicks), 2);
        t.equal(await selenium.executeScript(element => element.elementClicks, element), 1);

        t.equal(await selenium.executeScript(element => element.keyPresses, element), 0);
        await element.sendKeys('a');
        t.equal(await selenium.executeScript(element => element.keyPresses, element), 1);

        await selenium.executeScript(() => {
            document.body.innerHTML = '';
            document.body.click();
        });

        t.equal(await selenium.executeScript(() => document.windowClicks), 2);
        t.equal(await selenium.executeScript(() => document.documentClicks), 2);
    },

    async 'no-options.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await element.getText(), 'No Options');
    },

    async 'css.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await element.getCssValue('height'), '10px');
        t.equal(await element.getCssValue('min-height'), '5px');

        await selenium.executeScript(element => element.taller(), element);
        t.equal(await element.getCssValue('width'), '10px');
        t.equal(await element.getCssValue('height'), '20px');
    },

    async 'css-no-adoption.html'(t, selenium) {
        const element = await selenium.findElement({id: 'test'});

        t.equal(await element.getCssValue('height'), '10px');
        t.equal(await element.getCssValue('min-height'), '5px');

        await selenium.executeScript(element => element.taller(), element);
        t.equal(await element.getCssValue('width'), '10px');
        t.equal(await element.getCssValue('height'), '20px');
    }
};

const daemon = new FastifyTestHelper({
    customGetters: {
        '/shadow-element.js': 'shadow-element.js'
    }
});

t.test('browsers', async t => {
    await testBrowser(t, 'firefox', daemon, pages);
    await testBrowser(t, 'chrome', daemon, pages);
});
