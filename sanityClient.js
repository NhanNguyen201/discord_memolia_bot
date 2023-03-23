// Import using ESM URL imports in environments that supports it:
// import {createClient} from 'https://esm.sh/@sanity/client'
const { createClient } = require('@sanity/client')
module.exports.postClient = createClient({
    projectId: process.env.SANITY_PRJ_ID,
    dataset: 'production',
    useCdn: false, // set to `true` to fetch from edge cache
    apiVersion: '2023-02-22', // use current date (YYYY-MM-DD) to target the latest API version
    token: process.env.SANITY_KEY
})