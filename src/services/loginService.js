const errors = {
  emptyFild: { message: 'All fields must be filled'}
};

function validateEmail(email) {
  if (!email) return false;
  return true;
}

async function validateLogin(email, password) {
  if (!validateEmail(email)) return { error: errors.emptyFild };
}

module.exports = {
  validateLogin,
};
