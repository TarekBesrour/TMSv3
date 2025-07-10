const bcrypt = require('bcrypt');

const passwords = ['admin789', 'user789'];
const saltRounds = 10;

(async () => {
  for (const pwd of passwords) {
    const hash = await bcrypt.hash(pwd, saltRounds);
    console.log(`Mot de passe: ${pwd}\nHash: ${hash}\n`);
  }
})();
