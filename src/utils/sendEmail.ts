const SparkPost = require('sparkpost');

const client = new SparkPost(
  'c27b1aa031b8a11d8e6c9c05b78e243f6b32'
);

export const sendEmail = async (
  recipient: string,
  url: string
) => {
  const response = await client.transmissions
    .send({
      options: {
        sandbox: true,
      },
      content: {
        from: 'testing@sparkpostbox.com',
        subject: 'Confirm Email',
        html: `<html>
        <body>
        <p>Testing SparkPost - the world's most awesomest email service!</p>
        <a href="${url}">confirm email</a>
        </body>
        </html>`,
      },
      recipients: [{ address: recipient }],
    })
    .then((data: any) => {
      console.log(
        'Woohoo! You just sent your first mailing!'
      );
      console.log(data);
    })
    .catch((err: any) => {
      console.log('Whoops! Something went wrong');
      console.log(err);
    });
  console.log(response);
};
