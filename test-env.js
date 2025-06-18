// Тестовый скрипт для проверки .env файла
require('dotenv').config();

console.log('=== .env File Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DB_NAME:', process.env.DB_NAME);

console.log('\n=== SMTP Variables ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[SET]' : '[NOT SET]');

console.log('\n=== AWS Variables ===');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '[SET]' : '[NOT SET]');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '[SET]' : '[NOT SET]');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);

console.log('\n=== OpenAI Variables ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '[SET]' : '[NOT SET]');

// Проверяем, какие SMTP переменные отсутствуют
const missingSmtpVars = [];
if (!process.env.SMTP_HOST) missingSmtpVars.push('SMTP_HOST');
if (!process.env.SMTP_PORT) missingSmtpVars.push('SMTP_PORT');
if (!process.env.SMTP_USER) missingSmtpVars.push('SMTP_USER');
if (!process.env.SMTP_PASS) missingSmtpVars.push('SMTP_PASS');

if (missingSmtpVars.length > 0) {
  console.log('\n❌ Missing SMTP variables:', missingSmtpVars.join(', '));
  console.log('Please add these to your .env file:');
  missingSmtpVars.forEach(varName => {
    console.log(`${varName}=your_value_here`);
  });
} else {
  console.log('\n✅ All SMTP variables are set!');
} 