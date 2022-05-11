import fetch from 'node-fetch';

test('sends invald back if bad id sent', async () => {
  const response = await fetch(
    `${process.env.TEST_HOST}/confirm/123456`
  );
  const text = await response.text();
  expect(text).toEqual('invalid');
});
