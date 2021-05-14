const dynoexpr = require('@tuplo/dynoexpr/cjs');

function getParams() {
  return dynoexpr({
    KeyCondition: { id: '567' },
    Condition: { rating: '> 4.5' },
    Filter: { color: 'blue' },
    Projection: ['weight', 'size'],
  });
}

module.exports = { getParams };
