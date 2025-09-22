#!/usr/bin/env node

/**
 * Generate secure secrets for production deployment
 */

const crypto = require('crypto')

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64')
}

console.log('🔐 Generating secure secrets for production...\n')

console.log('NEXTAUTH_SECRET (copy this to your .env.production):')
console.log(generateSecret(32))
console.log('\n')

console.log('Alternative NEXTAUTH_SECRET:')
console.log(generateSecret(32))
console.log('\n')

console.log('📋 Next steps:')
console.log('1. Copy one of the secrets above')
console.log('2. Set NEXTAUTH_SECRET in your .env.production file')
console.log('3. Set the same secret in your deployment platform (Vercel, Railway, etc.)')
console.log('4. Set NEXTAUTH_URL to your production domain')
console.log('5. Configure your production database URL')
console.log('\n')

console.log('⚠️  Keep these secrets secure and never commit them to git!')