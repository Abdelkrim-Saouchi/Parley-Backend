const generateVerificationCode = () => {
  return Math.ceil(Math.random() * 1000000);
};

module.exports = generateVerificationCode;
