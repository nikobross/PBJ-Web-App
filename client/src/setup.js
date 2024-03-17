const fs = require('fs');

const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
  // ...
];

fs.writeFile('users.json', JSON.stringify(users), (err) => {
  if (err) throw err;
  console.log('Data written to file');
});