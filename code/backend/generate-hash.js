const bcrypt = require('bcrypt');

const passwords = ['admin123', 'user123'];
const saltRounds = 10;

(async () => {
  for (const pwd of passwords) {
    const hash = await bcrypt.hash(pwd, saltRounds);
    console.log(`Mot de passe: ${pwd}\nHash: ${hash}\n`);
  }
})();
