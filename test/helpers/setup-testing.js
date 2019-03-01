import {setup, page} from '@cfware/ava-selenium-manager';
import {FastifyTestHelper} from '@cfware/fastify-test-helper';
import {Key} from 'selenium-webdriver/lib/input';

page('strings.html', async t => {
	const {selenium, checkText} = t.context;
	const ele = await selenium.findElement({id: 'test'});

	t.is(await selenium.executeScript(ele => ele.stringProp, ele), 'String Prop');
	checkText(ele, 'String Prop');

	const attr = await selenium.executeScript(ele => {
		ele.stringProp = 'new value';

		return ele.getAttribute('string-prop');
	}, ele);

	t.is(attr, 'new value');

	await selenium.sleep(50);
	checkText(ele, 'new value');

	t.false(await selenium.executeScript(ele => {
		ele.stringProp = null;

		return ele.hasAttribute('string-prop');
	}, ele));

	t.is(await selenium.executeScript(ele => ele.stringProp, ele), 'String Prop');
	await selenium.sleep(50);
	checkText(ele, 'String Prop');

	const prop = await selenium.executeScript(ele => {
		ele.setAttribute('string-prop', 'reset it');

		return ele.stringProp;
	}, ele);
	t.is(prop, 'reset it');

	await selenium.sleep(50);
	checkText(ele, 'reset it');

	t.false(await selenium.executeScript(ele => {
		ele.stringProp = undefined;

		return ele.hasAttribute('string-prop');
	}, ele));

	t.is(await selenium.executeScript(ele => ele.stringProp, ele), 'String Prop');
	await selenium.sleep(50);
	checkText(ele, 'String Prop');
});

page('numbers.html', async t => {
	const {selenium, checkText} = t.context;
	const ele = await selenium.findElement({id: 'test'});

	t.is(await selenium.executeScript(ele => ele.numericProp, ele), 5);
	checkText(ele, '5');

	const attr = await selenium.executeScript(ele => {
		ele.numericProp = 50;

		return ele.getAttribute('numeric-prop');
	}, ele);

	t.is(attr, '50');

	await selenium.sleep(50);
	checkText(ele, '50');

	t.false(await selenium.executeScript(ele => {
		ele.numericProp = null;

		return ele.hasAttribute('numeric-prop');
	}, ele));

	t.is(await selenium.executeScript(ele => ele.numericProp, ele), 5);
	await selenium.sleep(50);
	checkText(ele, '5');

	const prop = await selenium.executeScript(ele => {
		ele.setAttribute('numeric-prop', '500');

		return ele.numericProp;
	}, ele);
	t.is(prop, 500);

	await selenium.sleep(50);
	checkText(ele, '500');

	t.false(await selenium.executeScript(ele => {
		ele.numericProp = undefined;

		return ele.hasAttribute('numeric-prop');
	}, ele));

	t.is(await selenium.executeScript(ele => ele.numericProp, ele), 5);
	await selenium.sleep(50);
	checkText(ele, '5');
});

page('booleans.html', async t => {
	const {selenium, checkText} = t.context;
	const ele = await selenium.findElement({id: 'test'});

	t.false(await selenium.executeScript(ele => ele.booleanProp, ele));
	checkText(ele, 'false');

	const attr = await selenium.executeScript(ele => {
		ele.booleanProp = true;

		return ele.hasAttribute('boolean-prop');
	}, ele);

	t.true(attr);

	await selenium.sleep(50);
	checkText(ele, 'true');

	t.false(await selenium.executeScript(ele => {
		ele.booleanProp = null;

		return ele.hasAttribute('boolean-prop');
	}, ele));

	t.false(await selenium.executeScript(ele => ele.booleanProp, ele));
	await selenium.sleep(50);
	checkText(ele, 'false');

	t.true(await selenium.executeScript(ele => {
		ele.setAttribute('boolean-prop', '');

		return ele.booleanProp;
	}, ele));

	await selenium.sleep(50);
	checkText(ele, 'true');

	t.false(await selenium.executeScript(ele => {
		ele.booleanProp = undefined;

		return ele.hasAttribute('boolean-prop');
	}, ele));

	t.false(await selenium.executeScript(ele => ele.booleanProp, ele));
	await selenium.sleep(50);
	checkText(ele, 'false');
});

page('button.html', async t => {
	const {selenium} = t.context;
	const ele = await selenium.findElement({id: 'test'});
	const disabledAttrs = {
		disabled: true,
		tabindex: null,
		role: 'button'
	};
	const enabledAttrs = {
		disabled: false,
		tabindex: '0',
		role: 'button'
	};
	const renderCount = () => selenium.executeScript(ele => ele.renderCount, ele);
	const clickCount = () => selenium.executeScript(ele => ele.clickCount, ele);
	const isDisabled = () => selenium.executeScript(ele => ele.disabled, ele);
	const getAttributes = (elem = ele) => selenium.executeScript(ele => {
		return {
			disabled: ele.hasAttribute('disabled'),
			tabindex: ele.hasAttribute('tabindex') ? ele.getAttribute('tabindex') : null,
			role: ele.getAttribute('role')
		};
	}, elem);

	t.is(await selenium.executeScript(ele => ele.myProp, ele), 'my value');
	t.is(await renderCount(), 1);
	t.is(await clickCount(), 0);

	t.false(await isDisabled());
	t.deepEqual(await getAttributes(), enabledAttrs);

	await ele.click();
	t.is(await clickCount(), 1);

	await ele.sendKeys(Key.ENTER);
	t.is(await clickCount(), 2);

	await ele.sendKeys(Key.RETURN);
	t.is(await clickCount(), 3);

	await ele.sendKeys(' ');
	t.is(await clickCount(), 4);

	const alpha = 'abcdefghijklmnopqrstuvwxyz';
	await ele.sendKeys(alpha + alpha.toUpperCase() + '0123456789`~!@#$%^&*()_+-=[]{}\\|;:\'",./<>?');
	t.is(await clickCount(), 4);

	await selenium.executeScript(ele => {
		ele.disabled = true;
	}, ele);

	await ele.click();
	t.is(await clickCount(), 4);

	t.true(await isDisabled());
	t.deepEqual(await getAttributes(), disabledAttrs);

	await selenium.sleep(50);
	t.is(await renderCount(), 2);

	await selenium.executeScript(ele => {
		ele.disabled = false;
	}, ele);

	await ele.click();
	t.is(await clickCount(), 5);

	t.false(await isDisabled());
	t.deepEqual(await getAttributes(), enabledAttrs);

	await selenium.sleep(50);
	t.is(await renderCount(), 3);

	// Verify it doesn't touch the attributes.
	await selenium.executeScript(ele => {
		ele.disabled = false;
	}, ele);

	await selenium.sleep(50);
	t.is(await renderCount(), 3);

	const test2 = await selenium.findElement({id: 'test2'});
	t.deepEqual(await getAttributes(test2), disabledAttrs);
});

page('meta-link.html', async t => {
	const {selenium} = t.context;
	const ele = await selenium.findElement({id: 'test'});
	const getHref = () => selenium.executeScript(ele => ele.href, ele);

	t.is(await getHref(), 'http://localhost/index.css');

	await selenium.executeScript(ele => {
		ele.metaURL = 'http://localhost/test/test.html';
		ele.url = 'page.html';
	}, ele);

	t.is(await getHref(), 'http://localhost/test/page.html');

	await selenium.executeScript(ele => {
		ele.url = '../index.html';
	}, ele);
	t.is(await getHref(), 'http://localhost/index.html');
});

page('render-props.html', async t => {
	const {selenium} = t.context;
	const ele = await selenium.findElement({id: 'test'});

	t.is(await selenium.executeScript(ele => ele.prop1, ele), 'property 1');
	t.deepEqual(await selenium.executeScript(ele => ele.prop2, ele), [1, 2]);
	t.is(await selenium.executeScript(ele => ele.renderCount, ele), 1);

	await selenium.executeScript(ele => {
		ele.prop1 = 'yes';
	}, ele);
	t.is(await selenium.executeScript(ele => ele.prop1, ele), 'yes');

	await selenium.sleep(50);
	t.is(await selenium.executeScript(ele => ele.renderCount, ele), 2);

	await selenium.executeScript(ele => {
		ele.prop2 = [false];
	}, ele);
	t.deepEqual(await selenium.executeScript(ele => ele.prop2, ele), [false]);

	await selenium.sleep(50);
	t.is(await selenium.executeScript(ele => ele.renderCount, ele), 3);
});

export function setupTesting(browserBuilder) {
	setup(new FastifyTestHelper(browserBuilder, {
		customGetters: {
			'/shadow-element.js': 'shadow-element.js'
		}
	}));
}
