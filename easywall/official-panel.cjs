'use strict';

// Keep credentials/query strings off the redirect. The product has its own login.
module.exports = function officialPanel(target) {
    const url = new URL(target);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('Invalid Easywall Control Room URL');
    }
    return function redirectLegacyPanel(req, res) {
        res.set('Cache-Control', 'no-store');
        res.redirect(303, url.href);
    };
};
